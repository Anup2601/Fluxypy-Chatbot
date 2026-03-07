-- CreateEnum
CREATE TYPE "OrgStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('PDF', 'DOCX', 'URL', 'TEXT', 'FAQ');

-- CreateEnum
CREATE TYPE "SourceStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price_monthly" DECIMAL(10,2) NOT NULL,
    "price_yearly" DECIMAL(10,2) NOT NULL,
    "limits" JSONB NOT NULL,
    "stripe_price_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "OrgStatus" NOT NULL DEFAULT 'ACTIVE',
    "api_key" TEXT NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "plan_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "refresh_token" TEXT,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_sources" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "status" "SourceStatus" NOT NULL DEFAULT 'PENDING',
    "file_path" TEXT,
    "source_url" TEXT,
    "chunk_count" INTEGER NOT NULL DEFAULT 0,
    "token_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "error_msg" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "visitor_ip" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "sources" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_records" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_daily" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "conversations" INTEGER NOT NULL DEFAULT 0,
    "messages" INTEGER NOT NULL DEFAULT 0,
    "unique_users" INTEGER NOT NULL DEFAULT 0,
    "leads_captured" INTEGER NOT NULL DEFAULT 0,
    "avg_response_time" DOUBLE PRECISION,
    "popular_questions" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "analytics_daily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "subscription_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_api_key_key" ON "organizations"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "knowledge_sources_org_id_idx" ON "knowledge_sources"("org_id");

-- CreateIndex
CREATE INDEX "conversations_org_id_idx" ON "conversations"("org_id");

-- CreateIndex
CREATE INDEX "conversations_session_id_idx" ON "conversations"("session_id");

-- CreateIndex
CREATE INDEX "messages_org_id_idx" ON "messages"("org_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "usage_records_org_id_metric_period_idx" ON "usage_records"("org_id", "metric", "period");

-- CreateIndex
CREATE INDEX "analytics_daily_org_id_idx" ON "analytics_daily"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_daily_org_id_date_key" ON "analytics_daily"("org_id", "date");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_daily" ADD CONSTRAINT "analytics_daily_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
