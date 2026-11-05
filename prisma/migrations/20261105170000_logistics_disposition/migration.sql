DO $$ BEGIN
  CREATE TYPE "LogisticsDisposition" AS ENUM ('GIFT', 'RETURNABLE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "LogisticsShipment"
  ADD COLUMN IF NOT EXISTS "disposition" "LogisticsDisposition" NOT NULL DEFAULT 'GIFT';
