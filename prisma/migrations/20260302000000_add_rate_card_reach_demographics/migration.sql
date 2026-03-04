-- Add reach and demographics to RateCard for editable metadata
ALTER TABLE "RateCard" ADD COLUMN IF NOT EXISTS "reach" TEXT;
ALTER TABLE "RateCard" ADD COLUMN IF NOT EXISTS "demographics" TEXT[] DEFAULT ARRAY[]::TEXT[];
