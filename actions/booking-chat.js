"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";
import { ensureBookingConversation } from "@/lib/booking-chat";
import {
  checklistFromBrief,
  formatClientBriefMessage,
} from "@/lib/booking-brief";
import { decodeReportMessagePayload } from "@/lib/booking-report-message";

const personSelect = {
  id: true,
  name: true,
  imageUrl: true,
  specialty: true,
};

function toIso(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function previewMessageBody(message) {
  if (!message) return "";
  if (message.kind === "INVOICE") return "Invoice";
  if (message.kind === "BRIEF") return "Expectations brief";
  if (message.kind === "REPORT") {
    const report = decodeReportMessagePayload(message.body);
    return report?.title ? `Report · ${report.title}` : "Delivery report";
  }
  const body = String(message.body || "");
  if (/^Payment confirmed/i.test(body)) return "Payment confirmed";
  return body;
}

function mapChat(conversation, userId, unreadByConversation) {
  const other = conversation.clientId === userId ? conversation.creator : conversation.client;
  const last = conversation.messages[0] || null;
  return {
    appointmentId: conversation.appointmentId,
    appointmentStatus: conversation.appointment.status,
    startTime: toIso(conversation.appointment.startTime),
    other,
    lastMessage: last
      ? {
          body: previewMessageBody(last),
          kind: last.kind || "TEXT",
          createdAt: toIso(last.createdAt),
          mine: last.senderId === userId,
        }
      : null,
    unread: unreadByConversation.get(conversation.id) || 0,
  };
}

function mapInvoice(invoice) {
  if (!invoice) return null;
  return {
    id: invoice.id,
    title: invoice.title,
    notes: invoice.notes || "",
    lineItems: Array.isArray(invoice.lineItems) ? invoice.lineItems : [],
    amount: Number(invoice.amount || 0),
    currency: invoice.currency || "GHS",
    status: invoice.status,
    createdAt: toIso(invoice.createdAt),
  };
}

function normalizeLineItems(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => ({
      description: String(item?.description || "").trim().slice(0, 120),
      amount: Number(item?.amount || 0),
    }))
    .filter((item) => item.description && item.amount > 0)
    .slice(0, 12);
}

async function requireUserId() {
  const auth = await getAuthUserId();
  if (!auth?.userId) {
    const error = new Error("Unauthorized");
    error.code = "UNAUTHENTICATED";
    throw error;
  }
  return auth.userId;
}

async function loadParticipantConversation(appointmentId, userId) {
  const conversation = await ensureBookingConversation(appointmentId);
  if (!conversation) return null;
  if (conversation.clientId !== userId && conversation.creatorId !== userId) return null;
  return conversation;
}

function friendlyDbError(error) {
  const message = String(error?.message || "");
  if (
    error?.code === "P2021" ||
    error?.code === "P2010" ||
    /BookingConversation|BookingMessage|does not exist|relation .* does not exist/i.test(message)
  ) {
    return "Messaging is not set up on this environment yet. Ask the team to run the latest database migrations.";
  }
  if (error?.code === "P2003") {
    return "That booking could not be linked. Refresh and try again.";
  }
  if (error?.code === "P2002") {
    return "That chat already exists. Opening it now.";
  }
  return null;
}

