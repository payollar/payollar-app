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

    const bookings = await db.mediaBooking.findMany({
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

    return { success: true, bookings };
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

    // First, get all booking IDs for this client
    const clientBookings = await db.mediaBooking.findMany({
      where: {
        clientEmail: user.email,
      },
      select: {
        id: true,
      },
    });

    const bookingIds = clientBookings.map((b) => b.id);

    if (bookingIds.length === 0) {
      return { success: true, certificates: [] };
    }

    // Get certificates linked to bookings
    // Note: Certificates can also be linked via campaignRefId, but we'll focus on bookingId for now
    const certificates = await db.transmissionCertificate.findMany({
      where: {
        bookingId: { in: bookingIds },
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

    // First, get all booking IDs for this client
    const clientBookings = await db.mediaBooking.findMany({
      where: {
        clientEmail: user.email,
      },
      select: {
        id: true,
      },
    });

    const bookingIds = clientBookings.map((b) => b.id);

    if (bookingIds.length === 0) {
      return { success: true, reports: [] };
    }

    // Get reports linked to bookings
    // Note: Reports only link via bookingId, not campaignRefId
    const reports = await db.mediaAgencyReport.findMany({
      where: {
        bookingId: { in: bookingIds },
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
