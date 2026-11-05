-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('INITIATING', 'RINGING', 'CONNECTED', 'COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'DONE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" VARCHAR(20);

-- CreateTable
CREATE TABLE IF NOT EXISTS "leads" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "contact_person" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL DEFAULT '',
    "city" VARCHAR(100) NOT NULL DEFAULT '',
    "category" VARCHAR(100) NOT NULL DEFAULT '',
    "google_rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "google_reviews_count" INTEGER NOT NULL DEFAULT 0,
    "website_url" VARCHAR(500) NOT NULL DEFAULT '',
    "instagram_url" VARCHAR(500) NOT NULL DEFAULT '',
    "source" VARCHAR(100) NOT NULL DEFAULT 'Google Maps',
    "assigned_caller" VARCHAR(100) NOT NULL DEFAULT 'Priya Sharma',
    "status" VARCHAR(50) NOT NULL DEFAULT 'New',
    "pipeline" VARCHAR(50) NOT NULL DEFAULT 'Lead',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'Medium',
    "notes" TEXT,
    "follow_up_date" VARCHAR(50) NOT NULL DEFAULT '',
    "follow_up_time" VARCHAR(20),
    "last_call_outcome" VARCHAR(50),
    "total_calls" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "calls" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "lead_name" TEXT NOT NULL,
    "lead_phone" TEXT NOT NULL,
    "caller_id" TEXT NOT NULL,
    "caller_name" TEXT NOT NULL,
    "caller_phone" TEXT NOT NULL,
    "exotel_call_sid" TEXT,
    "status" "CallStatus" NOT NULL DEFAULT 'INITIATING',
    "outcome" TEXT,
    "notes" TEXT,
    "duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "recording_url" TEXT,
    "answered_at" TIMESTAMPTZ(6),
    "ended_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "follow_ups" (
    "id" TEXT NOT NULL,
    "call_id" TEXT,
    "lead_id" TEXT NOT NULL,
    "lead_name" TEXT NOT NULL,
    "assigned_to_id" TEXT NOT NULL,
    "assigned_to_name" TEXT NOT NULL,
    "due_at" TIMESTAMPTZ(6) NOT NULL,
    "priority" VARCHAR(10) NOT NULL DEFAULT 'Medium',
    "notes" TEXT,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_leads_assigned_caller" ON "leads"("assigned_caller");
CREATE INDEX IF NOT EXISTS "idx_leads_pipeline" ON "leads"("pipeline");
CREATE UNIQUE INDEX IF NOT EXISTS "calls_exotel_call_sid_key" ON "calls"("exotel_call_sid");
CREATE INDEX IF NOT EXISTS "idx_calls_lead_id" ON "calls"("lead_id");
CREATE INDEX IF NOT EXISTS "idx_calls_caller_id" ON "calls"("caller_id");
CREATE INDEX IF NOT EXISTS "idx_calls_status" ON "calls"("status");
CREATE INDEX IF NOT EXISTS "idx_followups_assignee_due" ON "follow_ups"("assigned_to_id", "status", "due_at");

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "fk_calls_lead" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "follow_ups" ADD CONSTRAINT "fk_followups_call" FOREIGN KEY ("call_id") REFERENCES "calls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

