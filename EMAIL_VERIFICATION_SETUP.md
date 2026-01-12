# Email Verification & Welcome Email Setup

This document explains how email verification and welcome emails work in Payollar using Resend and Better Auth.

## Email Flow

### 1. Sign-Up Flow

When a user signs up (via email/password or Google OAuth):

1. **User signs up** → Better Auth creates the user account
2. **Verification email sent automatically** → User receives an email with a verification link
3. **User clicks verification link** → Email is verified
4. **Welcome/Onboarding email sent** → User receives a welcome email with onboarding instructions

### 2. Email Templates

#### Verification Email (`sendVerificationEmail`)
- **When**: Sent automatically after sign-up (`sendOnSignUp: true`)
- **Purpose**: Verify the user's email address
- **Content**: 
  - Verification button/link
  - Security note about 24-hour expiration
  - Fallback link if button doesn't work
- **Expiration**: 24 hours

#### Welcome/Onboarding Email (`sendWelcomeEmail`)
- **When**: Sent automatically after email verification (`afterEmailVerification` hook)
- **Purpose**: Welcome new users and guide them through onboarding
- **Content**:
  - Welcome message
  - Step-by-step onboarding guide (3 steps)
  - What they can do on Payollar
  - Link to complete onboarding
  - Support information

## Configuration

### Better Auth Configuration (`lib/auth.js`)

```javascript
emailVerification: {
  sendVerificationEmail: async ({ user, url, token }, request) => {
    const { sendVerificationEmail } = await import("./email");
    await sendVerificationEmail(user.email, user.name || "User", url, token);
  },
  sendOnSignUp: true, // Automatically send verification email after sign-up
  autoSignInAfterVerification: false, // Don't auto sign-in
  expiresIn: 60 * 60 * 24, // 24 hours
  afterEmailVerification: async (user, request) => {
    // Send welcome email after verification
    const { sendWelcomeEmail } = await import("./email");
    await sendWelcomeEmail(user.email, user.name || "User");
  },
}
```

### Email Functions (`lib/email.js`)

- `sendVerificationEmail(userEmail, userName, verificationUrl, token)` - Sends verification email
- `sendWelcomeEmail(userEmail, userName)` - Sends welcome/onboarding email

## Environment Variables

Make sure these are set in your `.env` file:

```env
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@info.payollar.com
RESEND_SUPPORT_EMAIL=support@info.payollar.com

# App URLs (used in email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or https://payollar.com for production
BETTER_AUTH_URL=http://localhost:3000      # or https://payollar.com for production
```

## Testing

### Local Development

1. **Sign up a new user** via email/password or Google OAuth
2. **Check email inbox** - You should receive:
   - Verification email immediately
   - After clicking verification link: Welcome email
3. **Verify the emails contain**:
   - Correct branding and styling
   - Working links
   - Proper user name

### Production

1. Ensure `RESEND_API_KEY` is set in production environment
2. Verify your domain in Resend dashboard
3. Update `RESEND_FROM_EMAIL` to use your verified domain
4. Test the full flow in production

## Email Verification Flow Details

### Step 1: Sign-Up
- User completes sign-up form
- Better Auth creates account
- `sendVerificationEmail` is called automatically
- User receives verification email

### Step 2: Email Verification
- User clicks verification link in email
- Better Auth verifies the token
- Email is marked as verified in database
- `afterEmailVerification` hook is triggered
- User is redirected (if `autoSignInAfterVerification` is true)

### Step 3: Welcome Email
- `afterEmailVerification` hook sends welcome email
- User receives onboarding instructions
- User can proceed to complete their profile

## Customization

### Modify Verification Email

Edit `sendVerificationEmail` function in `lib/email.js`:
- Change styling/colors
- Modify expiration message
- Add custom content

### Modify Welcome Email

Edit `sendWelcomeEmail` function in `lib/email.js`:
- Update onboarding steps
- Change call-to-action button
- Add more information about features

### Change Verification Settings

In `lib/auth.js`, you can modify:
- `sendOnSignUp`: Set to `false` to disable auto-sending
- `expiresIn`: Change token expiration time (in seconds)
- `autoSignInAfterVerification`: Set to `true` to auto sign-in after verification
- `requireEmailVerification`: Set to `true` in `emailAndPassword` to require verification before login

## Troubleshooting

### Verification Email Not Sending

1. **Check Resend API Key**: Verify `RESEND_API_KEY` is set correctly
2. **Check Resend Dashboard**: Look for error logs
3. **Check Server Logs**: Look for email sending errors
4. **Verify Domain**: If using custom domain, ensure it's verified in Resend

### Welcome Email Not Sending

1. **Check `afterEmailVerification` hook**: Ensure it's properly configured
2. **Check if email was verified**: Welcome email only sends after verification
3. **Check server logs**: Look for errors in the hook execution
4. **Verify email function**: Test `sendWelcomeEmail` independently

### Links Not Working

1. **Check `NEXT_PUBLIC_APP_URL`**: Ensure it matches your actual domain
2. **Check `BETTER_AUTH_URL`**: Should match your app URL
3. **Verify callback URLs**: Better Auth callback URLs should be correct

## Security Notes

1. **Verification tokens expire** after 24 hours for security
2. **Email verification is required** before certain actions (if `requireEmailVerification` is enabled)
3. **Welcome email is sent** only after successful verification
4. **Email failures don't block** the verification process (errors are logged but don't throw)

## Next Steps

- Consider adding email verification reminders
- Add resend verification email functionality
- Customize email templates based on user role
- Add email preferences for users
