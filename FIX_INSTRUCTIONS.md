# Fix Instructions - Mobile Money Database Columns

## ✅ What I Did (Temporary Fix)

I've temporarily commented out the mobile money fields in `prisma/schema.prisma` and regenerated Prisma Client. This will stop the errors immediately.

## 🔧 Permanent Fix Required

You need to add the mobile money columns to your database. Here's how:

### Step 1: Connect to Your Database

Use your preferred database client (psql, DBeaver, pgAdmin, etc.) and connect to your PostgreSQL database.

### Step 2: Run This SQL

```sql
-- Fix NULL values in Appointment table (if needed)
DELETE FROM "Appointment" 
WHERE "clientId" IS NULL OR "creatorId" IS NULL;

-- Add mobile money fields to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mobileMoneyProvider" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mobileMoneyNumber" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mobileMoneyName" TEXT;
```

### Step 3: Uncomment Fields in Schema

After running the SQL, uncomment these lines in `prisma/schema.prisma`:

```prisma
  // Creator mobile money info for product sales payouts
  mobileMoneyProvider String? // MTN, Vodafone, AirtelTigo
  mobileMoneyNumber  String? // Phone number
  mobileMoneyName    String? // Account name
```

### Step 4: Regenerate Prisma Client

```bash
npx prisma generate
```

### Step 5: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
pnpm dev
```

## ✅ Verification

After completing the steps above, the mobile money feature will work fully. The errors should be gone and users can add/remove mobile money accounts.
