import { NextResponse } from "next/server";
import { getPendingDoctors } from "@/actions/admin";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await getPendingDoctors();
    
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error fetching pending doctors:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch pending doctors",
      },
      { status: 500 }
    );
  }
}
