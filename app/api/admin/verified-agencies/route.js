import { NextResponse } from "next/server";
import { getVerifiedMediaAgencies } from "@/actions/admin";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await getVerifiedMediaAgencies();
    
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error fetching verified agencies:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch verified agencies",
      },
      { status: 500 }
    );
  }
}
