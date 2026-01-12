# Google OAuth Setup Guide - Local to Production

This guide will walk you through setting up Google OAuth authentication for Payollar, from local development to production deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Setup](#production-setup)
4. [Environment Variables](#environment-variables)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Your application domain (for production)

---

## Local Development Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter project name: `Payollar` (or your preferred name)
5. Click **"Create"**
6. Wait for the project to be created and select it

### Step 2: Enable Google+ API (if needed)

1. Navigate to **APIs & Services** → **Library**
2. Search for "Google+ API" or "Google Identity"
3. Click on it and click **"Enable"**

**Note:** Modern Google OAuth works with the Identity API, which is usually enabled by default. You may not need to enable Google+ API.

### Step 3: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**

### Step 4: Configure OAuth Consent Screen

If this is your first time, you'll be prompted to configure the OAuth consent screen:

1. Choose **"External"** (unless you have a Google Workspace account)
2. Click **"Create"**
3. Fill in the required information:
   - **App name**: `Payollar`
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Click **"Save and Continue"**
5. On the **Scopes** page, click **"Save and Continue"** (default scopes are fine)
6. On the **Test users** page (for development), you can add test users or skip
7. Click **"Save and Continue"** → **"Back to Dashboard"**

### Step 5: Create OAuth Client ID

1. Go back to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Select **"Web application"** as the application type
4. Enter a name: `Payollar Local Development`
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click **"Create"**
8. **Copy the Client ID and Client Secret** - you'll need these for your `.env` file

---

## Production Setup

### Step 1: Create Production OAuth Credentials

1. In Google Cloud Console, go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Select **"Web application"**
4. Enter a name: `Payollar Production`
5. **Authorized JavaScript origins**:
   ```
   https://payollar.com
   https://www.payollar.com
   ```
   (Add both www and non-www versions)
6. **Authorized redirect URIs**:
   ```
   https://payollar.com/api/auth/callback/google
   https://www.payollar.com/api/auth/callback/google
   ```
   (Add both www and non-www versions)
7. Click **"Create"**
8. **Copy the Client ID and Client Secret** for production

### Step 2: Publish Your OAuth Consent Screen (Production)

1. Go to **APIs & Services** → **OAuth consent screen**
2. If still in "Testing" mode, click **"PUBLISH APP"**
3. Confirm the publication
4. **Note**: It may take a few minutes for changes to propagate

### Step 3: Verify Domain (Optional but Recommended)

For production, you may want to verify your domain:

1. Go to **APIs & Services** → **OAuth consent screen**
2. Scroll to **"Authorized domains"**
3. Add your domain: `payollar.com`
4. Follow the domain verification process

---

## Environment Variables

### Local Development (.env.local)

Create or update your `.env.local` file:

```env
# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth (Local Development)
GOOGLE_CLIENT_ID=your-local-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-local-google-client-secret
```

### Production (Vercel/Environment Variables)

Add these environment variables in your hosting platform (e.g., Vercel):

```env
# Better Auth
BETTER_AUTH_SECRET=your-production-secret-key-min-32-chars
BETTER_AUTH_URL=https://payollar.com
NEXT_PUBLIC_APP_URL=https://payollar.com

# Google OAuth (Production)
GOOGLE_CLIENT_ID=your-production-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
```

### Generating BETTER_AUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

**Important**: 
- The secret must be at least 32 characters long
- Use different secrets for development and production
- Never commit secrets to version control

---

## Testing

### Local Testing

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `http://localhost:3000/sign-in` or `http://localhost:3000/sign-up`

3. Click the **"Continue with Google"** button

4. You should be redirected to Google's sign-in page

5. After signing in, you should be redirected back to your app

6. Check that:
   - User is created in your database
   - Session is established
   - User is redirected to `/onboarding` (for new users)

### Production Testing

1. Deploy your application with production environment variables

2. Navigate to `https://payollar.com/sign-in`

3. Test the Google OAuth flow

4. Verify:
   - OAuth flow completes successfully
   - User is created/authenticated
   - Redirect works correctly

---

## Troubleshooting

### Issue: "redirect_uri_mismatch" Error

**Solution:**
- Verify the redirect URI in Google Cloud Console exactly matches: `https://your-domain.com/api/auth/callback/google`
- Check for trailing slashes
- Ensure both www and non-www versions are added if needed
- Wait a few minutes after making changes (Google caches redirect URIs)

### Issue: "invalid_client" Error

**Solution:**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Ensure you're using the correct credentials for the environment (local vs production)
- Check that credentials are not expired or revoked

### Issue: OAuth Consent Screen Shows "Unverified App"

**Solution:**
- This is normal for development/testing
- For production, you may need to:
  - Complete the OAuth consent screen verification process
  - Provide privacy policy and terms of service URLs
  - Submit for verification if requesting sensitive scopes

### Issue: User Not Created After Google Sign-In

**Solution:**
- Check your database connection
- Verify Better Auth is properly configured
- Check server logs for errors
- Ensure the Account model exists in your Prisma schema

### Issue: Session Not Persisting

**Solution:**
- Verify `BETTER_AUTH_SECRET` is set correctly
- Check cookie settings in Better Auth configuration
- Ensure `trustedOrigins` includes your domain
- Check browser console for cookie-related errors

### Issue: CORS Errors

**Solution:**
- Verify `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` match your actual domain
- Check `trustedOrigins` in `lib/auth.js` includes your domain
- Ensure both www and non-www versions are in `trustedOrigins`

---

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use different credentials** for development and production
3. **Rotate secrets** periodically
4. **Limit OAuth scopes** to only what you need
5. **Monitor OAuth usage** in Google Cloud Console
6. **Set up alerts** for unusual activity

---

## Additional Resources

- [Better Auth OAuth Documentation](https://www.better-auth.com/docs/authentication/oauth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## Quick Reference

### Redirect URIs by Environment

**Local Development:**
```
http://localhost:3000/api/auth/callback/google
```

**Production:**
```
https://payollar.com/api/auth/callback/google
https://www.payollar.com/api/auth/callback/google
```

### JavaScript Origins by Environment

**Local Development:**
```
http://localhost:3000
```

**Production:**
```
https://payollar.com
https://www.payollar.com
```

---

## Support

If you encounter issues not covered in this guide:

1. Check the [Better Auth GitHub Issues](https://github.com/better-auth/better-auth/issues)
2. Review [Google OAuth Troubleshooting](https://developers.google.com/identity/protocols/oauth2/policies)
3. Check your application logs for detailed error messages
