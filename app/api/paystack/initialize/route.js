import { NextResponse } from "next/server";
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/prisma";
import { initializeTransaction } from "@/lib/paystack";

const DEFAULT_BOOKING_AMOUNT_GHS = 50;

export async function POST(request) {
  try {
    const headersList = await headers();
    const session = await betterAuth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await db.user.findUnique({
      where: { id: session.user.id, role: "CLIENT" },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Only clients can book appointments" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { doctorId, startTime, endTime, description } = body;

    if (!doctorId || !startTime || !endTime) {
      return NextResponse.json(
        { error: "doctorId, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "CREATOR",
        verificationStatus: "VERIFIED",
      },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Talent not found or not verified" },
        { status: 404 }
      );
    }

    // Booking amount: use creator's first service rate (in GHS) or default
    let amountGHS = DEFAULT_BOOKING_AMOUNT_GHS;
    if (doctor.services?.[0]?.rate != null) {
      amountGHS = Number(doctor.services[0].rate);
      if (amountGHS < 0.1) amountGHS = DEFAULT_BOOKING_AMOUNT_GHS;
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "";
    const callbackUrl = `${baseUrl}/api/paystack/callback`;

    const { authorizationUrl } = await initializeTransaction({
      amount: amountGHS,
      email: client.email,
      callbackUrl,
      metadata: {
        doctorId,
        clientId: client.id,
        startTime,
        endTime,
        description: description || "",
      },
      currency: "GHS",
    });

    return NextResponse.json({ authorizationUrl, amount: amountGHS });
  } catch (error) {
    console.error("Paystack initialize error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
