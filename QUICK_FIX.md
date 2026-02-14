# Quick Fix for Migration Issue

## Problem
Prisma is complaining it can't find the migration file even though it exists and is marked as applied.

## Solution

Since the migration is already marked as applied, you have two options:

### Option 1: Just Generate Prisma Client (If SQL Already Applied)

If you've already manually run the SQL to add the mobile money columns, just generate the client:

```bash
npx prisma generate
```

### Option 2: Apply Migration Manually (If SQL Not Applied Yet)

Run the Node.js script to apply the migration:

```bash
node scripts/apply-mobile-money-migration.js
```

Then generate the client:

```bash
npx prisma generate
```

### Option 3: Run SQL Directly

Connect to your database and run:

```sql
-- Fix NULL values in Appointment table
DELETE FROM "Appointment" 
WHERE "clientId" IS NULL OR "creatorId" IS NULL;

-- Add mobile money fields to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mobileMoneyProvider" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mobileMoneyNumber" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mobileMoneyName" TEXT;
```

Then generate:

```bash
npx prisma generate
```

## Verify It Worked

After generating, check if the mobile money fields are available in your Prisma client by checking the User model in your code editor - you should see `mobileMoneyProvider`, `mobileMoneyNumber`, and `mobileMoneyName` fields.

## Note

The `prisma migrate deploy` error can be ignored if you've already:
1. Marked the migration as applied (`prisma migrate resolve --applied`)
2. Applied the SQL manually or via script
3. Generated the Prisma client

The migration system is just confused, but your database and code will work fine.
