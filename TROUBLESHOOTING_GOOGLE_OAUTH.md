# Troubleshooting Google OAuth 500 Error

If you're seeing a 500 Internal Server Error when trying to sign in with Google, follow these steps:

## Quick Checks

### 1. Restart Your Development Server

After adding Google OAuth configuration, you **must restart** your Next.js development server:

```bash
# Stop the server (Ctrl+C) and restart
pnpm dev
```

Environment variables and configuration changes require a server restart.

### 2. Verify Environment Variables

Check that your `.env` file contains:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Check Server Logs

Look at your terminal/console where the Next.js server is running. You should see:
- Any error messages from Better Auth
- Warnings about missing credentials (if any)
- Stack traces that can help identify the issue

### 4. Verify Google Cloud Console Configuration

Ensure in Google Cloud Console:
- OAuth 2.0 Client ID is created
- **Authorized redirect URI** is set to: `http://localhost:3000/api/auth/callback/google`
- **Authorized JavaScript origins** includes: `http://localhost:3000`

### 5. Check Database Connection

Verify your database is accessible and the Account model exists:

```bash
npx prisma validate
npx prisma generate
```

## Common Issues and Solutions

### Issue: "Google OAuth credentials not found" Warning

**Solution:**
- Ensure `.env` file exists in the project root
- Verify variable names are exactly: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Restart the server after adding variables

### Issue: "redirect_uri_mismatch" Error

**Solution:**
- In Google Cloud Console, add exactly: `http://localhost:3000/api/auth/callback/google`
- Wait 1-2 minutes after saving (Google caches redirect URIs)
- Ensure no trailing slashes

### Issue: Database Schema Issues

**Solution:**
```bash
# Ensure Account model exists
npx prisma validate

# If needed, run migrations
npx prisma migrate dev

# Regenerate Prisma client
npx prisma generate
```

### Issue: Better Auth Secret Too Short

**Solution:**
Generate a new secret (must be at least 32 characters):

```bash
openssl rand -base64 32
```

Add to `.env`:
```env
BETTER_AUTH_SECRET=your-generated-secret-here
```

### Issue: CORS Errors

**Solution:**
- Verify `BETTER_AUTH_URL` matches your actual URL
- Check `trustedOrigins` in `lib/auth.js` includes your domain
- Ensure both www and non-www versions are included if needed

## Debugging Steps

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Look at the Network tab
   - Find the failed request to `/api/auth/sign-in/social`
   - Check the Response tab for error details

2. **Check Server Logs:**
   - Look for error messages in your terminal
   - Check for stack traces
   - Look for "Better Auth POST error" or "Better Auth GET error"

3. **Test Google Credentials:**
   - Verify credentials are correct in Google Cloud Console
   - Ensure they're not expired or revoked
   - Check that the OAuth consent screen is configured

4. **Verify Better Auth Configuration:**
   - Check `lib/auth.js` has Google provider configured
   - Ensure `socialProviders` object is not empty
   - Verify no syntax errors in the config

## Still Not Working?

1. **Clear Browser Cache and Cookies:**
   - Clear all site data for localhost:3000
   - Try in an incognito/private window

2. **Check Better Auth Version:**
   ```bash
   npm list better-auth
   ```
   Ensure you're using a recent version (1.4.10+)

3. **Verify Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Check for Conflicting Middleware:**
   - Review `middleware.js` for any conflicts
   - Ensure Better Auth routes are not being blocked

## Getting Help

If the issue persists:

1. Check the exact error message in:
   - Browser console (Network tab)
   - Server terminal logs
   - Better Auth error response

2. Share:
   - The exact error message
   - Server logs (with sensitive data redacted)
   - Your Better Auth configuration (without secrets)
   - Prisma schema (Account model)

3. Common error patterns:
   - `500 Internal Server Error` → Check server logs
   - `redirect_uri_mismatch` → Fix Google Cloud Console
   - `invalid_client` → Check credentials
   - `Email not found` → Check OAuth scopes
