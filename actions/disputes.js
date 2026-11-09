"use server";

import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/actions/admin";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  imageUrl: true,
  specialty: true,
};

async function requireUser() {
  const auth = await getAuthUserId();
  if (!auth?.userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, role: true, name: true, email: true },
  });

  if (!user) throw new Error("Unauthorized");
  return user;
}

function mapMessage(message, viewerId) {
  return {
    id: message.id,
    body: message.body,
    kind: message.kind || "TEXT",
    createdAt: message.createdAt?.toISOString?.() || message.createdAt,
    mine: viewerId ? message.senderId === viewerId : false,
    sender: message.sender
      ? {
          id: message.sender.id,
          name: message.sender.name,
          email: message.sender.email,
          role: message.sender.role,
          imageUrl: message.sender.imageUrl,
        }
      : null,
  };
}

function toPlainAmount(value) {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function loadBookingChat(appointmentId, viewerId = null) {
  if (!appointmentId) return null;

  const conversation = await db.bookingConversation.findUnique({
    where: { appointmentId },
    include: {
      client: { select: userSelect },
      creator: { select: userSelect },
      appointment: {
        select: {
          id: true,
          status: true,
          startTime: true,
          endTime: true,
          source: true,
          agreedAmount: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 300,
        include: {
          sender: { select: userSelect },
        },
      },
    },
  });

  if (!conversation) return null;

  return {
    appointmentId: conversation.appointmentId,
    appointment: conversation.appointment
      ? {
          id: conversation.appointment.id,
          status: conversation.appointment.status,
          source: conversation.appointment.source,
          agreedAmount: toPlainAmount(conversation.appointment.agreedAmount),
          startTime: conversation.appointment.startTime?.toISOString?.() || null,
          endTime: conversation.appointment.endTime?.toISOString?.() || null,
        }
      : null,
    client: conversation.client,
    creator: conversation.creator,
    messages: (conversation.messages || []).map((message) =>
      mapMessage(message, viewerId)
    ),
  };
}

function serializeDispute(dispute) {
  const appointment = dispute.appointment
    ? {
        id: dispute.appointment.id,
        status: dispute.appointment.status,
        source: dispute.appointment.source || null,
        agreedAmount: toPlainAmount(dispute.appointment.agreedAmount),
        startTime: dispute.appointment.startTime?.toISOString?.() || null,
        endTime: dispute.appointment.endTime?.toISOString?.() || null,
        client: dispute.appointment.client || null,
        creator: dispute.appointment.creator || null,
      }
    : null;

  return {
    id: dispute.id,
    reporterId: dispute.reporterId,
    againstUserId: dispute.againstUserId,
    resolvedById: dispute.resolvedById,
    appointmentId: dispute.appointmentId,
    campaignId: dispute.campaignId,
    type: dispute.type,
    priority: dispute.priority,
    status: dispute.status,
    subject: dispute.subject,
    description: dispute.description,
    resolution: dispute.resolution,
    createdAt: dispute.createdAt?.toISOString?.() || dispute.createdAt,
    updatedAt: dispute.updatedAt?.toISOString?.() || dispute.updatedAt,
    resolvedAt: dispute.resolvedAt?.toISOString?.() || dispute.resolvedAt,
    reporter: dispute.reporter || null,
    againstUser: dispute.againstUser || null,
    resolvedBy: dispute.resolvedBy || null,
    appointment,
    isReporter: Boolean(dispute.isReporter),
  };
}

/**
 * Bookings the current user can file a dispute against.
 */
export async function getDisputeEligibleBookings() {
  const user = await requireUser();

  const appointments = await db.appointment.findMany({
    where: {
      OR: [{ clientId: user.id }, { creatorId: user.id }],
      status: { in: ["REQUESTED", "SCHEDULED", "COMPLETED"] },
    },
    include: {
      client: { select: userSelect },
      creator: { select: userSelect },
      conversation: { select: { id: true } },
      disputes: {
        where: {
          reporterId: user.id,
          status: { in: ["OPEN", "UNDER_REVIEW"] },
        },
        select: { id: true, status: true },
      },
    },
    orderBy: { startTime: "desc" },
    take: 50,
  });

  return {
    bookings: appointments.map((appointment) => {
      const other =
        appointment.clientId === user.id
          ? appointment.creator
          : appointment.client;
      return {
        id: appointment.id,
        status: appointment.status,
        source: appointment.source,
        startTime: appointment.startTime?.toISOString?.(),
        endTime: appointment.endTime?.toISOString?.(),
        agreedAmount: appointment.agreedAmount,
        hasChat: Boolean(appointment.conversation),
        openDisputeId: appointment.disputes[0]?.id || null,
        other,
        roleLabel: appointment.clientId === user.id ? "Client" : "Creator",
      };
    }),
  };
}

/**
 * Create a dispute tied to a booking (and its chat).
 */
export async function createDispute(formData) {
  const user = await requireUser();

  const appointmentId = formData.get("appointmentId");
  const subject = String(formData.get("subject") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priority = formData.get("priority") || "MEDIUM";

  if (!appointmentId || !subject || !description) {
    throw new Error("Booking, subject, and description are required");
  }

  if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) {
    throw new Error("Invalid priority");
  }

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      id: true,
      clientId: true,
      creatorId: true,
      status: true,
    },
  });

  if (!appointment) throw new Error("Booking not found");

  if (
    appointment.clientId !== user.id &&
    appointment.creatorId !== user.id
  ) {
    throw new Error("You can only dispute your own bookings");
  }

  const existing = await db.dispute.findFirst({
    where: {
      appointmentId,
      reporterId: user.id,
      status: { in: ["OPEN", "UNDER_REVIEW"] },
    },
    select: { id: true },
  });

  if (existing) {
    throw new Error("You already have an open dispute on this booking");
  }

  const againstUserId =
    appointment.clientId === user.id
      ? appointment.creatorId
      : appointment.clientId;

  const dispute = await db.dispute.create({
    data: {
      reporterId: user.id,
      againstUserId,
      appointmentId,
      type: "BOOKING",
      priority,
      status: "OPEN",
      subject,
      description,
    },
    include: {
      reporter: { select: userSelect },
      againstUser: { select: userSelect },
    },
  });

  revalidatePath("/creator/disputes");
  revalidatePath("/client/disputes");
  revalidatePath("/admin");

  return { success: true, dispute: serializeDispute(dispute) };
}

