-- OAuth connections and ad accounts tables

CREATE TABLE IF NOT EXISTS oauth_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  display_name TEXT,
  scopes TEXT[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'connected', -- connected, pending, needs_reauth, disconnected
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider, provider_user_id)
);

CREATE TABLE IF NOT EXISTS oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES oauth_connections(id) ON DELETE CASCADE,
  access_token_enc BYTEA NOT NULL,
  refresh_token_enc BYTEA,
  token_type TEXT NOT NULL DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ,
  obtained_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES oauth_connections(id) ON DELETE CASCADE,
  external_account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  currency TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, paused, closed
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,
  UNIQUE(connection_id, external_account_id)
);

CREATE INDEX idx_oauth_connections_user ON oauth_connections(user_id);
CREATE INDEX idx_oauth_connections_status ON oauth_connections(status);
CREATE INDEX idx_oauth_tokens_connection ON oauth_tokens(connection_id);
CREATE INDEX idx_ad_accounts_connection ON ad_accounts(connection_id);
