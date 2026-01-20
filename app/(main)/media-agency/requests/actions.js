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
  const status = formData.get("status");

  if (!bookingId || !status) {
    throw new Error("Missing required fields");
  }

  // Verify the booking belongs to the media agency
  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
  });

  if (!mediaAgency) {
    throw new Error("Media agency not found");
  }

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

  revalidatePath("/media-agency/requests");
  revalidatePath("/media-agency");
}
