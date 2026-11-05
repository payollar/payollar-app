-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "LogisticsShipmentStatus" AS ENUM (
    'DRAFT',
    'DISPATCHED',
    'RECEIVED_OK',
    'PROBLEM',
    'RETURN_REQUESTED',
    'RETURN_ACKED',
    'CLOSED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "LogisticsShipment" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "creatorId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "status" "LogisticsShipmentStatus" NOT NULL DEFAULT 'DRAFT',
  "mode" TEXT NOT NULL DEFAULT 'SELF_MANAGED',
  "courier" TEXT,
  "trackingRef" TEXT,
  "dispatchNotes" TEXT,
  "dispatchedAt" TIMESTAMP(3),
  "proofFiles" JSONB NOT NULL DEFAULT '[]',
  "receiveNotes" TEXT,
  "receivedAt" TIMESTAMP(3),
  "problemNotes" TEXT,
  "returnRequestedAt" TIMESTAMP(3),
  "returnNotes" TEXT,
  "returnAckedAt" TIMESTAMP(3),
  "returnAckNotes" TEXT,
  "events" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LogisticsShipment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LogisticsShipment_applicationId_key" ON "LogisticsShipment"("applicationId");
CREATE INDEX IF NOT EXISTS "LogisticsShipment_clientId_status_updatedAt_idx" ON "LogisticsShipment"("clientId", "status", "updatedAt");
CREATE INDEX IF NOT EXISTS "LogisticsShipment_creatorId_status_updatedAt_idx" ON "LogisticsShipment"("creatorId", "status", "updatedAt");

DO $$ BEGIN
  ALTER TABLE "LogisticsShipment"
    ADD CONSTRAINT "LogisticsShipment_applicationId_fkey"
    FOREIGN KEY ("applicationId") REFERENCES "CampaignApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "LogisticsShipment"
    ADD CONSTRAINT "LogisticsShipment_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "LogisticsShipment"
    ADD CONSTRAINT "LogisticsShipment_creatorId_fkey"
    FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
