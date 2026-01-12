import { NextResponse } from "next/server";
import { getVerifiedDoctors } from "@/actions/admin";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await getVerifiedDoctors();
    
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error fetching verified doctors:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch verified doctors",
      },
      { status: 500 }
    );
  }
}
