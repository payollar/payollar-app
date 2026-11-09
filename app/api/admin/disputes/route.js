import { NextResponse } from "next/server";
import { getDisputes } from "@/actions/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL";
    const result = await getDisputes({ status });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error fetching disputes:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch disputes",
      },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
