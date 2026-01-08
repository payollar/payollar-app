-- Step 1: Add new columns as nullable
ALTER TABLE "Appointment" ADD COLUMN "clientId" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "creatorId" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "clientDescription" TEXT;
ALTER TABLE "Availability" ADD COLUMN "creatorId" TEXT;
ALTER TABLE "Payout" ADD COLUMN "creatorId" TEXT;

-- Step 2: Add new enum values to UserRole
-- Note: In PostgreSQL, enum values added in a transaction are available immediately
-- We use a DO block to safely add values only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'CLIENT' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
    ) THEN
        ALTER TYPE "UserRole" ADD VALUE 'CLIENT';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'CREATOR' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
    ) THEN
        ALTER TYPE "UserRole" ADD VALUE 'CREATOR';
    END IF;
END $$;

-- Step 3: Update UserRole enum values in User table
-- The new enum values are now available in this transaction
UPDATE "User" SET "role" = 'CLIENT' WHERE "role" = 'PATIENT';
UPDATE "User" SET "role" = 'CREATOR' WHERE "role" = 'DOCTOR';

-- Step 4: Copy data from old columns to new columns
UPDATE "Appointment" SET "clientId" = "patientId", "creatorId" = "doctorId", "clientDescription" = "patientDescription";
UPDATE "Availability" SET "creatorId" = "doctorId";
UPDATE "Payout" SET "creatorId" = "doctorId";

-- Step 5: Drop old indexes that reference old column names
DROP INDEX IF EXISTS "Appointment_doctorId_startTime_idx";
DROP INDEX IF EXISTS "Availability_doctorId_startTime_idx";
DROP INDEX IF EXISTS "Payout_doctorId_status_idx";

-- Step 6: Drop old foreign key constraints (they will be recreated with new column names)
ALTER TABLE "Appointment" DROP CONSTRAINT IF EXISTS "Appointment_patientId_fkey";
ALTER TABLE "Appointment" DROP CONSTRAINT IF EXISTS "Appointment_doctorId_fkey";
ALTER TABLE "Availability" DROP CONSTRAINT IF EXISTS "Availability_doctorId_fkey";
ALTER TABLE "Payout" DROP CONSTRAINT IF EXISTS "Payout_doctorId_fkey";

-- Step 7: Drop old columns
ALTER TABLE "Appointment" DROP COLUMN "patientId";
ALTER TABLE "Appointment" DROP COLUMN "doctorId";
ALTER TABLE "Appointment" DROP COLUMN "patientDescription";
ALTER TABLE "Availability" DROP COLUMN "doctorId";
ALTER TABLE "Payout" DROP COLUMN "doctorId";

-- Step 8: Make new columns non-nullable
ALTER TABLE "Appointment" ALTER COLUMN "clientId" SET NOT NULL;
ALTER TABLE "Appointment" ALTER COLUMN "creatorId" SET NOT NULL;
ALTER TABLE "Availability" ALTER COLUMN "creatorId" SET NOT NULL;
ALTER TABLE "Payout" ALTER COLUMN "creatorId" SET NOT NULL;

-- Step 9: Add foreign key constraints with new column names
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 10: Create new indexes with new column names
CREATE INDEX "Appointment_creatorId_startTime_idx" ON "Appointment"("creatorId", "startTime");
CREATE INDEX "Availability_creatorId_startTime_idx" ON "Availability"("creatorId", "startTime");
CREATE INDEX "Payout_creatorId_status_idx" ON "Payout"("creatorId", "status");

-- Note: PostgreSQL doesn't support removing enum values directly.
-- The old values (PATIENT, DOCTOR) will remain in the enum type but won't be used.
-- This is safe as long as all data has been migrated.

