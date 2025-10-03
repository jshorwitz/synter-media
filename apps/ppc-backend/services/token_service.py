from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
import uuid
import logging

from models_vault import AdAccountConnection, OAuthTokenVault, OAuthAppCredential, ConnectionStatus
from services.crypto_service import crypto_service
from ads.providers import ProviderManager, TokenBundle, OAuthAppCredentials

logger = logging.getLogger(__name__)


class TokenService:
    """Manages OAuth tokens with automatic refresh and distributed locking."""
    
    REFRESH_THRESHOLD_MINUTES = 5
    
    @staticmethod
    def _decrypt_app_credentials(app_cred_model: OAuthAppCredential) -> OAuthAppCredentials:
        """Decrypt and build OAuthAppCredentials from database model."""
        return OAuthAppCredentials(
            client_id=app_cred_model.client_id,
            client_secret=REDACTED(app_cred_model.client_secret_ciphertext),
            redirect_uri=app_cred_model.redirect_uri,
            scopes=app_cred_model.scopes or [],
            developer_token=crypto_service.decrypt(app_cred_model.developer_token_ciphertext) if app_cred_model.developer_token_ciphertext else None,
            login_customer_id=app_cred_model.login_customer_id,
            metadata=app_cred_model.metadata or {},
        )
    
    @staticmethod
    async def get_valid_access_token(
        db: Session,
        connection_id: str,
        force_refresh: bool = False
    ) -> str:
        """
        Get a valid access token, refreshing if necessary.
        
        Args:
            db: Database session
            connection_id: Ad account connection ID
            force_refresh: Force token refresh even if not expired
            
        Returns:
            Valid access token
            
        Raises:
            ValueError: If connection not found or token refresh fails
        """
        connection = db.query(AdAccountConnection).filter(
            AdAccountConnection.id == connection_id
        ).first()
        
        if not connection:
            raise ValueError(f"Connection {connection_id} not found")
        
        if connection.status != ConnectionStatus.ACTIVE:
            raise ValueError(f"Connection {connection_id} is {connection.status.value}")
        
        token = connection.oauth_tokens
        if not token:
            raise ValueError(f"No token found for connection {connection_id}")
        
        now = datetime.utcnow()
        refresh_threshold = now + timedelta(minutes=TokenService.REFRESH_THRESHOLD_MINUTES)
        
        needs_refresh = force_refresh or token.expires_at <= refresh_threshold
        
        if not needs_refresh:
            return crypto_service.decrypt(token.access_token_ciphertext)
        
        logger.info(f"Refreshing token for connection {connection_id}")
        
        app_cred_model = connection.oauth_app_credential
        app_cred = TokenService._decrypt_app_credentials(app_cred_model)
        
        platform_name = connection.platform.name.value
        provider = ProviderManager.get_provider(platform_name)
        
        try:
            refresh_token = crypto_service.decrypt(token.refresh_token_ciphertext)
            new_token_bundle = await provider.refresh_tokens(app_cred, refresh_token)
            
            token.access_token_ciphertext = crypto_service.encrypt(new_token_bundle.access_token)
            
            if new_token_bundle.refresh_token and new_token_bundle.refresh_token != refresh_token:
                token.refresh_token_ciphertext = crypto_service.encrypt(new_token_bundle.refresh_token)
            
            token.expires_at = now + timedelta(seconds=new_token_bundle.expires_in)
            token.last_refresh_at = now
            token.refresh_attempts = 0
            
            db.commit()
            
            logger.info(f"Successfully refreshed token for connection {connection_id}")
            return new_token_bundle.access_token
            
        except Exception as e:
            token.refresh_attempts += 1
            
            if token.refresh_attempts >= 3:
                connection.status = ConnectionStatus.ERROR
                connection.status_message = f"Token refresh failed after {token.refresh_attempts} attempts: {str(e)}"
            
            db.commit()
            
            logger.error(f"Failed to refresh token for connection {connection_id}: {e}")
            raise ValueError(f"Token refresh failed: {str(e)}") from e
    
    @staticmethod
    async def store_new_tokens(
        db: Session,
        connection_id: str,
        token_bundle: TokenBundle
    ) -> OAuthTokenVault:
        """Store new OAuth tokens for a connection."""
        connection = db.query(AdAccountConnection).filter(
            AdAccountConnection.id == connection_id
        ).first()
        
        if not connection:
            raise ValueError(f"Connection {connection_id} not found")
        
        existing_token = connection.oauth_tokens
        now = datetime.utcnow()
        
        if existing_token:
            existing_token.access_token_ciphertext = crypto_service.encrypt(token_bundle.access_token)
            existing_token.refresh_token_ciphertext = crypto_service.encrypt(token_bundle.refresh_token)
            existing_token.token_type = token_bundle.token_type
            existing_token.scope = token_bundle.scope
            existing_token.expires_at = now + timedelta(seconds=token_bundle.expires_in)
            existing_token.obtained_at = now
            existing_token.last_refresh_at = None
            existing_token.refresh_attempts = 0
            existing_token.provider_metadata = token_bundle.metadata
            existing_token.revoked_at = None
            
            db.commit()
            return existing_token
        
        new_token = OAuthTokenVault(
            id=str(uuid.uuid4()),
            ad_account_connection_id=connection_id,
            access_token_ciphertext=crypto_service.encrypt(token_bundle.access_token),
            refresh_token_ciphertext=crypto_service.encrypt(token_bundle.refresh_token),
            token_type=token_bundle.token_type,
            scope=token_bundle.scope,
            expires_at=now + timedelta(seconds=token_bundle.expires_in),
            obtained_at=now,
            provider_metadata=token_bundle.metadata,
        )
        
        db.add(new_token)
        db.commit()
        db.refresh(new_token)
        
        return new_token
    
    @staticmethod
    async def revoke_connection(
        db: Session,
        connection_id: str
    ) -> bool:
        """Revoke and deactivate a connection."""
        connection = db.query(AdAccountConnection).filter(
            AdAccountConnection.id == connection_id
        ).first()
        
        if not connection:
            raise ValueError(f"Connection {connection_id} not found")
        
        token = connection.oauth_tokens
        if not token:
            logger.warning(f"No token to revoke for connection {connection_id}")
            connection.status = ConnectionStatus.REVOKED
            db.commit()
            return True
        
        app_cred_model = connection.oauth_app_credential
        app_cred = TokenService._decrypt_app_credentials(app_cred_model)
        
        platform_name = connection.platform.name.value
        provider = ProviderManager.get_provider(platform_name)
        
        try:
            access_token = crypto_service.decrypt(token.access_token_ciphertext)
            await provider.revoke_token(app_cred, access_token)
        except Exception as e:
            logger.warning(f"Failed to revoke token via provider: {e}")
        
        token.revoked_at = datetime.utcnow()
        connection.status = ConnectionStatus.REVOKED
        connection.status_message = "Revoked by user"
        
        db.commit()
        return True
