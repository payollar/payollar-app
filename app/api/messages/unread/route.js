import { NextResponse } from "next/server";
import { getUnreadBookingMessageCount } from "@/actions/booking-chat";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await getUnreadBookingMessageCount();
    return NextResponse.json({ count: Number(count) || 0 });
  } catch (error) {
    console.error("Unread messages API error:", error);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
