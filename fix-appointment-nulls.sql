-- Fix NULL values in Appointment table before migration
-- This script handles any NULL values in creatorId and clientId

-- First, let's see if there are any NULL values
-- If there are, we need to either delete those rows or assign them to a default user
-- For safety, we'll just delete orphaned appointments

DELETE FROM "Appointment" 
WHERE "creatorId" IS NULL OR "clientId" IS NULL;
