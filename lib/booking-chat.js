import { db } from "@/lib/prisma";

export async function ensureBookingConversation(appointmentId) {
  if (!appointmentId) return null;

  const existing = await db.bookingConversation.findUnique({
    where: { appointmentId },
  });
  if (existing) return existing;

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    select: { id: true, clientId: true, creatorId: true, status: true },
  });

  if (!appointment || appointment.status === "CANCELLED") return null;

  return db.bookingConversation.create({
    data: {
      appointmentId: appointment.id,
      clientId: appointment.clientId,
      creatorId: appointment.creatorId,
    },
  });
}
