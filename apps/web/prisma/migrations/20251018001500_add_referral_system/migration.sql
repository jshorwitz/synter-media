-- AlterTable
ALTER TABLE "waitlist_leads" ADD COLUMN "referral_code" VARCHAR(12),
ADD COLUMN "referrer_id" INTEGER,
ADD COLUMN "referrals_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "base_points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "bonus_points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "is_ghost" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "persona_name" VARCHAR(128),
ADD COLUMN "avatar_seed" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_leads_referral_code_key" ON "waitlist_leads"("referral_code");

-- CreateIndex
CREATE INDEX "waitlist_leads_referral_code_idx" ON "waitlist_leads"("referral_code");

-- CreateIndex
CREATE INDEX "waitlist_leads_base_points_created_at_idx" ON "waitlist_leads"("base_points", "created_at");
