"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

export async function updateBookingStatus(formData) {
  const user = await checkUser();

  if (!user || user.role !== "MEDIA_AGENCY") {
    throw new Error("Unauthorized");
  }

  const bookingId = formData.get("bookingId");
  const bookingIdsRaw = formData.get("bookingIds");
  const status = formData.get("status");
  const bookingType = formData.get("bookingType") || "MEDIA"; // Default to MEDIA for backward compatibility

  if (!bookingId || !status) {
    throw new Error("Missing required fields");
  }

  const bookingIds = String(bookingIdsRaw || bookingId)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const ids = bookingIds.length > 0 ? bookingIds : [String(bookingId)];

  // Verify the booking belongs to the media agency
  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
  });

  if (!mediaAgency) {
    throw new Error("Media agency not found");
  }

  if (bookingType === "RATE_CARD") {
    const bookings = await db.rateCardBookingItem.findMany({
      where: {
        id: { in: ids },
        agencyId: mediaAgency.id,
      },
      select: { id: true },
    });
    if (bookings.length === 0) {
      throw new Error("Booking not found or unauthorized");
    }

    await db.rateCardBookingItem.updateMany({
      where: {
        id: { in: bookings.map((booking) => booking.id) },
        agencyId: mediaAgency.id,
      },
      data: { status },
    });
  } else {
    // Handle MediaBooking
    const booking = await db.mediaBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.agencyId !== mediaAgency.id) {
      throw new Error("Booking not found or unauthorized");
    }

    await db.mediaBooking.update({
      where: { id: bookingId },
      data: { status },
    });
  }

  revalidatePath("/media-agency/requests");
  revalidatePath(`/media-agency/requests/${bookingType}/${bookingId}`);
  revalidatePath("/media-agency");
}
