# Fixing Prisma Migration Shadow Database Issue

## Problem
The migration `20250112000000_add_better_auth_fields` is failing because Prisma's shadow database doesn't have the User table.

## Solutions

### Option 1: Mark Migration as Applied (if already in production)
If the migration is already applied to your production database, mark it as resolved:

```bash
npx prisma migrate resolve --applied 20250112000000_add_better_auth_fields
```

Then run your new migration:
```bash
npx prisma migrate dev --name add_mobile_money_fields
```

### Option 2: Use `prisma migrate deploy` (for production)
If you're deploying to production, use `deploy` instead of `dev`:

```bash
npx prisma migrate deploy
```

### Option 3: Disable Shadow Database (not recommended)
Add this to your `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL") // Optional: set to same as DATABASE_URL
}
```

### Option 4: Use `prisma db push` (for development)
If you're in development and don't need migration history:

```bash
npx prisma db push
npx prisma generate
```

## Recommended Approach
Since you're adding mobile money fields, I recommend:

1. **If the migration is already applied to production:**
   ```bash
   npx prisma migrate resolve --applied 20250112000000_add_better_auth_fields
   npx prisma migrate deploy
   ```

2. **If you're in development:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

The migration file has been created at:
`prisma/migrations/20260208000000_add_mobile_money_fields/migration.sql`
