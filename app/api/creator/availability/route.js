import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
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

    // Fetch availability slots
    const availabilitySlots = await db.availability.findMany({
      where: {
        creatorId: user.id,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json({
      slots: availabilitySlots || [],
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability", slots: [] },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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
    const startTime = formData.get("startTime");
    const endTime = formData.get("endTime");

    // Validate input
    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "Start time and end time are required" },
        { status: 400 }
      );
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: "Start time must be before end time" },
        { status: 400 }
      );
    }

    // Delete existing slots (we're replacing them with new ones)
    // Note: We keep the system simple - one availability slot per creator
    await db.availability.deleteMany({
      where: {
        creatorId: user.id,
      },
    });

    // Create new availability slot
    const newSlot = await db.availability.create({
      data: {
        creatorId: user.id,
        startTime: startDate,
        endTime: endDate,
        status: "AVAILABLE",
      },
    });

    revalidatePath("/creator");
    revalidatePath("/creator/profile");
    revalidatePath("/creator/availability");

    return NextResponse.json({
      success: true,
      slots: [newSlot],
    });
  } catch (error) {
    console.error("Error saving availability:", error);
    return NextResponse.json(
      { error: "Failed to save availability" },
      { status: 500 }
    );
  }
}
