-- Add MEDIA_AGENCY to UserRole enum (safe - only adds if doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'MEDIA_AGENCY' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
    ) THEN
        ALTER TYPE "UserRole" ADD VALUE 'MEDIA_AGENCY';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create MediaAgencyTC table
CREATE TABLE IF NOT EXISTS "MediaAgencyTC" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAgencyTC_pkey" PRIMARY KEY ("id")
);

-- Create MediaAgencyReport table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'ReportType'
    ) THEN
        CREATE TYPE "ReportType" AS ENUM ('BOOKING_SUMMARY', 'PERFORMANCE', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'CUSTOM');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "MediaAgencyReport" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "bookingId" TEXT,
    "reportType" "ReportType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "metrics" JSONB,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAgencyReport_pkey" PRIMARY KEY ("id")
);

-- Add relations to MediaAgency
ALTER TABLE "MediaAgencyTC" ADD CONSTRAINT "MediaAgencyTC_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "MediaAgency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MediaAgencyReport" ADD CONSTRAINT "MediaAgencyReport_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "MediaAgency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS "MediaAgencyTC_agencyId_isActive_idx" ON "MediaAgencyTC"("agencyId", "isActive");
CREATE INDEX IF NOT EXISTS "MediaAgencyTC_agencyId_createdAt_idx" ON "MediaAgencyTC"("agencyId", "createdAt");
CREATE INDEX IF NOT EXISTS "MediaAgencyReport_agencyId_createdAt_idx" ON "MediaAgencyReport"("agencyId", "createdAt");
CREATE INDEX IF NOT EXISTS "MediaAgencyReport_bookingId_idx" ON "MediaAgencyReport"("bookingId");
CREATE INDEX IF NOT EXISTS "MediaAgencyReport_reportType_startDate_endDate_idx" ON "MediaAgencyReport"("reportType", "startDate", "endDate");
