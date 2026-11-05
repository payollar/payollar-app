-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "AppointmentSource" AS ENUM ('TALENT', 'CAMPAIGN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "source" "AppointmentSource" NOT NULL DEFAULT 'TALENT';

-- Backfill campaign-hire chats from brief prefix
UPDATE "Appointment"
SET "source" = 'CAMPAIGN'
WHERE "clientDescription" ILIKE 'Campaign application:%'
  AND "source" = 'TALENT';

CREATE INDEX IF NOT EXISTS "Appointment_clientId_source_startTime_idx"
  ON "Appointment"("clientId", "source", "startTime");
