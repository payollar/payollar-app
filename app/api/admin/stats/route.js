import { NextResponse } from "next/server";
import { getUserStats } from "@/actions/admin";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const stats = await getUserStats();
    
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch stats",
      },
      { status: 500 }
    );
  }
}