export async function listBookingChats() {
  const userId = await requireUserId();

  try {
    const conversations = await db.bookingConversation.findMany({
      where: { OR: [{ clientId: userId }, { creatorId: userId }] },
      include: {
        appointment: { select: { id: true, startTime: true, status: true } },
        client: { select: personSelect },
        creator: { select: personSelect },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });

    const unreadGroups = conversations.length
      ? await db.bookingMessage.groupBy({
          by: ["conversationId"],
          where: {
            conversationId: { in: conversations.map((conversation) => conversation.id) },
            readAt: null,
            senderId: { not: userId },
          },
          _count: { _all: true },
        })
      : [];
    const unreadByConversation = new Map(unreadGroups.map((row) => [row.conversationId, row._count._all]));

    return conversations.map((conversation) => mapChat(conversation, userId, unreadByConversation));
  } catch (error) {
    console.error("listBookingChats failed:", error);
    const hint = friendlyDbError(error);
    if (hint) return [];
    throw error;
  }
}

/** Total unread booking messages for the signed-in client or creator. */
export async function getUnreadBookingMessageCount() {
  const auth = await getAuthUserId();
  if (!auth?.userId) return 0;

  try {
    return await db.bookingMessage.count({
      where: {
        readAt: null,
        senderId: { not: auth.userId },
        conversation: {
          OR: [{ clientId: auth.userId }, { creatorId: auth.userId }],
        },
      },
    });
  } catch (error) {
    console.error("getUnreadBookingMessageCount failed:", error);
    return 0;
  }
}

export async function getBookingThread(appointmentId) {
  try {
    const userId = await requireUserId();
    const conversation = await loadParticipantConversation(appointmentId, userId);
    if (!conversation) return { error: "This chat is not available." };

    await db.bookingMessage.updateMany({
      where: { conversationId: conversation.id, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });

    const full = await db.bookingConversation.findUnique({
      where: { id: conversation.id },
      include: {
        appointment: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            clientDescription: true,
            agreedAmount: true,
          },
        },
        client: { select: personSelect },
        creator: { select: personSelect },
        messages: {
          orderBy: { createdAt: "asc" },
          take: 200,
          include: { invoice: true },
        },
      },
    });

    if (!full) return { error: "This chat is not available." };

    const other = full.clientId === userId ? full.creator : full.client;
    const latestInvoice = [...full.messages]
      .reverse()
      .map((message) => message.invoice)
      .find((invoice) => invoice && invoice.status === "SENT");

    let deliveryReport = null;
    try {
      deliveryReport = await db.deliveryReport.findUnique({
        where: { appointmentId: full.appointmentId },
        select: {
          id: true,
          status: true,
          title: true,
          checklist: true,
          proofNotes: true,
        },
      });
    } catch (reportError) {
      console.error("deliveryReport lookup failed:", reportError);
    }

    let logisticsShipmentId = null;
    try {
      const kit = await db.logisticsShipment.findUnique({
        where: { appointmentId: full.appointmentId },
        select: { id: true },
      });
      logisticsShipmentId = kit?.id || null;
    } catch (kitError) {
      console.error("logisticsShipment lookup failed:", kitError);
    }

    let reportChecklistSeed = [];
    try {
      reportChecklistSeed = checklistFromBrief(full.appointment.clientDescription);
    } catch (checklistError) {
      console.error("checklistFromBrief failed:", checklistError);
      reportChecklistSeed = [
        { id: "item_1", label: "Session / deliverable completed", done: false },
        { id: "item_2", label: "Ready for client review", done: false },
      ];
    }

    const reportChecklist = Array.isArray(deliveryReport?.checklist)
      ? deliveryReport.checklist
          .map((item, index) => ({
            id: String(item?.id || `item_${index + 1}`),
            label: String(item?.label || "").trim(),
            done: Boolean(item?.done),
          }))
          .filter((item) => item.label)
      : reportChecklistSeed;

    return {
      appointmentId: full.appointmentId,
      appointment: {
        id: full.appointment.id,
        startTime: toIso(full.appointment.startTime),
        endTime: toIso(full.appointment.endTime),
        status: full.appointment.status,
        clientDescription: full.appointment.clientDescription || "",
        agreedAmount:
          full.appointment.agreedAmount == null
            ? null
            : Number(full.appointment.agreedAmount),
      },
      other,
      isCreator: full.creatorId === userId,
      canSend: full.appointment.status !== "CANCELLED",
      canInvoice:
        full.creatorId === userId &&
        full.appointment.status !== "CANCELLED" &&
        full.appointment.status !== "COMPLETED",
      // Clients can pay open invoices / unpaid requested bookings
      canPay:
        full.clientId === userId &&
        full.appointment.status !== "CANCELLED" &&
        full.appointment.status !== "COMPLETED" &&
        (full.appointment.status === "REQUESTED" || Boolean(latestInvoice)),
      canSetBrief:
        full.clientId === userId &&
        full.appointment.status !== "CANCELLED" &&
        full.appointment.status !== "COMPLETED",
      canStartKit:
        full.clientId === userId &&
        full.appointment.status !== "CANCELLED",
      logisticsShipmentId,
      canSendReport:
        full.creatorId === userId &&
        (full.appointment.status === "SCHEDULED" ||
          full.appointment.status === "COMPLETED"),
      deliveryReport: deliveryReport
        ? {
            id: deliveryReport.id,
            status: deliveryReport.status,
            title: deliveryReport.title || "Delivery report",
          }
        : null,
      reportChecklist,
      pay: {
        doctorId: full.creatorId,
        startTime: toIso(full.appointment.startTime),
        endTime: toIso(full.appointment.endTime),
        description: full.appointment.clientDescription || "",
        invoiceId: latestInvoice?.id || null,
        amount: latestInvoice?.amount ?? full.appointment.agreedAmount ?? null,
      },
      messages: (full.messages || []).map((message) => ({
        id: message.id,
        body: message.body || "",
        kind: String(message.kind || "TEXT"),
        createdAt: toIso(message.createdAt),
        mine: message.senderId === userId,
        invoice: mapInvoice(message.invoice),
        report:
          message.kind === "REPORT"
            ? decodeReportMessagePayload(message.body)
            : null,
      })),
    };
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED" || error?.message === "Unauthorized") {
      return { code: "UNAUTHENTICATED", error: "Sign in to view this chat." };
    }
    console.error("getBookingThread failed:", error);
    return { error: friendlyDbError(error) || "Could not load this chat." };
  }
}

