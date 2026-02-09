import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req, { params }) {
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

    const { listingId } = await params;

    const listing = await db.mediaListing.findUnique({
      where: { id: listingId },
      include: {
        agency: true,
        timeClasses: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!listing || listing.agency.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      timeClasses: listing.timeClasses || [],
    });
  } catch (error) {
    console.error("Error fetching time classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch time classes" },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
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

    const { listingId } = await params;
    const body = await req.json();
    const { label, timeRange, ratePer30Sec } = body;

    if (!listingId || !label?.trim() || !timeRange?.trim() || ratePer30Sec == null) {
      return NextResponse.json(
        { error: "Missing required fields: label, timeRange, ratePer30Sec" },
        { status: 400 }
      );
    }

    const listing = await db.mediaListing.findUnique({
      where: { id: listingId },
      include: { agency: true },
    });

    if (!listing || listing.agency.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const count = await db.mediaListingTimeClass.count({
      where: { listingId },
    });

    const timeClass = await db.mediaListingTimeClass.create({
      data: {
        listingId,
        label: label.trim(),
        timeRange: timeRange.trim(),
        ratePer30Sec: Number(ratePer30Sec),
        sortOrder: count,
      },
    });

    return NextResponse.json({
      success: true,
      timeClass,
    });
  } catch (error) {
    console.error("Error creating time class:", error);
    return NextResponse.json(
      { error: "Failed to create time class" },
      { status: 500 }
    );
  }
}
