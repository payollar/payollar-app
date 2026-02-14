# Fixing Migration Issues

## Problem
1. Shadow database issue with `20250112000000_add_better_auth_fields` migration
2. NULL values in `Appointment` table preventing schema push
3. Need to add mobile money fields

## Solution Steps

### Option 1: Use Raw SQL Migration (Recommended)

Since Prisma migrations are having issues, you can apply the changes directly using SQL:

1. **Connect to your database** (using psql, DBeaver, or your preferred SQL client)

2. **Run this SQL script** to fix NULL values and add mobile money fields:

```sql
-- Fix NULL values in Appointment table
DELETE FROM "Appointment" 
WHERE "clientId" IS NULL OR "creatorId" IS NULL;

-- Add mobile money fields to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mobileMoneyProvider" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mobileMoneyNumber" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mobileMoneyName" TEXT;
```

3. **Mark the migration as applied** (so Prisma knows it's done):
```bash
npx prisma migrate resolve --applied 20260208000000_add_mobile_money_fields
```

4. **Generate Prisma Client**:
```bash
npx prisma generate
```

### Option 2: Use Prisma Migrate Deploy (Production)

If you're deploying to production:

```bash
# First, manually run the SQL above in your database
# Then mark migrations as applied
npx prisma migrate resolve --applied 20250112000000_add_better_auth_fields
npx prisma migrate resolve --applied 20260208000000_add_mobile_money_fields
npx prisma migrate deploy
```

### Option 3: Use Prisma DB Push (Development Only)

**Warning**: This will try to make `creatorId` and `clientId` required, which will fail if NULL values exist.

1. First, manually delete NULL appointments:
```sql
DELETE FROM "Appointment" 
WHERE "clientId" IS NULL OR "creatorId" IS NULL;
```

2. Then run:
```bash
npx prisma db push
npx prisma generate
```

## Verification

After applying the changes, verify the mobile money fields exist:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'User' 
AND column_name LIKE 'mobileMoney%';
```

You should see:
- `mobileMoneyProvider`
- `mobileMoneyNumber`
- `mobileMoneyName`

## Next Steps

Once the migration is complete:
1. The mobile money feature will be fully functional
2. Users can add mobile money details in the Creator Payouts page
3. The reveal/hide icon for account numbers will work
