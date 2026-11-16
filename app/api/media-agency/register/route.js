import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";

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

    if (!agencyName || !contactName || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure role is MEDIA_AGENCY
    await db.user.update({
      where: { id: session.user.id },
      data: { role: "MEDIA_AGENCY" },
    });

    // Idempotent: update existing profile or create a new one
    const existingAgency = await db.mediaAgency.findUnique({
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
            verificationStatus: "PENDING",
          },
        });

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
