# Paystack integration (bookings payment)

Bookings on the platform use [Paystack](https://paystack.com) for payments. After the user selects a time slot and clicks **Pay with Paystack**, they are redirected to Paystack to pay; on success they are redirected back and the appointment is created.

## Environment variables

Add to your `.env`:

```env
# Paystack (required for booking payments)
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxx   # Test key for development, sk_live_xxx for production

# App URL (used for Paystack callback)
NEXT_PUBLIC_APP_URL=http://localhost:3000   # Your app URL (e.g. https://yourapp.com)
```

- **PAYSTACK_SECRET_KEY**: From [Paystack Dashboard](https://dashboard.paystack.com) → Settings → API Keys. Use test keys (`sk_test_...`) for development and live keys (`sk_live_...`) for production.
- **NEXT_PUBLIC_APP_URL**: Base URL of your app. Paystack redirects users to `{NEXT_PUBLIC_APP_URL}/api/paystack/callback` after payment.

## Flow

1. Client selects a talent and time slot, then clicks **Pay with Paystack**.
2. App calls `POST /api/paystack/initialize` with `doctorId`, `startTime`, `endTime`, `description`.
3. Backend creates a Paystack transaction (amount from talent’s first service rate or default 50 GHS) and returns `authorization_url`.
4. User is redirected to Paystack, completes payment.
5. Paystack redirects to `/api/paystack/callback?reference=xxx`.
6. Backend verifies the transaction with Paystack, creates the appointment and video session, then redirects to `/client/bookings?success=1`.

## Currency

Payments are in **GHS** (Ghanaian Cedi). To use another currency (e.g. NGN), change the `currency` argument in `app/api/paystack/initialize/route.js` and ensure amounts are in the correct subunits (kobo for NGN, etc.).
