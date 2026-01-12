import { NextResponse } from "next/server";
import { getPendingMediaAgencies } from "@/actions/admin";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await getPendingMediaAgencies();
    
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error fetching pending agencies:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch pending agencies",
      },
      { status: 500 }
    );
  }
}
