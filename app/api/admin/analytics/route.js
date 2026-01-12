import { NextResponse } from "next/server";
import { getAdminAnalytics } from "@/actions/admin";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const analytics = await getAdminAnalytics();
    
    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch analytics",
      },
      { status: 500 }
    );
  }
}
