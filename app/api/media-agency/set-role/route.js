import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { normalizeMediaAgencyType } from "@/lib/media-agency-type";

/**
 * Google / OAuth media-agency entry: set MEDIA_AGENCY role and ensure a profile exists
 * so the user can open the dashboard without a dead-end.
 */
export async function POST(request) {
  try {
    const headersList = await headers();
    const session = await betterAuth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let primaryMediaType = null;
    try {
      const body = await request.json();
      primaryMediaType = normalizeMediaAgencyType(body?.primaryMediaType);
    } catch {
      // empty body is fine
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
        mediaAgency: {
          select: { id: true, agencyName: true, primaryMediaType: true },
        },
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

    const wasUnassigned = !user.role || user.role === "UNASSIGNED";

    if (user.role !== "MEDIA_AGENCY") {
      await db.user.update({
        where: { id: user.id },
        data: { role: "MEDIA_AGENCY" },
      });
    }

    let agencyId = user.mediaAgency?.id || null;
    let agencyName = user.mediaAgency?.agencyName || null;
    let agencyPrimaryType = user.mediaAgency?.primaryMediaType || null;
    let createdNewAgency = false;

    if (!agencyId) {
      const contactName = (user.name || "").trim() || "Agency contact";
      agencyName =
        (user.name || "").trim() ||
        (user.email ? user.email.split("@")[0] : "My Media Agency");

      const agency = await db.mediaAgency.create({
        data: {
          userId: user.id,
          agencyName,
          contactName,
          email: user.email,
          primaryMediaType: primaryMediaType || null,
          verificationStatus: "PENDING",
        },
        select: { id: true, agencyName: true, primaryMediaType: true },
      });
      agencyId = agency.id;
      agencyName = agency.agencyName;
      agencyPrimaryType = agency.primaryMediaType;
      createdNewAgency = true;
    } else if (!agencyPrimaryType && primaryMediaType) {
      const updated = await db.mediaAgency.update({
        where: { id: agencyId },
        data: { primaryMediaType },
        select: { primaryMediaType: true },
      });
      agencyPrimaryType = updated.primaryMediaType;
    }

    // First-time assignment / first agency profile only
    if (wasUnassigned || createdNewAgency) {
      try {
        const { notifyRoleSignupEmails } = await import("@/lib/email");
        await notifyRoleSignupEmails({
          email: user.email,
          name: user.name,
          role: "MEDIA_AGENCY",
          agencyName: agencyName || undefined,
        });
      } catch (emailError) {
        console.error(
          "MEDIA_AGENCY welcome email failed:",
          emailError?.message || emailError
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Media agency ready",
      role: "MEDIA_AGENCY",
      hasMediaAgency: true,
      agencyId,
      primaryMediaType: agencyPrimaryType,
    });
  } catch (error) {
    console.error("Error setting media agency role:", error);
    return NextResponse.json({ error: "Failed to set role" }, { status: 500 });
  }
}
