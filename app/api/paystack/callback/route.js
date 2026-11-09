import { NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import {
  fulfillPayollarBookingPayment,
  isPayollarBookingPayment,
} from "@/lib/paystack-fulfill-booking";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "";
  const bookingsUrl = `${baseUrl}/client/bookings`;

  if (!reference) {
    return NextResponse.redirect(
      `${bookingsUrl}?success=0&error=missing_reference`
    );
  }

  try {
    const result = await verifyTransaction(reference);
    if (!result.success || !result.metadata) {
      return NextResponse.redirect(
        `${bookingsUrl}?success=0&error=verification_failed`
      );
    }

    const metadata = result.metadata || {};

    // Shared Paystack keys may include other companies' charges
    if (!isPayollarBookingPayment(metadata)) {
      return NextResponse.redirect(
        `${bookingsUrl}?success=0&error=invalid_metadata`
      );
    }

    const paidAmountGhs =
      typeof result.data?.amount === "number"
        ? result.data.amount / 100
        : null;

    const fulfilled = await fulfillPayollarBookingPayment({
      metadata,
      reference,
      paidAmountGhs,
    });

    if (!fulfilled.ok) {
      return NextResponse.redirect(
        `${bookingsUrl}?success=0&error=${fulfilled.error || "booking_failed"}`
      );
    }

    return NextResponse.redirect(`${bookingsUrl}?success=1`);
  } catch (error) {
    console.error("Paystack callback error:", error);
    return NextResponse.redirect(
      `${bookingsUrl}?success=0&error=booking_failed`
    );
  }
}
