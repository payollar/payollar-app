"use server";

import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";

const person = { id: true, name: true, imageUrl: true, specialty: true };

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
    createdAt: invoice.createdAt?.toISOString?.() || invoice.createdAt,
  };
}

function latestOpenInvoice(invoices = []) {
  return (
    invoices.find((invoice) => invoice.status === "SENT") ||
    invoices.find((invoice) => invoice.status === "PAID") ||
    null
  );
}

function shape(row, userId) {
  const other = row.creatorId === userId ? row.client : row.creator;
  const invoices = Array.isArray(row.invoices) ? row.invoices : [];
  const invoice = mapInvoice(latestOpenInvoice(invoices));
  return {
    id: row.id,
    status: row.status,
    startTime: row.startTime.toISOString(),
    endTime: row.endTime.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    brief: row.clientDescription?.trim() || "",
    notes: row.notes?.trim() || "",
    agreedAmount: row.agreedAmount != null ? Number(row.agreedAmount) : null,
    invoice,
    hasOpenInvoice: Boolean(invoice && invoice.status === "SENT"),
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
    include: {
      client: { select: person },
      creator: { select: person },
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          notes: true,
          lineItems: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
        },
      },
    },
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
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          notes: true,
          lineItems: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
        },
      },
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
    invoices: (row.invoices || []).map(mapInvoice),
    messages: (row.conversation?.messages || []).map((message) => ({
      id: message.id,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      mine: message.senderId === user.id,
    })),
  };
}
