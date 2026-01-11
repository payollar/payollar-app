-- AlterTable
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT,
ADD COLUMN IF NOT EXISTS "userAgent" TEXT,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing rows to have updatedAt = createdAt
UPDATE "Session" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
