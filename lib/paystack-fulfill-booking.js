import { format } from "date-fns";
import { Vonage } from "@vonage/server-sdk";
import { Auth } from "@vonage/auth";
import { db } from "@/lib/prisma";
import { ensureBookingConversation } from "@/lib/booking-chat";
import { checklistLabelsFromBrief } from "@/lib/booking-brief";
import { sendAppointmentConfirmationEmail } from "@/lib/email";
import { buildChecklistFromDeliverables } from "@/lib/social-metrics";

const credentials = new Auth({
  applicationId: process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID,
  privateKey: process.env.VONAGE_PRIVATE_KEY,
});
const vonage = new Vonage(credentials, {});

async function createVideoSession() {
  try {
    if (
      !process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID ||
      !process.env.VONAGE_PRIVATE_KEY
    ) {
      return null;
    }
    const session = await vonage.video.createSession({ mediaMode: "routed" });
    return session.sessionId;
  } catch (error) {
    console.error("Vonage session creation failed (continuing without video):", error);
    return null;
  }
}

function moneyLabel(amount) {
  return `GH₵ ${Number(amount || 0).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

async function postPaymentChatNotice({
  appointmentId,
  clientId,
  amount,
  reference,
}) {
  try {
    const conversation = await ensureBookingConversation(appointmentId);
    if (!conversation) return;

    const body = reference
      ? `Payment confirmed · ${moneyLabel(amount)} (ref ${reference})`
      : `Payment confirmed · ${moneyLabel(amount)}`;

    await db.bookingMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: clientId,
        body,
        kind: "TEXT",
      },
    });
    await db.bookingConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });
  } catch (error) {
    console.error("Failed to post payment chat notice:", error);
  }
}

/**
 * Payollar booking payments only. Shared Paystack accounts may send unrelated
 * charges — ignore anything without booking metadata (doctorId + clientId).
 */
export function isPayollarBookingPayment(metadata = {}) {
  const doctorId = metadata.doctorId || metadata.creatorId || null;
  const clientId = metadata.clientId || null;
  return Boolean(doctorId && clientId);
}

/**
 * Mark invoice PAID, schedule appointment, open chat notice.
 * Idempotent for already-paid invoices.
 *
 * @returns {{ ok: true, appointmentId: string } | { ok: false, error: string }}
 */
export async function fulfillPayollarBookingPayment({
  metadata = {},
  reference = null,
  paidAmountGhs = null,
}) {
  if (!isPayollarBookingPayment(metadata)) {
    return { ok: false, error: "not_payollar_booking" };
  }

  const doctorId = metadata.doctorId || metadata.creatorId || null;
  const clientId = metadata.clientId || null;
  const startTime = metadata.startTime || null;
  const endTime = metadata.endTime || null;
  const description = metadata.description || "";
  const invoiceId =
    metadata.invoiceId && String(metadata.invoiceId).trim()
      ? String(metadata.invoiceId).trim()
      : null;
  const metaAppointmentId =
    metadata.appointmentId && String(metadata.appointmentId).trim()
      ? String(metadata.appointmentId).trim()
      : null;

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
    return { ok: false, error: "user_not_found" };
  }

  let invoice = null;
  if (invoiceId) {
    invoice = await db.bookingInvoice.findUnique({
      where: { id: invoiceId },
      include: { appointment: true },
    });
  }

  let appointment = invoice?.appointment || null;

  if (invoice?.status === "PAID" && appointment) {
    return { ok: true, appointmentId: appointment.id, alreadyPaid: true };
  }

  if (!appointment && metaAppointmentId) {
    appointment = await db.appointment.findFirst({
      where: {
        id: metaAppointmentId,
        clientId: client.id,
        creatorId: doctor.id,
      },
    });
  }

  if (!appointment && startTime) {
    const start = new Date(startTime);
    appointment = await db.appointment.findFirst({
      where: {
        clientId: client.id,
        creatorId: doctor.id,
        startTime: start,
        status: { in: ["REQUESTED", "SCHEDULED"] },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  const start = startTime
    ? new Date(startTime)
    : appointment?.startTime
      ? new Date(appointment.startTime)
      : null;
  const end = endTime
    ? new Date(endTime)
    : appointment?.endTime
      ? new Date(appointment.endTime)
      : null;

  if (!appointment && (!start || !end)) {
    return { ok: false, error: "invalid_metadata" };
  }

  const sessionId = await createVideoSession();
  const agreedAmount =
    invoice?.amount != null
      ? Number(invoice.amount)
      : paidAmountGhs != null
        ? paidAmountGhs
        : appointment?.agreedAmount ?? null;

  if (appointment) {
    appointment = await db.appointment.update({
      where: { id: appointment.id },
      data: {
        status:
          appointment.status === "REQUESTED" ? "SCHEDULED" : appointment.status,
        ...(sessionId && !appointment.videoSessionId
          ? { videoSessionId: sessionId }
          : {}),
        ...(description
          ? { clientDescription: description || appointment.clientDescription }
          : {}),
        ...(agreedAmount != null ? { agreedAmount } : {}),
      },
    });
  } else {
    const overlapping = await db.appointment.findFirst({
      where: {
        creatorId: doctorId,
        status: "SCHEDULED",
        OR: [
          { startTime: { lte: start }, endTime: { gt: start } },
          { startTime: { lt: end }, endTime: { gte: end } },
          { startTime: { gte: start }, endTime: { lte: end } },
        ],
      },
    });

    if (overlapping) {
      if (overlapping.clientId === client.id) {
        appointment = await db.appointment.update({
          where: { id: overlapping.id },
          data: {
            ...(sessionId && !overlapping.videoSessionId
              ? { videoSessionId: sessionId }
              : {}),
            ...(description ? { clientDescription: description } : {}),
            ...(agreedAmount != null ? { agreedAmount } : {}),
          },
        });
      } else {
        return { ok: false, error: "slot_no_longer_available" };
      }
    } else {
      appointment = await db.appointment.create({
        data: {
          clientId: client.id,
          creatorId: doctor.id,
          startTime: start,
          endTime: end,
          clientDescription: description || null,
          status: "SCHEDULED",
          source: "TALENT",
          videoSessionId: sessionId,
          ...(agreedAmount != null ? { agreedAmount } : {}),
        },
      });
    }
  }

  try {
    await ensureBookingConversation(appointment.id);
  } catch (chatError) {
    console.error("Failed to open booking chat:", chatError);
  }

  if (invoiceId) {
    try {
      const updated = await db.bookingInvoice.updateMany({
        where: {
          id: invoiceId,
          status: { in: ["SENT", "SUPERSEDED"] },
        },
        data: { status: "PAID" },
      });

      if (updated.count === 0) {
        await db.bookingInvoice.updateMany({
          where: { id: invoiceId, status: { not: "PAID" } },
          data: { status: "PAID" },
        });
      }

      await db.bookingInvoice.updateMany({
        where: {
          appointmentId: appointment.id,
          id: { not: invoiceId },
          status: "SENT",
        },
        data: { status: "SUPERSEDED" },
      });
    } catch (invoiceError) {
      console.error("Failed to mark booking invoice paid:", invoiceError);
    }
  }

  await postPaymentChatNotice({
    appointmentId: appointment.id,
    clientId: client.id,
    amount: agreedAmount ?? paidAmountGhs ?? 0,
    reference,
  });

  // Draft booking report so the client can set metric targets (campaign-style).
  try {
    const existingReport = await db.deliveryReport.findUnique({
      where: { appointmentId: appointment.id },
      select: { id: true },
    });
    if (!existingReport) {
      const brief =
        appointment.clientDescription || description || null;
      const checklist = buildChecklistFromDeliverables(
        checklistLabelsFromBrief(brief),
        { social: false }
      );
      await db.deliveryReport.create({
        data: {
          appointmentId: appointment.id,
          creatorId: appointment.creatorId || doctor.id,
          clientId: appointment.clientId || client.id,
          title: `Booking · ${doctor.name || "Talent"}`,
          checklist,
          proofLinks: [],
          proofFiles: [],
          metrics: {
            platform: null,
            postUrl: null,
            views: null,
            likes: null,
            comments: null,
            shares: null,
            reach: null,
            source: "manual",
            targets: null,
            entries: [],
          },
        },
      });
    }
  } catch (reportError) {
    console.error("Failed to seed booking delivery report:", reportError);
  }

  if (client.email && start && end) {
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

  return { ok: true, appointmentId: appointment.id };
}
