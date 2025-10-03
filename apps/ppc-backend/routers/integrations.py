from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
import secrets

from database import get_db
from models_vault import (
    Platform,
    OAuthAppCredential,
    AdAccountConnection,
    OAuthTokenVault,
    PlatformType,
    ConnectionStatus
)
from services.crypto_service import crypto_service
from services.token_service import TokenService
from ads.providers import ProviderManager, OAuthAppCredentials

router = APIRouter(prefix="/integrations", tags=["integrations"])


class CreateOAuthAppRequest(BaseModel):
    label: str
    client_id: str
    client_secret=REDACTED
    redirect_uri: str
    scopes: Optional[List[str]] = None
    developer_token: Optional[str] = None
    login_customer_id: Optional[str] = None


class OAuthAppResponse(BaseModel):
    id: str
    platform: str
    label: str
    client_id: str
    redirect_uri: str
    scopes: List[str]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class StartConnectionRequest(BaseModel):
    app_id: Optional[str] = None


class StartConnectionResponse(BaseModel):
    authorize_url: str
    state: str


class ConnectionResponse(BaseModel):
    id: str
    platform: str
    external_account_id: str
    account_name: Optional[str]
    status: str
    created_at: datetime
    expires_at: Optional[datetime]
    
    class Config:
        from_attributes = True


@router.post("/{platform}/apps", response_model=OAuthAppResponse)
def create_oauth_app(
    platform: str,
    request: CreateOAuthAppRequest,
    db: Session = Depends(get_db)
):
    """Create OAuth app credentials for a platform (admin only)."""
    platform_record = db.query(Platform).filter(
        Platform.name == PlatformType(platform)
    ).first()
    
    if not platform_record:
        raise HTTPException(404, f"Platform {platform} not found")
    
    app_cred = OAuthAppCredential(
        id=str(uuid.uuid4()),
        platform_id=platform_record.id,
        label=request.label,
        client_id=request.client_id,
        client_secret_ciphertext=crypto_service.encrypt(request.client_secret),
        redirect_uri=request.redirect_uri,
        scopes=request.scopes,
        developer_token_ciphertext=crypto_service.encrypt(request.developer_token) if request.developer_token else None,
        login_customer_id=request.login_customer_id,
        is_active=True,
        created_by="admin",
    )
    
    db.add(app_cred)
    db.commit()
    db.refresh(app_cred)
    
    return OAuthAppResponse(
        id=app_cred.id,
        platform=platform_record.name.value,
        label=app_cred.label,
        client_id=app_cred.client_id,
        redirect_uri=app_cred.redirect_uri,
        scopes=app_cred.scopes or [],
        is_active=app_cred.is_active,
        created_at=app_cred.created_at,
    )


@router.get("/{platform}/apps", response_model=List[OAuthAppResponse])
def list_oauth_apps(
    platform: str,
    db: Session = Depends(get_db)
):
    """List OAuth app credentials for a platform."""
    platform_record = db.query(Platform).filter(
        Platform.name == PlatformType(platform)
    ).first()
    
    if not platform_record:
        raise HTTPException(404, f"Platform {platform} not found")
    
    apps = db.query(OAuthAppCredential).filter(
        OAuthAppCredential.platform_id == platform_record.id
    ).all()
    
    return [
        OAuthAppResponse(
            id=app.id,
            platform=platform_record.name.value,
            label=app.label,
            client_id=app.client_id,
            redirect_uri=app.redirect_uri,
            scopes=app.scopes or [],
            is_active=app.is_active,
            created_at=app.created_at,
        )
        for app in apps
    ]


@router.post("/{platform}/connections/start", response_model=StartConnectionResponse)
def start_connection(
    platform: str,
    request: StartConnectionRequest,
    db: Session = Depends(get_db)
):
    """Start OAuth connection flow for an ad account."""
    platform_record = db.query(Platform).filter(
        Platform.name == PlatformType(platform)
    ).first()
    
    if not platform_record:
        raise HTTPException(404, f"Platform {platform} not found")
    
    if request.app_id:
        app_cred_model = db.query(OAuthAppCredential).filter(
            OAuthAppCredential.id == request.app_id,
            OAuthAppCredential.platform_id == platform_record.id
        ).first()
    else:
        app_cred_model = db.query(OAuthAppCredential).filter(
            OAuthAppCredential.platform_id == platform_record.id,
            OAuthAppCredential.is_active == True
        ).first()
    
    if not app_cred_model:
        raise HTTPException(404, "No active OAuth app found for this platform")
    
    app_cred = OAuthAppCredentials(
        client_id=app_cred_model.client_id,
        client_secret=REDACTED(app_cred_model.client_secret_ciphertext),
        redirect_uri=app_cred_model.redirect_uri,
        scopes=app_cred_model.scopes or [],
    )
    
    provider = ProviderManager.get_provider(platform)
    state = secrets.token_urlsafe(32)
    
    authorize_url = provider.get_authorize_url(app_cred, state)
    
    return StartConnectionResponse(
        authorize_url=authorize_url,
        state=state
    )


@router.get("/{platform}/connections", response_model=List[ConnectionResponse])
def list_connections(
    platform: str,
    db: Session = Depends(get_db)
):
    """List all ad account connections for a platform."""
    platform_record = db.query(Platform).filter(
        Platform.name == PlatformType(platform)
    ).first()
    
    if not platform_record:
        raise HTTPException(404, f"Platform {platform} not found")
    
    connections = db.query(AdAccountConnection).filter(
        AdAccountConnection.platform_id == platform_record.id
    ).all()
    
    return [
        ConnectionResponse(
            id=conn.id,
            platform=platform_record.name.value,
            external_account_id=conn.external_account_id,
            account_name=conn.account_name,
            status=conn.status.value,
            created_at=conn.created_at,
            expires_at=conn.oauth_tokens.expires_at if conn.oauth_tokens else None,
        )
        for conn in connections
    ]


@router.post("/{platform}/connections/{connection_id}/refresh")
async def refresh_connection_token(
    platform: str,
    connection_id: str,
    db: Session = Depends(get_db)
):
    """Manually refresh token for a connection."""
    try:
        access_token = await TokenService.get_valid_access_token(db, connection_id, force_refresh=True)
        return {
            "status": "success",
            "message": "Token refreshed successfully",
            "expires_at": db.query(OAuthTokenVault).filter(
                OAuthTokenVault.ad_account_connection_id == connection_id
            ).first().expires_at.isoformat()
        }
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/{platform}/connections/{connection_id}/revoke")
async def revoke_connection(
    platform: str,
    connection_id: str,
    db: Session = Depends(get_db)
):
    """Revoke and deactivate a connection."""
    try:
        success = await TokenService.revoke_connection(db, connection_id)
        return {
            "status": "success" if success else "error",
            "message": "Connection revoked"
        }
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.get("/{platform}/capabilities")
def get_platform_capabilities(platform: str):
    """Get capabilities for a specific platform."""
    try:
        capabilities = ProviderManager.get_capabilities(platform)
        return {
            "platform": platform,
            "capabilities": capabilities
        }
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.get("/platforms")
def list_platforms():
    """List all available platforms."""
    platforms = ProviderManager.list_platforms()
    return {
        "platforms": [
            {
                "name": p,
                "capabilities": ProviderManager.get_capabilities(p)
            }
            for p in platforms
        ]
    }
