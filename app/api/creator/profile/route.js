import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const headersList = await headers();
    const session = await betterAuth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user from database (Better Auth uses User.id directly)
    const user = await db.user.findUnique({
      where: { id: session.user.id },
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
        name: name || user.name,
        specialty: specialty || user.specialty,
        description: description || user.description,
        portfolioUrls: portfolioUrls.length > 0 ? portfolioUrls : user.portfolioUrls,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
