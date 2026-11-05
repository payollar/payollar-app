DO $$ BEGIN
  CREATE TYPE "MediaNegotiationSource" AS ENUM ('MEDIA_BOOKING', 'RATE_CARD_BOOKING');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "MediaNegotiationStatus" AS ENUM (
    'OPEN',
    'DISCOUNT_REQUESTED',
    'COUNTERED',
    'ACCEPTED',
    'REJECTED',
    'CLOSED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "MediaNegotiationMessageType" AS ENUM (
    'TEXT',
    'DISCOUNT_REQUEST',
    'COUNTER_OFFER',
    'ACCEPT',
    'REJECT',
    'SYSTEM'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "MediaNegotiation" (
  "id" TEXT NOT NULL,
  "sourceType" "MediaNegotiationSource" NOT NULL,
  "sourceId" TEXT NOT NULL,
  "agencyId" TEXT NOT NULL,
  "clientUserId" TEXT,
  "clientEmail" TEXT NOT NULL,
  "clientName" TEXT,
  "title" TEXT NOT NULL,
  "stationName" TEXT,
  "packageLabel" TEXT,
  "listAmount" DOUBLE PRECISION NOT NULL,
  "requestedDiscountPct" DOUBLE PRECISION,
  "proposedAmount" DOUBLE PRECISION,
  "counterAmount" DOUBLE PRECISION,
  "agreedAmount" DOUBLE PRECISION,
  "status" "MediaNegotiationStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MediaNegotiation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MediaNegotiation_sourceType_sourceId_key"
  ON "MediaNegotiation"("sourceType", "sourceId");
CREATE INDEX IF NOT EXISTS "MediaNegotiation_agencyId_status_updatedAt_idx"
  ON "MediaNegotiation"("agencyId", "status", "updatedAt");
CREATE INDEX IF NOT EXISTS "MediaNegotiation_clientEmail_updatedAt_idx"
  ON "MediaNegotiation"("clientEmail", "updatedAt");
CREATE INDEX IF NOT EXISTS "MediaNegotiation_clientUserId_updatedAt_idx"
  ON "MediaNegotiation"("clientUserId", "updatedAt");

DO $$ BEGIN
  ALTER TABLE "MediaNegotiation"
    ADD CONSTRAINT "MediaNegotiation_agencyId_fkey"
    FOREIGN KEY ("agencyId") REFERENCES "MediaAgency"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "MediaNegotiationMessage" (
  "id" TEXT NOT NULL,
  "negotiationId" TEXT NOT NULL,
  "senderRole" TEXT NOT NULL,
  "senderUserId" TEXT,
  "type" "MediaNegotiationMessageType" NOT NULL DEFAULT 'TEXT',
  "body" TEXT NOT NULL,
  "meta" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MediaNegotiationMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MediaNegotiationMessage_negotiationId_createdAt_idx"
  ON "MediaNegotiationMessage"("negotiationId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "MediaNegotiationMessage"
    ADD CONSTRAINT "MediaNegotiationMessage_negotiationId_fkey"
    FOREIGN KEY ("negotiationId") REFERENCES "MediaNegotiation"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
