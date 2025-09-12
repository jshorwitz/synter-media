CREATE TABLE IF NOT EXISTS events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_name VARCHAR(128) NOT NULL,
  ts DATETIME(6) NOT NULL DEFAULT NOW(6),
  user_id VARCHAR(128) NULL,
  anonymous_id VARCHAR(128) NULL,
  session_id VARCHAR(128) NULL,
  utm_source VARCHAR(128), utm_medium VARCHAR(128), utm_campaign VARCHAR(256),
  utm_term VARCHAR(256), utm_content VARCHAR(256),
  gclid VARCHAR(128), gbraid VARCHAR(128), wbraid VARCHAR(128),
  rdt_cid VARCHAR(128), twclid VARCHAR(128),
  referrer TEXT,
  revenue DECIMAL(18,6) NULL,
  currency CHAR(3) NULL,
  properties JSON,
  INDEX (ts)
);

CREATE TABLE IF NOT EXISTS ad_metrics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  platform ENUM('google','reddit','x') NOT NULL,
  date DATE NOT NULL,
  account_id VARCHAR(64) NOT NULL,
  campaign_id VARCHAR(128) NOT NULL,
  adgroup_id VARCHAR(128),
  ad_id VARCHAR(128),
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  spend DECIMAL(18,6) DEFAULT 0,
  conversions BIGINT DEFAULT 0,
  revenue DECIMAL(18,6) DEFAULT 0,
  raw JSON,
  UNIQUE KEY uniq_row (platform, date, account_id, campaign_id, adgroup_id, ad_id)
);

CREATE TABLE IF NOT EXISTS conversions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_id BIGINT NOT NULL,
  user_id VARCHAR(128),
  ts DATETIME(6) NOT NULL DEFAULT NOW(6),
  event_name VARCHAR(128) NOT NULL,
  value DECIMAL(18,6) NULL,
  currency CHAR(3) NULL
);

CREATE TABLE IF NOT EXISTS touchpoints (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(128),
  ts DATETIME(6) NOT NULL,
  platform ENUM('google','reddit','x','other') NOT NULL,
  campaign VARCHAR(256),
  adgroup VARCHAR(256),
  ad_id VARCHAR(128),
  medium VARCHAR(64),
  source VARCHAR(128),
  gclid VARCHAR(128),
  rdt_cid VARCHAR(128),
  twclid VARCHAR(128),
  utm_source VARCHAR(128),
  utm_medium VARCHAR(128),
  utm_campaign VARCHAR(256),
  utm_term VARCHAR(256),
  utm_content VARCHAR(256),
  properties JSON,
  INDEX (user_id, ts)
);

CREATE TABLE IF NOT EXISTS agent_runs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  agent VARCHAR(64) NOT NULL,
  run_id VARCHAR(64) NOT NULL,
  started_at DATETIME(6) NOT NULL DEFAULT NOW(6),
  finished_at DATETIME(6),
  ok BOOLEAN,
  stats JSON,
  watermark VARCHAR(64),
  UNIQUE KEY uniq_run (agent, run_id)
);
