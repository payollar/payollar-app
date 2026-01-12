# Resend Email Setup Guide

This application uses [Resend](https://resend.com) for all email functionality.

## Setup Instructions

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com) and sign up for a free account
2. Verify your email address

### 2. Get Your API Key

1. Navigate to the [API Keys](https://resend.com/api-keys) page in your Resend dashboard
2. Click "Create API Key"
3. Give it a name (e.g., "Payollar Production")
4. Copy the API key (you'll only see it once!)

### 3. Verify Your Domain (Recommended for Production)

For production, you should verify your domain:

1. Go to [Domains](https://resend.com/domains) in your Resend dashboard
2. Click "Add Domain"
3. Follow the DNS configuration instructions
4. Once verified, you can send emails from any address on that domain (e.g., `noreply@yourdomain.com`)

### 4. Configure Environment Variables

Add the following to your `.env` file:

```env
# Resend Email Configuration
RESEND_API_KEY="re_your_resend_api_key_here"
RESEND_FROM_EMAIL="noreply@info.payollar.com"
RESEND_SUPPORT_EMAIL="support@info.payollar.com"
```

**Note:** 
- Using `info.payollar.com` as the verified domain in Resend
- For development/testing, you can use Resend's test domain: `onboarding@resend.dev` (if you want to test without domain verification)
- For production, use `noreply@info.payollar.com` and `support@info.payollar.com`

### 5. Test Email Sending

The application will automatically send emails for:
- ✅ Welcome emails when users sign up
- ✅ Support request confirmations
- ✅ Verification status updates (verified/rejected)
- ✅ Appointment confirmations

## Email Templates

All email templates are defined in `/lib/email.js`:

- `sendSupportRequestEmail()` - Sends support requests to the support team
- `sendSupportConfirmationEmail()` - Confirms support request to user
- `sendVerificationStatusEmail()` - Notifies creators of verification status
- `sendWelcomeEmail()` - Welcomes new users
- `sendAppointmentConfirmationEmail()` - Confirms appointment bookings

## Troubleshooting

### Emails not sending?

1. **Check your API key**: Make sure `RESEND_API_KEY` is set correctly
2. **Check domain verification**: If using a custom domain, ensure it's verified
3. **Check email addresses**: Make sure the `from` email is valid
4. **Check Resend dashboard**: Look for error logs in your Resend dashboard
5. **Check server logs**: Look for email errors in your application logs

### Development vs Production

- **Development**: Use `onboarding@resend.dev` as your from email (no verification needed)
- **Production**: Use your verified domain email addresses

## Rate Limits

Resend free tier includes:
- 3,000 emails/month
- 100 emails/day

For higher limits, upgrade your Resend plan.

## Support

For Resend-specific issues, check:
- [Resend Documentation](https://resend.com/docs)
- [Resend Support](https://resend.com/support)
