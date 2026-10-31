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

async function requireUserId() {
  const auth = await getAuthUserId();
  if (!auth?.userId) throw new Error("Unauthorized");
  return auth.userId;
}

async function loadParticipantConversation(appointmentId, userId) {
  const conversation = await ensureBookingConversation(appointmentId);
  if (!conversation) return null;
  if (conversation.clientId !== userId && conversation.creatorId !== userId) return null;
  return conversation;
}

export async function listBookingChats() {
  const userId = await requireUserId();

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

  return conversations.map((conversation) => {
    const other = conversation.clientId === userId ? conversation.creator : conversation.client;
    const last = conversation.messages[0] || null;
    return {
      appointmentId: conversation.appointmentId,
      appointmentStatus: conversation.appointment.status,
      startTime: conversation.appointment.startTime,
      other,
      lastMessage: last ? { body: last.body, createdAt: last.createdAt, mine: last.senderId === userId } : null,
      unread: unreadByConversation.get(conversation.id) || 0,
    };
  });
}

export async function getBookingThread(appointmentId) {
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

  const other = full.clientId === userId ? full.creator : full.client;
  return {
    appointmentId: full.appointmentId,
    appointment: full.appointment,
    other,
    canSend: full.appointment.status !== "CANCELLED",
    canPay: full.appointment.status === "REQUESTED" && full.clientId === userId,
    pay: {
      doctorId: full.creatorId,
      startTime: full.appointment.startTime,
      endTime: full.appointment.endTime,
      description: full.appointment.clientDescription || "",
    },
    messages: full.messages.map((message) => ({
      id: message.id,
      body: message.body,
      createdAt: message.createdAt,
      mine: message.senderId === userId,
    })),
  };
}

export async function startBookingChat({ doctorId, startTime, endTime, description }) {
  const userId = await requireUserId();
  const client = await db.user.findUnique({
    where: { id: userId, role: "CLIENT" },
    select: { id: true },
  });
  if (!client) throw new Error("Only clients can start a booking chat.");
  if (!doctorId || !startTime || !endTime) throw new Error("Pick a time before messaging.");

  const creator = await db.user.findUnique({
    where: { id: doctorId, role: "CREATOR", verificationStatus: "VERIFIED" },
    select: { id: true },
  });
  if (!creator) throw new Error("This creator is not available to message.");

  const start = new Date(startTime);
  const end = new Date(endTime);
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
}

export async function sendBookingMessage(appointmentId, body) {
  const userId = await requireUserId();
  const text = String(body || "").trim();
  if (!text) throw new Error("Write a message first.");
  if (text.length > 2000) throw new Error("Messages are limited to 2000 characters.");

  const conversation = await loadParticipantConversation(appointmentId, userId);
  if (!conversation) throw new Error("This chat is not available.");

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    select: { status: true },
  });
  if (!appointment || appointment.status === "CANCELLED") {
    throw new Error("This booking is cancelled, so the chat is closed.");
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
}
