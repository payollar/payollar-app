"use server";

import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";

/**
 * Get all media bookings for the authenticated client
 */
export async function getClientMediaBookings() {
  try {
    const authResult = await getAuthUserId();

    if (!authResult || !authResult.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CLIENT",
      },
      select: {
        email: true,
      },
    });

    if (!user || !user.email) {
      return { success: false, error: "Client not found" };
    }

    // Get MediaBooking bookings
    const mediaBookings = await db.mediaBooking.findMany({
      where: {
        clientEmail: user.email,
      },
      include: {
        listing: {
          select: {
            id: true,
            name: true,
            listingType: true,
            location: true,
            imageUrl: true,
          },
        },
        agency: {
          select: {
            id: true,
            agencyName: true,
            contactName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get RateCardBookingItem bookings
    const rateCardBookings = await db.rateCardBookingItem.findMany({
      where: {
        clientEmail: user.email,
      },
      include: {
        rateCard: {
          select: {
            id: true,
            title: true,
            listingType: true,
            location: true,
            imageUrl: true,
          },
        },
        agency: {
          select: {
            id: true,
            agencyName: true,
            contactName: true,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform rate card bookings to match MediaBooking format for consistent display
    const transformedRateCardBookings = rateCardBookings.map((booking) => ({
      id: booking.id,
      listingId: booking.rateCard.listingId || booking.rateCard.id,
      agencyId: booking.agencyId,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone,
      packageName: booking.snapshotDescription || booking.row?.table?.section?.title || "Rate Card Item",
      packagePrice: booking.snapshotPrice,
      startDate: booking.startDate,
      endDate: booking.endDate,
      duration: null,
      slots: booking.quantity,
      totalAmount: booking.totalAmount,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      listing: {
        id: booking.rateCard.id,
        name: booking.rateCard.title,
        listingType: booking.rateCard.listingType || "DIGITAL",
        location: booking.rateCard.location,
        imageUrl: booking.rateCard.imageUrl,
      },
      agency: {
        id: booking.agency.id,
        agencyName: booking.agency.agencyName,
        contactName: booking.agency.contactName,
      },
      bookingType: "RATE_CARD", // Flag to identify rate card bookings
    }));

    // Combine both types of bookings
    const allBookings = [
      ...mediaBookings.map((b) => ({ ...b, bookingType: "MEDIA" })),
      ...transformedRateCardBookings,
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { success: true, bookings: allBookings };
  } catch (error) {
    console.error("Error fetching client media bookings:", error);
    return { success: false, error: error.message || "Failed to fetch bookings" };
  }
}

/**
 * Get transmission certificates for client's bookings
 */
export async function getClientTransmissionCertificates() {
  try {
    const authResult = await getAuthUserId();

    if (!authResult || !authResult.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CLIENT",
      },
      select: {
        email: true,
      },
    });

    if (!user || !user.email) {
      return { success: false, error: "Client not found" };
    }

    // Get IDs from both MediaBooking and RateCardBookingItem bookings
    const [mediaBookingIds, rateCardBookingIds] = await Promise.all([
      db.mediaBooking.findMany({
        where: { clientEmail: user.email },
        select: { id: true },
      }).then(bookings => bookings.map(b => b.id)),
      db.rateCardBookingItem.findMany({
        where: { clientEmail: user.email },
        select: { id: true },
      }).then(bookings => bookings.map(b => b.id)),
    ]);

    const allBookingIds = [...mediaBookingIds, ...rateCardBookingIds];
    
    if (allBookingIds.length === 0) {
      return { success: true, certificates: [] };
    }

    // Get certificates linked to any booking (MediaBooking or RateCardBookingItem)
    const certificates = await db.transmissionCertificate.findMany({
      where: {
        bookingId: { in: allBookingIds },
      },
      include: {
        agency: {
          select: {
            agencyName: true,
          },
        },
      },
      orderBy: {
        airDate: "desc",
      },
    });

    return { success: true, certificates };
  } catch (error) {
    console.error("Error fetching client transmission certificates:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch certificates",
    };
  }
}

/**
 * Get campaign reports for client's bookings
 */
export async function getClientCampaignReports() {
  try {
    const authResult = await getAuthUserId();

    if (!authResult || !authResult.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CLIENT",
      },
      select: {
        email: true,
      },
    });

    if (!user || !user.email) {
      return { success: false, error: "Client not found" };
    }

    // Get IDs from both MediaBooking and RateCardBookingItem bookings
    const [mediaBookingIds, rateCardBookingIds] = await Promise.all([
      db.mediaBooking.findMany({
        where: { clientEmail: user.email },
        select: { id: true },
      }).then(bookings => bookings.map(b => b.id)),
      db.rateCardBookingItem.findMany({
        where: { clientEmail: user.email },
        select: { id: true },
      }).then(bookings => bookings.map(b => b.id)),
    ]);

    const allBookingIds = [...mediaBookingIds, ...rateCardBookingIds];
    
    if (allBookingIds.length === 0) {
      return { success: true, reports: [] };
    }

    // Get reports linked to any booking (MediaBooking or RateCardBookingItem)
    const reports = await db.mediaAgencyReport.findMany({
      where: {
        bookingId: { in: allBookingIds },
      },
      include: {
        agency: {
          select: {
            agencyName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, reports };
  } catch (error) {
    console.error("Error fetching client campaign reports:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch reports",
    };
  }
}

/**
 * Get all client media library data (bookings, certificates, reports)
 */
export async function getClientMediaLibrary() {
  try {
    const [bookingsResult, certificatesResult, reportsResult] = await Promise.all([
      getClientMediaBookings(),
      getClientTransmissionCertificates(),
      getClientCampaignReports(),
    ]);

    return {
      success: true,
      bookings: bookingsResult.success ? bookingsResult.bookings : [],
      certificates: certificatesResult.success ? certificatesResult.certificates : [],
      reports: reportsResult.success ? reportsResult.reports : [],
    };
  } catch (error) {
    console.error("Error fetching client media library:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch media library",
      bookings: [],
      certificates: [],
      reports: [],
    };
  }
}
