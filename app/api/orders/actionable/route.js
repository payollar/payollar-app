import { NextResponse } from "next/server";
import { getActionableOrdersCount } from "@/actions/booking-orders";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await getActionableOrdersCount();
    return NextResponse.json({ count: Number(count) || 0 });
  } catch (error) {
    console.error("Actionable orders API error:", error);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
