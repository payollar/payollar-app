"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";
import { ensureBookingConversation } from "@/lib/booking-chat";

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

function mapChat(conversation, userId, unreadByConversation) {
  const other = conversation.clientId === userId ? conversation.creator : conversation.client;
  const last = conversation.messages[0] || null;
  return {
    appointmentId: conversation.appointmentId,
    appointmentStatus: conversation.appointment.status,
    startTime: toIso(conversation.appointment.startTime),
    other,
    lastMessage: last
      ? { body: last.body, createdAt: toIso(last.createdAt), mine: last.senderId === userId }
      : null,
    unread: unreadByConversation.get(conversation.id) || 0,
  };
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
        appointment: { select: { id: true, startTime: true, endTime: true, status: true, clientDescription: true } },
        client: { select: personSelect },
        creator: { select: personSelect },
        messages: { orderBy: { createdAt: "asc" }, take: 200 },
      },
    });

    if (!full) return { error: "This chat is not available." };

    const other = full.clientId === userId ? full.creator : full.client;
    return {
      appointmentId: full.appointmentId,
      appointment: {
        ...full.appointment,
        startTime: toIso(full.appointment.startTime),
        endTime: toIso(full.appointment.endTime),
      },
      other,
      canSend: full.appointment.status !== "CANCELLED",
      canPay: full.appointment.status === "REQUESTED" && full.clientId === userId,
      pay: {
        doctorId: full.creatorId,
        startTime: toIso(full.appointment.startTime),
        endTime: toIso(full.appointment.endTime),
        description: full.appointment.clientDescription || "",
      },
      messages: full.messages.map((message) => ({
        id: message.id,
        body: message.body,
        createdAt: toIso(message.createdAt),
        mine: message.senderId === userId,
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
