"""Add credential vault tables

Revision ID: 001_credential_vault
Revises: 
Create Date: 2025-10-02

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001_credential_vault'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'platforms',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.Enum('google_ads', 'microsoft_ads', 'linkedin_ads', 'reddit_ads', name='platformtype'), nullable=False, unique=True),
        sa.Column('auth_url', sa.String(500)),
        sa.Column('token_url', sa.String(500)),
        sa.Column('scopes_default', sa.JSON()),
        sa.Column('api_base_url', sa.String(500)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('NOW()'), onupdate=sa.text('NOW()')),
    )
    
    op.create_table(
        'oauth_app_credentials',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('platform_id', sa.String(36), sa.ForeignKey('platforms.id'), nullable=False),
        sa.Column('label', sa.String(255), nullable=False),
        sa.Column('client_id', sa.String(500), nullable=False),
        sa.Column('client_secret_ciphertext', sa.Text(), nullable=False),
        sa.Column('redirect_uri', sa.String(500), nullable=False),
        sa.Column('scopes', sa.JSON()),
        sa.Column('developer_token_ciphertext', sa.Text()),
        sa.Column('login_customer_id', sa.String(50)),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('rotation_group', sa.String(100)),
        sa.Column('metadata', sa.JSON()),
        sa.Column('created_by', sa.String(100)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('NOW()'), onupdate=sa.text('NOW()')),
    )
    
    op.create_table(
        'ad_account_connections',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('platform_id', sa.String(36), sa.ForeignKey('platforms.id'), nullable=False),
        sa.Column('oauth_app_credentials_id', sa.String(36), sa.ForeignKey('oauth_app_credentials.id'), nullable=False),
        sa.Column('external_account_id', sa.String(100), nullable=False),
        sa.Column('account_name', sa.String(255)),
        sa.Column('tenant_id', sa.String(100)),
        sa.Column('manager_customer_id', sa.String(50)),
        sa.Column('organization_id', sa.String(100)),
        sa.Column('status', sa.Enum('active', 'revoked', 'error', 'expired', name='connectionstatus'), default='active'),
        sa.Column('status_message', sa.Text()),
        sa.Column('connected_by', sa.String(100)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('NOW()'), onupdate=sa.text('NOW()')),
    )
    
    op.create_table(
        'oauth_tokens_vault',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('ad_account_connection_id', sa.String(36), sa.ForeignKey('ad_account_connections.id'), nullable=False, unique=True),
        sa.Column('access_token_ciphertext', sa.Text(), nullable=False),
        sa.Column('refresh_token_ciphertext', sa.Text(), nullable=False),
        sa.Column('token_type', sa.String(50), default='Bearer'),
        sa.Column('scope', sa.Text()),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('obtained_at', sa.DateTime(), server_default=sa.text('NOW()')),
        sa.Column('last_refresh_at', sa.DateTime()),
        sa.Column('refresh_attempts', sa.Integer(), default=0),
        sa.Column('provider_metadata', sa.JSON()),
        sa.Column('revoked_at', sa.DateTime()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('NOW()'), onupdate=sa.text('NOW()')),
    )
    
    op.create_table(
        'credential_access_audit',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('subject', sa.String(255), nullable=False),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('resource_type', sa.String(50), nullable=False),
        sa.Column('resource_id', sa.String(36), nullable=False),
        sa.Column('success', sa.Boolean(), nullable=False),
        sa.Column('metadata', sa.JSON()),
        sa.Column('ip_address', sa.String(64)),
        sa.Column('user_agent', sa.String(500)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()')),
    )
    
    op.create_index('idx_connections_platform', 'ad_account_connections', ['platform_id'])
    op.create_index('idx_connections_status', 'ad_account_connections', ['status'])
    op.create_index('idx_tokens_expires', 'oauth_tokens_vault', ['expires_at'])


def downgrade():
    op.drop_index('idx_tokens_expires')
    op.drop_index('idx_connections_status')
    op.drop_index('idx_connections_platform')
    
    op.drop_table('credential_access_audit')
    op.drop_table('oauth_tokens_vault')
    op.drop_table('ad_account_connections')
    op.drop_table('oauth_app_credentials')
    op.drop_table('platforms')
    
    op.execute('DROP TYPE IF EXISTS connectionstatus')
    op.execute('DROP TYPE IF EXISTS platformtype')