/**
 * Disputes filed by or against the current user.
 */
export async function getMyDisputes() {
  const user = await requireUser();

  const disputes = await db.dispute.findMany({
    where: {
      OR: [{ reporterId: user.id }, { againstUserId: user.id }],
    },
    include: {
      reporter: { select: userSelect },
      againstUser: { select: userSelect },
      resolvedBy: { select: { id: true, name: true, email: true } },
      appointment: {
        select: {
          id: true,
          status: true,
          startTime: true,
          source: true,
          client: { select: userSelect },
          creator: { select: userSelect },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    disputes: disputes.map((dispute) =>
      serializeDispute({
        ...dispute,
        isReporter: dispute.reporterId === user.id,
      })
    ),
  };
}

/**
 * Dispute detail for a participant.
 * Booking chat transcripts are admin-only (see getAdminDispute).
 */
export async function getMyDispute(disputeId) {
  const user = await requireUser();

  const dispute = await db.dispute.findUnique({
    where: { id: disputeId },
    include: {
      reporter: { select: userSelect },
      againstUser: { select: userSelect },
      resolvedBy: { select: { id: true, name: true, email: true } },
      appointment: {
        select: {
          id: true,
          status: true,
          startTime: true,
          endTime: true,
          source: true,
          agreedAmount: true,
          client: { select: userSelect },
          creator: { select: userSelect },
        },
      },
    },
  });

  if (!dispute) return { error: "Dispute not found" };

  if (dispute.reporterId !== user.id && dispute.againstUserId !== user.id) {
    return { error: "Unauthorized" };
  }

  return {
    dispute: serializeDispute({
      ...dispute,
      isReporter: dispute.reporterId === user.id,
    }),
  };
}

/**
 * Admin: dispute detail with full booking chat transcript.
 */
export async function getAdminDisputeDetail(disputeId) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const dispute = await db.dispute.findUnique({
    where: { id: disputeId },
    include: {
      reporter: { select: userSelect },
      againstUser: { select: userSelect },
      resolvedBy: { select: { id: true, name: true, email: true } },
      appointment: {
        select: {
          id: true,
          status: true,
          startTime: true,
          endTime: true,
          source: true,
          agreedAmount: true,
          client: { select: userSelect },
          creator: { select: userSelect },
        },
      },
    },
  });

  if (!dispute) return { error: "Dispute not found" };

  let chat = null;
  try {
    chat = await loadBookingChat(dispute.appointmentId, null);
  } catch (error) {
    console.error("Failed to load booking chat for dispute:", disputeId, error);
  }

  // Plain JSON only — avoids Next server-action serialization failures.
  return JSON.parse(
    JSON.stringify({
      dispute: serializeDispute(dispute),
      chat,
    })
  );
}
