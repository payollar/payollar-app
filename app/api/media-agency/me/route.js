import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import {
  effectiveAgencyMediaType,
  isMediaAgencyAdminEmail,
  isValidMediaAgencyType,
  normalizeMediaAgencyType,
} from "@/lib/media-agency-type";

/**
 * GET /api/media-agency/me — current agency profile (incl. primaryMediaType)
 */
export async function GET() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "MEDIA_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agency = await db.mediaAgency.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        agencyName: true,
        contactName: true,
        email: true,
        primaryMediaType: true,
        verificationStatus: true,
      },
    });

    if (!agency) {
      return NextResponse.json(
        { error: "Media agency not found" },
        { status: 404 }
      );
    }

    const isMediaAdmin =
      isMediaAgencyAdminEmail(user.email) ||
      isMediaAgencyAdminEmail(agency.email);

    return NextResponse.json({
      success: true,
      agency: {
        ...agency,
        isMediaAdmin,
        // null = all types (admin or unset)
        scopedMediaType: effectiveAgencyMediaType({
          email: user.email,
          agencyEmail: agency.email,
          primaryMediaType: agency.primaryMediaType,
          isMediaAdmin,
        }),
      },
    });
  } catch (error) {
    console.error("Error fetching media agency profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch agency profile" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/media-agency/me — set primaryMediaType (for Google / legacy accounts)
 */
export async function PATCH(request) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "MEDIA_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const primaryMediaType = normalizeMediaAgencyType(body.primaryMediaType);

    if (!primaryMediaType || !isValidMediaAgencyType(primaryMediaType)) {
      return NextResponse.json(
        { error: "Choose a valid media type" },
        { status: 400 }
      );
    }

    const agency = await db.mediaAgency.findUnique({
      where: { userId: user.id },
      select: { id: true, primaryMediaType: true },
    });

    if (!agency) {
      return NextResponse.json(
        { error: "Media agency not found" },
        { status: 404 }
      );
    }

    const isMediaAdmin = isMediaAgencyAdminEmail(user.email);

    // Allow first-time set; block changing once set (keeps vertical stable).
    // Media admins may leave type unset / change freely for multi-vertical QA.
    if (
      !isMediaAdmin &&
      agency.primaryMediaType &&
      agency.primaryMediaType !== primaryMediaType
    ) {
      return NextResponse.json(
        {
          error:
            "Media type is already set for this agency. Contact support to change it.",
        },
        { status: 400 }
      );
    }

    const updated = await db.mediaAgency.update({
      where: { id: agency.id },
      data: { primaryMediaType },
      select: {
        id: true,
        agencyName: true,
        primaryMediaType: true,
        verificationStatus: true,
      },
    });

    return NextResponse.json({ success: true, agency: updated });
  } catch (error) {
    console.error("Error updating media agency profile:", error);
    return NextResponse.json(
      { error: "Failed to update agency profile" },
      { status: 500 }
    );
  }
}
