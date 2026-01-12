import { NextResponse } from "next/server";
import { getAllUsers, getUserStats } from "@/actions/admin";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1", 10);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "ALL";
    const verificationStatus = searchParams.get("verificationStatus") || "ALL";

    const [usersData, stats] = await Promise.all([
      getAllUsers({
        page,
        limit: 50,
        search,
        role: role !== "ALL" ? role : null,
        verificationStatus: verificationStatus !== "ALL" ? verificationStatus : null,
      }),
      getUserStats(),
    ]);

    return NextResponse.json({
      success: true,
      users: usersData.users,
      pagination: usersData.pagination,
      stats,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
