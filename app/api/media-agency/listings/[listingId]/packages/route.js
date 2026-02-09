import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";

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
    const { name, price, duration, spots, estimatedViewers } = body;

    if (!listingId || !name || price == null) {
      return NextResponse.json(
        { error: "Missing required fields: name, price" },
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

    const count = await db.mediaListingPackage.count({
      where: { listingId },
    });

    const pkg = await db.mediaListingPackage.create({
      data: {
        listingId,
        name,
        price: Number(price),
        duration: duration || null,
        spots: spots != null ? Number(spots) : null,
        estimatedViewers: estimatedViewers || null,
        sortOrder: count,
      },
    });

    return NextResponse.json({
      success: true,
      package: pkg,
    });
  } catch (error) {
    console.error("Error creating media listing package:", error);
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    );
  }
}
