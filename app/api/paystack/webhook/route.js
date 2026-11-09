import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  fulfillPayollarBookingPayment,
  isPayollarBookingPayment,
} from "@/lib/paystack-fulfill-booking";

/**
 * Optional Paystack webhook. Safe on a shared Paystack account: only fulfills
 * charges that carry Payollar booking metadata (doctorId + clientId).
 *
 * Set PAYSTACK_WEBHOOK_SECRET to the secret from Paystack dashboard if used.
 */
export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";
    const secret =
      process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;

    if (secret) {
      const hash = crypto
        .createHmac("sha512", secret)
        .update(rawBody)
        .digest("hex");
      if (hash !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    if (event?.event !== "charge.success") {
      return NextResponse.json({ received: true, ignored: true });
    }

    const data = event.data || {};
    const metadata = data.metadata || {};

    if (!isPayollarBookingPayment(metadata)) {
      // Other company / non-booking payments on the same Paystack key
      return NextResponse.json({ received: true, ignored: "not_payollar_booking" });
    }

    const paidAmountGhs =
      typeof data.amount === "number" ? data.amount / 100 : null;

    const fulfilled = await fulfillPayollarBookingPayment({
      metadata,
      reference: data.reference || null,
      paidAmountGhs,
    });

    return NextResponse.json({
      received: true,
      fulfilled: fulfilled.ok,
      error: fulfilled.ok ? undefined : fulfilled.error,
    });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
