import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { normalizeMediaAgencyType } from "@/lib/media-agency-type";

export async function POST(req) {
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

    const body = await req.json();
    const { agencyName, contactName, email, phone, website } = body;
    const primaryMediaType = normalizeMediaAgencyType(body.primaryMediaType);

    if (!agencyName || !contactName || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!primaryMediaType) {
      return NextResponse.json(
        { error: "Select your media type (TV, Radio, etc.)" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: true,
        mediaAgency: { select: { id: true } },
      },
    });

    const isNewAgency = !existingUser?.mediaAgency?.id;

    // Ensure role is MEDIA_AGENCY
    await db.user.update({
      where: { id: session.user.id },
      data: { role: "MEDIA_AGENCY" },
    });

    // Idempotent: update existing profile or create a new one
    const existingAgency = existingUser?.mediaAgency?.id
      ? await db.mediaAgency.findUnique({
          where: { id: existingUser.mediaAgency.id },
        })
      : await db.mediaAgency.findUnique({
          where: { userId: session.user.id },
        });

    const mediaAgency = existingAgency
      ? await db.mediaAgency.update({
          where: { id: existingAgency.id },
          data: {
            agencyName,
            contactName,
            email,
            phone: phone || null,
            website: website || null,
            // Keep existing type if already set; otherwise apply signup choice
            primaryMediaType:
              existingAgency.primaryMediaType || primaryMediaType,
          },
        })
      : await db.mediaAgency.create({
          data: {
            userId: session.user.id,
            agencyName,
            contactName,
            email,
            phone: phone || null,
            website: website || null,
            primaryMediaType,
            verificationStatus: "PENDING",
          },
        });

    // Email only when this request creates the agency profile (not on later edits).
    // Google path usually emails from set-role instead when it creates the stub first.
    if (isNewAgency) {
      try {
        const { notifyRoleSignupEmails } = await import("@/lib/email");
        await notifyRoleSignupEmails({
          email: email || session.user.email,
          name: contactName || session.user.name,
          role: "MEDIA_AGENCY",
          agencyName,
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
      mediaAgency,
    });
  } catch (error) {
    console.error("Media agency registration error:", error);
    return NextResponse.json(
      { error: "Failed to register media agency" },
      { status: 500 }
    );
  }
}
