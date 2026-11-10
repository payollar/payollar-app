import { NextResponse } from "next/server";
import { getUnreadBookingMessageCount } from "@/actions/booking-chat";
import { getUnreadMediaNegotiationCount } from "@/actions/media-negotiate";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [bookingCount, mediaCount] = await Promise.all([
      getUnreadBookingMessageCount(),
      getUnreadMediaNegotiationCount(),
    ]);
    return NextResponse.json({
      count: (Number(bookingCount) || 0) + (Number(mediaCount) || 0),
    });
  } catch (error) {
    console.error("Unread messages API error:", error);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
