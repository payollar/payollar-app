-- Fix NULL values in Appointment table before schema changes
-- Delete orphaned appointments that have NULL creatorId or clientId
DELETE FROM "Appointment" 
WHERE "clientId" IS NULL OR "creatorId" IS NULL;

-- Add mobile money fields to User table for creator payouts
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mobileMoneyProvider" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mobileMoneyNumber" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mobileMoneyName" TEXT;
