import { NextResponse } from "next/server";
import { getPendingPayouts } from "@/actions/admin";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await getPendingPayouts();
    
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error fetching pending payouts:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch pending payouts",
      },
      { status: 500 }
    );
  }
}
