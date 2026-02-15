"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

/**
 * Get all bookings (MediaBooking and RateCardBookingItem) for the authenticated media agency
 * Returns bookings that are CONFIRMED or COMPLETED (suitable for linking certificates/reports)
 */
export async function getAgencyBookingsForLinking() {
  try {
    const user = await checkUser();

    if (!user || user.role !== "MEDIA_AGENCY") {
      return { success: false, error: "Unauthorized" };
    }

    const mediaAgency = await db.mediaAgency.findUnique({
      where: { userId: user.id },
    });

    if (!mediaAgency) {
      return { success: false, error: "Media agency not found" };
    }

    // Get MediaBooking bookings (CONFIRMED or COMPLETED)
    const mediaBookings = await db.mediaBooking.findMany({
      where: {
        agencyId: mediaAgency.id,
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      include: {
        listing: {
          select: {
            name: true,
            listingType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get RateCardBookingItem bookings (CONFIRMED or COMPLETED)
    const rateCardBookings = await db.rateCardBookingItem.findMany({
      where: {
        agencyId: mediaAgency.id,
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      include: {
        rateCard: {
          select: {
            title: true,
            listingType: true,
          },
        },
        row: {
          include: {
            table: {
              include: {
                section: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format MediaBookings
    const formattedMediaBookings = mediaBookings.map((booking) => ({
      id: booking.id,
      type: "MEDIA",
      displayName: `${booking.listing.name} - ${booking.clientName}`,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      status: booking.status,
      createdAt: booking.createdAt,
      listingName: booking.listing.name,
      listingType: booking.listing.listingType,
    }));

    // Format RateCardBookings
    const formattedRateCardBookings = rateCardBookings.map((booking) => ({
      id: booking.id,
      type: "RATE_CARD",
      displayName: `${booking.rateCard.title} - ${booking.clientName}`,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      status: booking.status,
      createdAt: booking.createdAt,
      listingName: booking.rateCard.title,
      listingType: booking.rateCard.listingType || "DIGITAL",
      sectionTitle: booking.row?.table?.section?.title,
    }));

    // Combine and sort by date
    const allBookings = [
      ...formattedMediaBookings,
      ...formattedRateCardBookings,
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { success: true, bookings: allBookings };
  } catch (error) {
    console.error("Error fetching agency bookings:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch bookings",
      bookings: [],
    };
  }
}
