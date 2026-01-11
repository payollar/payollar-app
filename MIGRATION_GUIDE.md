# Migration Guide: Clerk to Better Auth

This document outlines the migration process from Clerk to Better Auth that has been implemented in your application.

## ✅ What Has Been Done

### 1. Better Auth Installation
- Added `better-auth` to `package.json`
- Created Better Auth configuration in `lib/auth.js`
- Created client-side auth in `lib/auth-client.js`

### 2. Database Schema Updates
- Updated `User` model to include:
  - `betterAuthId` (optional, unique)
  - `password` (for Better Auth email/password)
  - `emailVerified` and `emailVerifiedAt`
  - Made `clerkUserId` optional
- Added `Session` model for Better Auth sessions

### 3. Dual Authentication Support
- Updated `lib/checkUser.js` to check Better Auth first, then fallback to Clerk
- Updated `middleware.js` to support both authentication systems
- Created `lib/getAuthUserId.js` utility for getting user ID from either system

### 4. Migration Tools
- Created `/api/migrate-user` route for on-demand user migration
- Created `scripts/migrate-users.js` for bulk migration
- Migration API automatically handles account merging

### 5. API Routes
- Created `/api/auth/[...all]` route for Better Auth endpoints

## 🚀 Next Steps

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Run Database Migration

```bash
npx prisma migrate dev --name add_better_auth_fields
npx prisma generate
```

### Step 3: Set Environment Variables

Add to your `.env` file:

```env
# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here-min-32-chars
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate a secret:
```bash
openssl rand -base64 32
```

**Important**: Make sure your secret is at least 32 characters long!

### Step 4: Test Better Auth Setup

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Test Better Auth endpoints:
   - Sign up: `POST /api/auth/sign-up`
   - Sign in: `POST /api/auth/sign-in`
   - Get session: `GET /api/auth/session`

### Step 5: Migrate Users

#### Option A: Automatic Migration (Recommended)
Users will be automatically migrated when they log in via the `/api/migrate-user` endpoint.

#### Option B: Bulk Migration
Run the migration script to migrate all users at once:

```bash
node scripts/migrate-users.js
```

**Important**: Before running bulk migration:
1. Backup your database
2. Test in staging environment first
3. Send email notifications to users about password reset

### Step 6: Update Sign-In/Sign-Up Pages

Create Better Auth sign-in and sign-up pages. You can keep Clerk pages during migration period.

Example sign-in page (`app/(auth)/sign-in-better/page.jsx`):

```jsx
"use client";

import { signIn } from "@/lib/auth-client";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn.email({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form UI */}
    </form>
  );
}
```

### Step 7: Gradual Migration Strategy

1. **Week 1-2**: Keep both systems running
   - New users can sign up with Better Auth
   - Existing users continue using Clerk
   - Auto-migrate users when they log in

2. **Week 3-4**: Encourage migration
   - Show migration prompt to Clerk users
   - Send email notifications
   - Run bulk migration for inactive users

3. **Week 5+**: Complete migration
   - All users migrated
   - Disable Clerk authentication
   - Remove Clerk dependencies

## 📋 Migration Checklist

- [ ] Install dependencies (`pnpm install`)
- [ ] Run database migration
- [ ] Set environment variables
- [ ] Test Better Auth endpoints
- [ ] Create Better Auth sign-in/sign-up pages
- [ ] Test user migration (single user)
- [ ] Backup database
- [ ] Run bulk migration (if needed)
- [ ] Send password reset emails to migrated users
- [ ] Monitor for issues
- [ ] Update all action files to use `checkUser`
- [ ] Remove Clerk dependencies (after all users migrated)

## 🔧 Troubleshooting

### Issue: Better Auth not working
- Check environment variables are set correctly
- Verify database migration ran successfully
- Check Better Auth routes are accessible at `/api/auth/*`

### Issue: Users can't log in after migration
- Users need to reset password (they don't have one yet)
- Send password reset emails
- Or allow them to continue using Clerk temporarily

### Issue: Duplicate users
- The migration script handles this automatically
- It merges accounts with the same email
- Check logs for any merge issues

## 📚 Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

## ⚠️ Important Notes

1. **Password Handling**: Users migrated from Clerk won't have passwords. They'll need to:
   - Use password reset flow
   - Or continue using OAuth (if you set up OAuth with Better Auth)

2. **OAuth Providers**: If users signed up with Google/GitHub via Clerk, you'll need to:
   - Set up OAuth in Better Auth
   - Link their accounts
   - Or have them reset password

3. **Session Management**: Better Auth sessions work differently than Clerk. Test thoroughly.

4. **Rollback Plan**: Keep Clerk configuration during migration period. You can revert by:
   - Updating middleware to use Clerk only
   - Users can still log in with Clerk
   - Fix issues and retry migration

## 🎯 Current Status

The codebase now supports **dual authentication**:
- ✅ Better Auth is installed and configured
- ✅ Database schema updated
- ✅ Authentication helpers support both systems
- ✅ Migration tools created
- ⏳ Ready for database migration
- ⏳ Ready for user migration

You can now proceed with testing and gradual migration!
