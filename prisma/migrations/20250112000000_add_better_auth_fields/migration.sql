-- Add Better Auth fields to User table
-- These fields support the migration from Clerk to Better Auth

-- Add betterAuthId column (nullable, unique)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "betterAuthId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_betterAuthId_key" ON "User"("betterAuthId") WHERE "betterAuthId" IS NOT NULL;

-- Add password column (nullable, for hashed passwords)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;

-- Add emailVerified column (boolean, default false)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- Add emailVerifiedAt column (nullable timestamp)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);

-- Make clerkUserId nullable (if not already)
ALTER TABLE "User" ALTER COLUMN "clerkUserId" DROP NOT NULL;

-- Create Session table for Better Auth
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- Create unique index on token
CREATE UNIQUE INDEX IF NOT EXISTS "Session_token_key" ON "Session"("token");

-- Create index on userId for faster lookups
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");

-- Create index on token for faster lookups
CREATE INDEX IF NOT EXISTS "Session_token_idx" ON "Session"("token");

-- Add foreign key constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Session_userId_fkey'
    ) THEN
        ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
