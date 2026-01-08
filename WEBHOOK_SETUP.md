# Clerk Webhook Setup

This application uses Clerk webhooks to automatically create users in the database when they sign up.

## Setup Instructions

1. **Get your webhook secret from Clerk Dashboard:**
   - Go to your Clerk Dashboard
   - Navigate to Webhooks
   - Create a new webhook endpoint
   - Set the endpoint URL to: `https://yourdomain.com/api/webhooks/clerk`
   - Subscribe to these events:
     - `user.created`
     - `user.updated`
     - `user.deleted`
   - Copy the webhook signing secret

2. **Add the webhook secret to your environment variables:**
   ```env
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

3. **Deploy and test:**
   - The webhook will automatically create users when they sign up
   - If the webhook fails, the app will fall back to creating users on first login

## Troubleshooting

- If users aren't being created automatically, check:
  1. Webhook URL is correct in Clerk dashboard
  2. `CLERK_WEBHOOK_SECRET` is set correctly
  3. Webhook events are subscribed correctly
  4. Check server logs for webhook errors

- The app has fallback logic to create users if webhooks fail, but webhooks are the preferred method.

