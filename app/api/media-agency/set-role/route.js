import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Google / OAuth media-agency entry: set MEDIA_AGENCY role and ensure a profile exists
 * so the user can open the dashboard without a dead-end.
 */
export async function POST() {
  try {
    const headersList = await headers();
    const session = await betterAuth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
        mediaAgency: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Don't overwrite an existing non-agency role
    if (user.role && user.role !== "UNASSIGNED" && user.role !== "MEDIA_AGENCY") {
      return NextResponse.json({
        success: true,
        message: "User already has a different role",
        role: user.role,
        hasMediaAgency: false,
      });
    }

    if (user.role !== "MEDIA_AGENCY") {
      await db.user.update({
        where: { id: user.id },
        data: { role: "MEDIA_AGENCY" },
      });
    }

    let agencyId = user.mediaAgency?.id || null;

    if (!agencyId) {
      const contactName = (user.name || "").trim() || "Agency contact";
      const agencyName =
        (user.name || "").trim() ||
        (user.email ? user.email.split("@")[0] : "My Media Agency");

      const agency = await db.mediaAgency.create({
        data: {
          userId: user.id,
          agencyName,
          contactName,
          email: user.email,
          verificationStatus: "PENDING",
        },
        select: { id: true },
      });
      agencyId = agency.id;
    }

    return NextResponse.json({
      success: true,
      message: "Media agency ready",
      role: "MEDIA_AGENCY",
      hasMediaAgency: true,
      agencyId,
    });
  } catch (error) {
    console.error("Error setting media agency role:", error);
    return NextResponse.json({ error: "Failed to set role" }, { status: 500 });
  }
}
