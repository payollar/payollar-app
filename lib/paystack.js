/**
 * Paystack API helpers for booking payments.
 * Docs: https://paystack.com/docs/api/
 */

const PAYSTACK_BASE = "https://api.paystack.co";

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not set");
  }
  return key;
}

/**
 * Initialize a Paystack transaction.
 * @param {Object} params
 * @param {number} params.amount - Amount in main currency (e.g. 50 for 50 GHS). Will be converted to subunits (pesewas for GHS).
 * @param {string} params.email - Customer email
 * @param {string} params.callbackUrl - URL Paystack redirects to after payment
 * @param {Object} params.metadata - Custom data (doctorId, startTime, endTime, clientId, description)
 * @param {string} [params.currency='GHS'] - Currency code (GHS, NGN, etc.)
 */
export async function initializeTransaction({
  amount,
  email,
  callbackUrl,
  metadata = {},
  currency = "GHS",
}) {
  const secretKey = getSecretKey();
  // Paystack expects amount in subunits: GHS uses pesewas (1 GHS = 100 pesewas)
  const amountInSubunits = Math.round(Number(amount) * 100);

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountInSubunits,
      currency,
      callback_url: callbackUrl,
      metadata: Object.fromEntries(
        Object.entries(metadata).map(([k, v]) => [k, String(v)])
      ),
    }),
  });

  const data = await res.json();
  if (!data.status || !data.data?.authorization_url) {
    throw new Error(data.message || "Paystack initialization failed");
  }
  return {
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  };
}

/**
 * Verify a Paystack transaction by reference.
 * @param {string} reference - Transaction reference from Paystack redirect
 */
export async function verifyTransaction(reference) {
  const secretKey = getSecretKey();

  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    }
  );

  const data = await res.json();
  if (!data.status || data.data?.status !== "success") {
    return { success: false, error: data.message || "Verification failed" };
  }
  return {
    success: true,
    data: data.data,
    metadata: data.data.metadata || {},
  };
}
