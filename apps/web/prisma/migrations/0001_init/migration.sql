-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ANALYST', 'VIEWER');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "password_hash" VARCHAR(255),
    "name" VARCHAR(128),
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "session_token" CHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "user_agent" VARCHAR(255),
    "ip" VARCHAR(64),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_links" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" CHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),

    CONSTRAINT "magic_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_accounts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider" VARCHAR(32) NOT NULL,
    "provider_user_id" VARCHAR(128) NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_runs" (
    "id" SERIAL NOT NULL,
    "agent" VARCHAR(64) NOT NULL,
    "run_id" VARCHAR(64) NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ(6),
    "ok" BOOLEAN,
    "stats" JSONB,
    "watermark" VARCHAR(64),

    CONSTRAINT "agent_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_metrics" (
    "id" SERIAL NOT NULL,
    "platform" VARCHAR(32) NOT NULL,
    "date" DATE NOT NULL,
    "account_id" VARCHAR(64) NOT NULL,
    "campaign_id" VARCHAR(64) NOT NULL,
    "adgroup_id" VARCHAR(64),
    "ad_id" VARCHAR(64),
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "spend" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "touchpoints" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(255),
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "platform" VARCHAR(32) NOT NULL,
    "campaign_id" VARCHAR(64),
    "click_id" VARCHAR(255),
    "raw_data" JSONB,

    CONSTRAINT "touchpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversions" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(255),
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "action" VARCHAR(128) NOT NULL,
    "value" DECIMAL(10,2),
    "currency" VARCHAR(3),
    "touchpoint_id" INTEGER,
    "uploaded_at" TIMESTAMPTZ(6),

    CONSTRAINT "conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_policies" (
    "id" SERIAL NOT NULL,
    "platform" VARCHAR(32) NOT NULL,
    "campaign_id" VARCHAR(64) NOT NULL,
    "target_cac" DECIMAL(10,2),
    "max_cac" DECIMAL(10,2),
    "min_budget" DECIMAL(10,2),
    "max_budget" DECIMAL(10,2),
    "auto_optimize" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "campaign_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "magic_links_token_key" ON "magic_links"("token");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_accounts_provider_provider_user_id_key" ON "oauth_accounts"("provider", "provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_runs_agent_run_id_key" ON "agent_runs"("agent", "run_id");

-- CreateIndex
CREATE UNIQUE INDEX "ad_metrics_platform_date_account_id_campaign_id_adgroup_id_ad_key" ON "ad_metrics"("platform", "date", "account_id", "campaign_id", "adgroup_id", "ad_id");

-- CreateIndex
CREATE UNIQUE INDEX "touchpoints_user_id_timestamp_platform_campaign_id_key" ON "touchpoints"("user_id", "timestamp", "platform", "campaign_id");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_policies_platform_campaign_id_key" ON "campaign_policies"("platform", "campaign_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_links" ADD CONSTRAINT "magic_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
