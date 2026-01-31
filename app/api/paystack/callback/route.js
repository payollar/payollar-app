import { NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { db } from "@/lib/prisma";
import { Vonage } from "@vonage/server-sdk";
import { Auth } from "@vonage/auth";
import { sendAppointmentConfirmationEmail } from "@/lib/email";
import { format } from "date-fns";

const credentials = new Auth({
  applicationId: process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID,
  privateKey: process.env.VONAGE_PRIVATE_KEY,
});
const vonage = new Vonage(credentials, {});

async function createVideoSession() {
  const session = await vonage.video.createSession({ mediaMode: "routed" });
  return session.sessionId;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "";
  const bookingsUrl = `${baseUrl}/client/bookings`;

  if (!reference) {
    return NextResponse.redirect(
      `${bookingsUrl}?success=0&error=missing_reference`
    );
  }

  try {
    const result = await verifyTransaction(reference);
    if (!result.success || !result.metadata) {
      return NextResponse.redirect(
        `${bookingsUrl}?success=0&error=verification_failed`
      );
    }

    const { doctorId, clientId, startTime, endTime, description } =
      result.metadata;

    if (!doctorId || !clientId || !startTime || !endTime) {
      return NextResponse.redirect(
        `${bookingsUrl}?success=0&error=invalid_metadata`
      );
    }

    const client = await db.user.findUnique({
      where: { id: clientId, role: "CLIENT" },
    });
    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "CREATOR",
        verificationStatus: "VERIFIED",
      },
    });

    if (!client || !doctor) {
      return NextResponse.redirect(
        `${bookingsUrl}?success=0&error=user_not_found`
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    const overlapping = await db.appointment.findFirst({
      where: {
        creatorId: doctorId,
        status: "SCHEDULED",
        OR: [
          {
            startTime: { lte: start },
            endTime: { gt: start },
          },
          {
            startTime: { lt: end },
            endTime: { gte: end },
          },
          {
            startTime: { gte: start },
            endTime: { lte: end },
          },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.redirect(
        `${bookingsUrl}?success=0&error=slot_no_longer_available`
      );
    }

    const sessionId = await createVideoSession();

    await db.appointment.create({
      data: {
        clientId: client.id,
        creatorId: doctor.id,
        startTime: start,
        endTime: end,
        clientDescription: description || null,
        status: "SCHEDULED",
        videoSessionId: sessionId,
      },
    });

    if (client.email) {
      try {
        const duration = Math.round((end - start) / (1000 * 60));
        await sendAppointmentConfirmationEmail(
          client.email,
          client.name || "Client",
          {
            talentName: doctor.name || "Talent",
            date: format(start, "EEEE, MMMM d, yyyy"),
            time: format(start, "h:mm a"),
            duration,
            type: "Video Call",
          }
        );
      } catch (e) {
        console.error("Appointment confirmation email failed:", e);
      }
    }

    return NextResponse.redirect(`${bookingsUrl}?success=1`);
  } catch (error) {
    console.error("Paystack callback error:", error);
    return NextResponse.redirect(
      `${bookingsUrl}?success=0&error=booking_failed`
    );
  }
}
