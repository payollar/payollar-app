import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(req, { params }) {
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

    const { timeClassId } = await params;
    const body = await req.json();

    const tc = await db.mediaListingTimeClass.findUnique({
      where: { id: timeClassId },
      include: {
        listing: { include: { agency: true } },
      },
    });

    if (!tc || tc.listing.agency.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const data = {};
    if (body.label !== undefined) data.label = String(body.label).trim();
    if (body.timeRange !== undefined) data.timeRange = String(body.timeRange).trim();
    if (body.ratePer30Sec != null) data.ratePer30Sec = Number(body.ratePer30Sec);
    if (body.sortOrder != null) data.sortOrder = Number(body.sortOrder);

    const timeClass = await db.mediaListingTimeClass.update({
      where: { id: timeClassId },
      data,
    });

    return NextResponse.json({
      success: true,
      timeClass,
    });
  } catch (error) {
    console.error("Error updating time class:", error);
    return NextResponse.json(
      { error: "Failed to update time class" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
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

    const { timeClassId } = await params;

    const tc = await db.mediaListingTimeClass.findUnique({
      where: { id: timeClassId },
      include: {
        listing: { include: { agency: true } },
      },
    });

    if (!tc || tc.listing.agency.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await db.mediaListingTimeClass.delete({
      where: { id: timeClassId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting time class:", error);
    return NextResponse.json(
      { error: "Failed to delete time class" },
      { status: 500 }
    );
  }
}
