import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req) {
  try {
    const headersList = await headers();
    const session = await betterAuth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user already has a role
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    // Only set role if user doesn't have one yet (UNASSIGNED or null)
    if (user && user.role && user.role !== "UNASSIGNED") {
      return NextResponse.json({
        success: true,
        message: "User already has a role",
        role: user.role,
      });
    }

    // Update user role to MEDIA_AGENCY
    await db.user.update({
      where: { id: session.user.id },
      data: { role: "MEDIA_AGENCY" },
    });

    return NextResponse.json({
      success: true,
      message: "Role set to MEDIA_AGENCY",
    });
  } catch (error) {
    console.error("Error setting media agency role:", error);
    return NextResponse.json(
      { error: "Failed to set role" },
      { status: 500 }
    );
  }
}
