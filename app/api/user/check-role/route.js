import { NextResponse } from "next/server";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await checkUser();

    if (!user) {
      return NextResponse.json({ role: null, hasMediaAgency: false }, { status: 200 });
    }

    let hasMediaAgency = false;
    if (user.role === "MEDIA_AGENCY") {
      const agency = await db.mediaAgency.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      hasMediaAgency = Boolean(agency);
    }

    return NextResponse.json({
      role: user.role,
      verificationStatus: user.verificationStatus,
      hasMediaAgency,
    });
  } catch (error) {
    console.error("Error checking user role:", error);
    return NextResponse.json(
      { error: "Failed to check user role" },
      { status: 500 }
    );
  }
}