export async function startBookingChat({ doctorId, startTime, endTime, description }) {
  try {
    const auth = await getAuthUserId();
    if (!auth?.userId) return { code: "UNAUTHENTICATED", error: "Sign in to message this creator." };
    const userId = auth.userId;

    const client = await db.user.findUnique({
      where: { id: userId, role: "CLIENT" },
      select: { id: true },
    });
    if (!client) {
      return { error: "Only client accounts can start a booking chat." };
    }
    if (!doctorId || !startTime || !endTime) {
      return { error: "Pick a time before messaging." };
    }

    const creator = await db.user.findUnique({
      where: { id: doctorId, role: "CREATOR", verificationStatus: "VERIFIED" },
      select: { id: true },
    });
    if (!creator) {
      return { error: "This creator is not available to message." };
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return { error: "That time slot is invalid. Pick another time." };
    }
    const brief = typeof description === "string" ? description.trim().slice(0, 2000) : "";

    const existing = await db.appointment.findFirst({
      where: {
        clientId: client.id,
        creatorId: creator.id,
        startTime: start,
        status: { in: ["REQUESTED", "SCHEDULED"] },
      },
      select: { id: true },
    });

    const appointment =
      existing ||
      (await db.appointment.create({
        data: {
          clientId: client.id,
          creatorId: creator.id,
          startTime: start,
          endTime: end,
          clientDescription: brief || null,
          status: "REQUESTED",
          source: "TALENT",
        },
        select: { id: true },
      }));

    if (brief && existing) {
      await db.appointment.update({
        where: { id: existing.id },
        data: { clientDescription: brief },
      });
    }

    await ensureBookingConversation(appointment.id);
    revalidatePath("/messages");
    revalidatePath("/client/bookings");
    revalidatePath("/creator/bookings");
    return { appointmentId: appointment.id };
  } catch (error) {
    console.error("startBookingChat failed:", error);
    return { error: friendlyDbError(error) || "Could not open the chat. Please try again." };
  }
}

/**
 * Open (or create) an in-app chat with a campaign applicant.
 * Reuses any open booking thread between the parties when one exists.
 */
