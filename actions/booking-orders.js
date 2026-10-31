"use server";

import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";

const person = { id: true, name: true, imageUrl: true, specialty: true };

function shape(row, userId) {
  const other = row.creatorId === userId ? row.client : row.creator;
  return {
    id: row.id,
    status: row.status,
    startTime: row.startTime.toISOString(),
    endTime: row.endTime.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    brief: row.clientDescription?.trim() || "",
    notes: row.notes?.trim() || "",
    other: {
      id: other?.id || "",
      name: other?.name || "Payollar user",
      imageUrl: other?.imageUrl || "",
      specialty: other?.specialty || "",
    },
  };
}

async function viewer() {
  const auth = await getAuthUserId();
  if (!auth?.userId) return null;
  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, role: true },
  });
  if (!user || (user.role !== "CREATOR" && user.role !== "CLIENT")) return null;
  return user;
}

export async function listMyOrders() {
  const user = await viewer();
  if (!user) return [];

  const rows = await db.appointment.findMany({
    where: user.role === "CREATOR" ? { creatorId: user.id } : { clientId: user.id },
    include: { client: { select: person }, creator: { select: person } },
    orderBy: { startTime: "desc" },
  });

  return rows.map((row) => shape(row, user.id));
}

export async function getMyOrder(id) {
  const user = await viewer();
  if (!user || !id) return null;

  const row = await db.appointment.findFirst({
    where: {
      id,
      ...(user.role === "CREATOR" ? { creatorId: user.id } : { clientId: user.id }),
    },
    include: {
      client: { select: person },
      creator: { select: person },
      conversation: {
        include: {
          messages: { orderBy: { createdAt: "asc" }, take: 80 },
        },
      },
    },
  });

  if (!row) return null;

  return {
    ...shape(row, user.id),
    role: user.role,
    messages: (row.conversation?.messages || []).map((message) => ({
      id: message.id,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      mine: message.senderId === user.id,
    })),
  };
}
