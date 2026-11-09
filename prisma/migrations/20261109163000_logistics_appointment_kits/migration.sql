-- Allow kits for talent bookings as well as campaign hires.
ALTER TABLE "LogisticsShipment"
  ALTER COLUMN "applicationId" DROP NOT NULL;

ALTER TABLE "LogisticsShipment"
  ADD COLUMN IF NOT EXISTS "appointmentId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "LogisticsShipment_appointmentId_key"
  ON "LogisticsShipment"("appointmentId");

DO $$ BEGIN
  ALTER TABLE "LogisticsShipment"
    ADD CONSTRAINT "LogisticsShipment_appointmentId_fkey"
    FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
