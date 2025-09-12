CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(320) UNIQUE NOT NULL,
  password_hash VARCHAR(255),         -- null if passwordless only
  name VARCHAR(128),
  role ENUM('admin','analyst','viewer') DEFAULT 'viewer',
  created_at DATETIME(6) NOT NULL DEFAULT NOW(6),
  updated_at DATETIME(6) NOT NULL DEFAULT NOW(6) ON UPDATE NOW(6),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  session_token CHAR(64) NOT NULL,    -- random, stored hashed if desired
  created_at DATETIME(6) NOT NULL DEFAULT NOW(6),
  expires_at DATETIME(6) NOT NULL,
  user_agent VARCHAR(255),
  ip VARCHAR(64),
  UNIQUE KEY uniq_token (session_token),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS magic_links (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  token CHAR(64) NOT NULL,            -- single-use, expires quickly
  created_at DATETIME(6) NOT NULL DEFAULT NOW(6),
  expires_at DATETIME(6) NOT NULL,
  used_at DATETIME(6),
  UNIQUE KEY uniq_magic (token),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  provider VARCHAR(32) NOT NULL,      -- 'google'
  provider_user_id VARCHAR(128) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at DATETIME,
  UNIQUE KEY uniq_provider (provider, provider_user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Campaign policies table for budget optimizer
CREATE TABLE IF NOT EXISTS campaign_policies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  platform ENUM('google','reddit','x') NOT NULL,
  account_id VARCHAR(64) NOT NULL,
  campaign_id VARCHAR(128) NOT NULL,
  target_cac DECIMAL(10,2),
  max_cac DECIMAL(10,2),
  min_budget DECIMAL(10,2),
  max_budget DECIMAL(10,2),
  min_conversions INT DEFAULT 3,
  created_at DATETIME(6) NOT NULL DEFAULT NOW(6),
  updated_at DATETIME(6) NOT NULL DEFAULT NOW(6) ON UPDATE NOW(6),
  UNIQUE KEY uniq_campaign_policy (platform, account_id, campaign_id)
);
