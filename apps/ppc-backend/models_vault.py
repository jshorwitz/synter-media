from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

Base = declarative_base()


class PlatformType(str, enum.Enum):
    GOOGLE_ADS = "google_ads"
    MICROSOFT_ADS = "microsoft_ads"
    LINKEDIN_ADS = "linkedin_ads"
    REDDIT_ADS = "reddit_ads"


class ConnectionStatus(str, enum.Enum):
    ACTIVE = "active"
    REVOKED = "revoked"
    ERROR = "error"
    EXPIRED = "expired"


class Platform(Base):
    __tablename__ = "platforms"

    id = Column(String(36), primary_key=True)
    name = Column(SQLEnum(PlatformType), nullable=False, unique=True)
    auth_url = Column(String(500))
    token_url = Column(String(500))
    scopes_default = Column(JSON)
    api_base_url = Column(String(500))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    oauth_app_credentials = relationship("OAuthAppCredential", back_populates="platform")
    ad_account_connections = relationship("AdAccountConnection", back_populates="platform")


class OAuthAppCredential(Base):
    __tablename__ = "oauth_app_credentials"

    id = Column(String(36), primary_key=True)
    platform_id = Column(String(36), ForeignKey("platforms.id"), nullable=False)
    label = Column(String(255), nullable=False)
    
    client_id = Column(String(500), nullable=False)
    client_secret_ciphertext = Column(Text, nullable=False)
    redirect_uri = Column(String(500), nullable=False)
    scopes = Column(JSON)
    
    developer_token_ciphertext = Column(Text)
    login_customer_id = Column(String(50))
    
    is_active = Column(Boolean, default=True)
    rotation_group = Column(String(100))
    metadata = Column(JSON)
    
    created_by = Column(String(100))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    platform = relationship("Platform", back_populates="oauth_app_credentials")
    ad_account_connections = relationship("AdAccountConnection", back_populates="oauth_app_credential")


class AdAccountConnection(Base):
    __tablename__ = "ad_account_connections"

    id = Column(String(36), primary_key=True)
    platform_id = Column(String(36), ForeignKey("platforms.id"), nullable=False)
    oauth_app_credentials_id = Column(String(36), ForeignKey("oauth_app_credentials.id"), nullable=False)
    
    external_account_id = Column(String(100), nullable=False)
    account_name = Column(String(255))
    tenant_id = Column(String(100))
    
    manager_customer_id = Column(String(50))
    organization_id = Column(String(100))
    
    status = Column(SQLEnum(ConnectionStatus), default=ConnectionStatus.ACTIVE)
    status_message = Column(Text)
    
    connected_by = Column(String(100))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    platform = relationship("Platform", back_populates="ad_account_connections")
    oauth_app_credential = relationship("OAuthAppCredential", back_populates="ad_account_connections")
    oauth_tokens = relationship("OAuthTokenVault", back_populates="ad_account_connection", uselist=False)


class OAuthTokenVault(Base):
    __tablename__ = "oauth_tokens_vault"

    id = Column(String(36), primary_key=True)
    ad_account_connection_id = Column(String(36), ForeignKey("ad_account_connections.id"), nullable=False, unique=True)
    
    access_token_ciphertext = Column(Text, nullable=False)
    refresh_token_ciphertext = Column(Text, nullable=False)
    token_type = Column(String(50), default="Bearer")
    scope = Column(Text)
    
    expires_at = Column(DateTime, nullable=False)
    obtained_at = Column(DateTime, default=func.now())
    last_refresh_at = Column(DateTime)
    refresh_attempts = Column(Integer, default=0)
    
    provider_metadata = Column(JSON)
    revoked_at = Column(DateTime)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    ad_account_connection = relationship("AdAccountConnection", back_populates="oauth_tokens")


class CredentialAccessAudit(Base):
    __tablename__ = "credential_access_audit"

    id = Column(String(36), primary_key=True)
    subject = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(36), nullable=False)
    success = Column(Boolean, nullable=False)
    metadata = Column(JSON)
    ip_address = Column(String(64))
    user_agent = Column(String(500))
    created_at = Column(DateTime, default=func.now())
