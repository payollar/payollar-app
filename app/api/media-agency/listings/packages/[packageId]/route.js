import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";

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

    const { packageId } = await params;

    const pkg = await db.mediaListingPackage.findUnique({
      where: { id: packageId },
      include: {
        listing: { include: { agency: true } },
      },
    });

    if (!pkg || pkg.listing.agency.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await db.mediaListingPackage.delete({
      where: { id: packageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting media listing package:", error);
    return NextResponse.json(
      { error: "Failed to delete package" },
      { status: 500 }
    );
  }
}