export async function startCampaignApplicationChat(applicationId) {
  try {
    const auth = await getAuthUserId();
    if (!auth?.userId) {
      return { code: "UNAUTHENTICATED", error: "Sign in to message this creator." };
    }
    const userId = auth.userId;

    if (!applicationId) {
      return { error: "Application not found." };
    }

    const owner = await db.user.findFirst({
      where: { id: userId, role: { in: ["CLIENT", "MEDIA_AGENCY"] } },
      select: { id: true, role: true, name: true },
    });
    if (!owner) {
      return { error: "Only clients and media agencies can message campaign applicants." };
    }

    const application = await db.campaignApplication.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        name: true,
        rate: true,
        talentId: true,
        campaign: {
          select: {
            id: true,
            title: true,
            brand: true,
            clientId: true,
          },
        },
        talent: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!application || application.campaign.clientId !== owner.id) {
      return { error: "Application not found or unauthorized." };
    }
    if (!application.talent || application.talent.role !== "CREATOR") {
      return { error: "This creator is not available to message." };
    }

    const existing = await db.appointment.findFirst({
      where: {
        clientId: owner.id,
        creatorId: application.talentId,
        status: { in: ["REQUESTED", "SCHEDULED"] },
      },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });

    let appointmentId = existing?.id || null;
    let isNew = false;

    if (!appointmentId) {
      const start = new Date();
      start.setDate(start.getDate() + 7);
      start.setHours(12, 0, 0, 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const brief = [
        `Campaign application: ${application.campaign.title}`,
        application.campaign.brand ? `Brand: ${application.campaign.brand}` : null,
        application.rate != null && Number.isFinite(Number(application.rate))
          ? `Asked rate: ₵${Number(application.rate).toLocaleString()}`
          : null,
      ]
        .filter(Boolean)
        .join("\n")
        .slice(0, 2000);

      const created = await db.appointment.create({
        data: {
          clientId: owner.id,
          creatorId: application.talentId,
          startTime: start,
          endTime: end,
          clientDescription: brief,
          status: "REQUESTED",
          source: "CAMPAIGN",
        },
        select: { id: true },
      });
      appointmentId = created.id;
      isNew = true;
    } else {
      await db.appointment.update({
        where: { id: appointmentId },
        data: { source: "CAMPAIGN" },
      });
    }

    const conversation = await ensureBookingConversation(appointmentId);
    if (!conversation) {
      return { error: "Could not open the chat." };
    }

    const messageCount = await db.bookingMessage.count({
      where: { conversationId: conversation.id },
    });

    if (messageCount === 0) {
      const applicantName = application.name || application.talent.name || "there";
      const intro = [
        `Hi ${applicantName}, thanks for applying to “${application.campaign.title}”.`,
        "I'd like to chat about deliverables and next steps on Payollar.",
      ].join(" ");

      await db.bookingMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: owner.id,
          body: intro.slice(0, 2000),
          kind: "TEXT",
        },
      });
      await db.bookingConversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });
    }

    revalidatePath("/messages");
    revalidatePath(`/messages/${appointmentId}`);
    revalidatePath("/client/bookings");
    revalidatePath("/creator/bookings");
    return { appointmentId, isNew };
  } catch (error) {
    console.error("startCampaignApplicationChat failed:", error);
    return { error: friendlyDbError(error) || "Could not open the chat. Please try again." };
  }
}

export async function sendBookingMessage(appointmentId, body) {
  try {
    const userId = await requireUserId();
    const text = String(body || "").trim();
    if (!text) return { error: "Write a message first." };
    if (text.length > 2000) return { error: "Messages are limited to 2000 characters." };

    const conversation = await loadParticipantConversation(appointmentId, userId);
    if (!conversation) return { error: "This chat is not available." };

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      select: { status: true },
    });
    if (!appointment || appointment.status === "CANCELLED") {
      return { error: "This booking is cancelled, so the chat is closed." };
    }

    await db.bookingMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        body: text,
        kind: "TEXT",
      },
    });
    await db.bookingConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    revalidatePath("/messages");
    revalidatePath(`/messages/${appointmentId}`);
    return { success: true };
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED" || error?.message === "Unauthorized") {
      return { code: "UNAUTHENTICATED", error: "Sign in to send a message." };
    }
    console.error("sendBookingMessage failed:", error);
    return { error: friendlyDbError(error) || "Could not send that message." };
  }
}

/**
 * Client shares / updates booking expectations in chat and on the appointment brief.
 */
