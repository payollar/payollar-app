# URGENT: Fix Mobile Money Database Columns

## Problem
Better Auth is trying to query `mobileMoneyProvider`, `mobileMoneyNumber`, and `mobileMoneyName` columns that don't exist in your database, causing errors.

## Quick Fix - Run This SQL

Connect to your database and run this SQL:

```sql
-- Fix NULL values in Appointment table (if needed)
DELETE FROM "Appointment" 
WHERE "clientId" IS NULL OR "creatorId" IS NULL;

-- Add mobile money fields to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mobileMoneyProvider" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mobileMoneyNumber" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mobileMoneyName" TEXT;
```

## After Running SQL

1. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Restart your dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   pnpm dev
   ```

## Alternative: Temporary Workaround

If you can't run SQL right now, temporarily comment out the mobile money fields in `prisma/schema.prisma`:

```prisma
  // Creator mobile money info for product sales payouts
  // mobileMoneyProvider String? // MTN, Vodafone, AirtelTigo
  // mobileMoneyNumber  String? // Phone number
  // mobileMoneyName    String? // Account name
```

Then:
1. Run `npx prisma generate`
2. Restart dev server
3. Uncomment the fields after applying the migration
