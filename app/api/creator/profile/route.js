import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user from database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "CREATOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const specialty = formData.get("specialty");
    const description = formData.get("description");
    const portfolioUrls = formData.getAll("portfolioUrls");

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        name: name || null,
        specialty: specialty || null,
        description: description || null,
        portfolioUrls: portfolioUrls.length > 0 ? portfolioUrls : [],
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating creator profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