export async function saveClientProjectBrief(appointmentId, payload = {}) {
  try {
    const userId = await requireUserId();
    const conversation = await loadParticipantConversation(appointmentId, userId);
    if (!conversation) return { error: "This chat is not available." };
    if (conversation.clientId !== userId) {
      return { error: "Only the client can share booking expectations here." };
    }

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      select: { id: true, status: true, clientDescription: true },
    });
    if (!appointment || appointment.status === "CANCELLED") {
      return { error: "This booking is cancelled, so the chat is closed." };
    }
    if (appointment.status === "COMPLETED") {
      return { error: "This booking is completed, so the brief can’t be updated." };
    }

    const brief = formatClientBriefMessage(payload).slice(0, 2000);
    if (!brief) {
      return { error: "Add what you want or expect before sharing." };
    }

    const wasSet = Boolean(String(appointment.clientDescription || "").trim());

    await db.$transaction(async (tx) => {
      await tx.appointment.update({
        where: { id: appointmentId },
        data: { clientDescription: brief },
      });
      await tx.bookingMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          body: brief.slice(0, 2000),
          kind: "BRIEF",
        },
      });
      await tx.bookingConversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });
    });

    revalidatePath("/messages");
    revalidatePath(`/messages/${appointmentId}`);
    revalidatePath("/client/bookings");
    revalidatePath("/client/reports");
    revalidatePath("/creator/bookings");
    return { success: true, updated: wasSet };
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED" || error?.message === "Unauthorized") {
      return { code: "UNAUTHENTICATED", error: "Sign in to share your brief." };
    }
    console.error("saveClientProjectBrief failed:", error);
    return { error: friendlyDbError(error) || "Could not save your brief." };
  }
}

/**
 * Creator sends a customizable invoice into the booking chat (negotiated price).
 */
export async function sendBookingInvoice(appointmentId, payload = {}) {
  try {
    const userId = await requireUserId();
    const conversation = await loadParticipantConversation(appointmentId, userId);
    if (!conversation) return { error: "This chat is not available." };
    if (conversation.creatorId !== userId) {
      return { error: "Only the creator can send invoices in this chat." };
    }

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      select: { id: true, status: true },
    });
    if (!appointment || appointment.status === "CANCELLED") {
      return { error: "This booking is cancelled, so invoices are closed." };
    }
    if (appointment.status === "COMPLETED") {
      return { error: "This booking is already completed." };
    }

    const title = String(payload.title || "Session invoice").trim().slice(0, 80) || "Session invoice";
    const notes = String(payload.notes || "").trim().slice(0, 1000);
    const lineItems = normalizeLineItems(payload.lineItems);
    const amountFromLines = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const amount = Number(
      lineItems.length > 0 ? amountFromLines : payload.amount
    );

    if (!Number.isFinite(amount) || amount < 1) {
      return { error: "Enter an invoice amount of at least GH₵ 1." };
    }
    if (amount > 1000000) {
      return { error: "That invoice amount is too high." };
    }

    const preview = `Invoice · GH₵ ${amount.toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    const result = await db.$transaction(async (tx) => {
      await tx.bookingInvoice.updateMany({
        where: {
          appointmentId,
          status: "SENT",
        },
        data: { status: "SUPERSEDED" },
      });

      const message = await tx.bookingMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          body: preview,
          kind: "INVOICE",
        },
      });

      const invoice = await tx.bookingInvoice.create({
        data: {
          appointmentId,
          conversationId: conversation.id,
          messageId: message.id,
          createdById: userId,
          title,
          notes: notes || null,
          lineItems: lineItems.length ? lineItems : null,
          amount,
          currency: "GHS",
          status: "SENT",
        },
      });

      await tx.appointment.update({
        where: { id: appointmentId },
        data: { agreedAmount: amount },
      });

      await tx.bookingConversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });

      return invoice;
    });

    revalidatePath("/messages");
    revalidatePath(`/messages/${appointmentId}`);
    revalidatePath("/client/bookings");
    revalidatePath("/creator/bookings");

    return { success: true, invoiceId: result.id, amount: result.amount };
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED" || error?.message === "Unauthorized") {
      return { code: "UNAUTHENTICATED", error: "Sign in to send an invoice." };
    }
    console.error("sendBookingInvoice failed:", error);
    return { error: friendlyDbError(error) || "Could not send that invoice." };
  }
}
