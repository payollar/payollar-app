# Prisma Migration Workaround

## Issue
`prisma migrate dev` fails with error:
```
Error: P3006
Migration `20251210091903_rename_doctor_patient_to_creator_client` failed to apply cleanly to the shadow database.
ERROR: unsafe use of new value "CLIENT" of enum type "UserRole"
```

This is a known PostgreSQL limitation where enum values must be committed in a separate transaction before they can be used.

## Solution

Since the migrations are already applied to your production database, you have two options:

### Option 1: Use `prisma migrate deploy` (Recommended for Production)
```bash
# Create migration file manually or use db push first
npx prisma db push  # Syncs schema without creating migration
# Then manually create migration file if needed
npx prisma migrate deploy  # Applies pending migrations
```

### Option 2: Use `prisma db push` for Development
```bash
# This syncs your schema directly without using shadow database
npx prisma db push
```

**Note:** `db push` doesn't create migration files, so use this for development only.

### Option 3: Disable Shadow Database (Not Recommended)
Add to `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL") // Set to same as DATABASE_URL
}
```

## Current Status

✅ **Better Auth migration is applied**
- Migration `20260109095924_add_better_auth_fields` is in the database
- All Better Auth fields are added to User table
- Session table is created
- Database schema is up to date

## For Future Migrations

1. **Development:** Use `prisma db push` to test schema changes
2. **Production:** Manually create migration files and use `prisma migrate deploy`
3. **Or:** Fix the enum migration issue by splitting it into separate transactions

## Better Auth Setup Complete

Your Better Auth migration is complete! You can now:
- ✅ Use Better Auth authentication
- ✅ Users will migrate automatically on login
- ✅ Both Clerk and Better Auth work simultaneously
