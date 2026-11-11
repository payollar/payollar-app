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

    const invoiceIds = (
      await db.mediaInvoice.findMany({
        where: { clientId: authResult.userId },
        select: { id: true },
      })
    ).map((invoice) => invoice.id);

    const emailMatch = {
      equals: user.email,
      mode: "insensitive",
    };
    const rateCardWhere = {
      OR: [
        { clientEmail: emailMatch },
        ...(invoiceIds.length
          ? [{ mediaInvoiceId: { in: invoiceIds } }]
          : []),
      ],
    };

    // Get MediaBooking bookings
    const mediaBookings = await db.mediaBooking.findMany({
      where: {
        clientEmail: emailMatch,
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
      where: rateCardWhere,
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
        mediaInvoice: {
          select: {
            id: true,
            invoiceNumber: true,
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
    const transformedRateCardBookings = rateCardBookings.map((booking) => {
      let notesMeta = null;
      try {
        notesMeta =
          booking.notes && typeof booking.notes === "string"
            ? JSON.parse(booking.notes)
            : booking.notes && typeof booking.notes === "object"
              ? booking.notes
              : null;
      } catch {
        notesMeta = null;
      }
      const source = notesMeta?.source || null;
      // Negotiate quotes stay PENDING until paid; paid planner checkouts are CONFIRMED.
      const awaitingPayment =
        booking.status === "PENDING" &&
        (source === "media_planner_cart_negotiate" || !source);

      return {
        id: booking.id,
        listingId: booking.rateCard.listingId || booking.rateCard.id,
        agencyId: booking.agencyId,
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        clientPhone: booking.clientPhone,
        mediaCampaignName: booking.mediaCampaignName || null,
        packageName:
          booking.mediaCampaignName ||
          booking.snapshotDescription ||
          booking.row?.table?.section?.title ||
          "Rate Card Item",
        packagePrice: booking.snapshotPrice,
        startDate: booking.startDate,
        endDate: booking.endDate,
        duration: null,
        slots: booking.quantity,
        totalAmount: booking.totalAmount,
        status: booking.status,
        notes: booking.notes,
        notesMeta,
        awaitingPayment,
        canEditCampaign: awaitingPayment,
        rateCardId: booking.rateCardId,
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
        bookingType: "RATE_CARD",
        mediaInvoiceId: booking.mediaInvoiceId || booking.mediaInvoice?.id || null,
        mediaInvoiceNumber: booking.mediaInvoice?.invoiceNumber || null,
      };
    });

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

    const invoiceIds = (
      await db.mediaInvoice.findMany({
        where: { clientId: authResult.userId },
        select: { id: true },
      })
    ).map((invoice) => invoice.id);
    const emailMatch = { equals: user.email, mode: "insensitive" };

    // Get IDs from both MediaBooking and RateCardBookingItem bookings
    const [mediaBookingIds, rateCardBookingIds] = await Promise.all([
      db.mediaBooking
        .findMany({
          where: { clientEmail: emailMatch },
          select: { id: true },
        })
        .then((bookings) => bookings.map((b) => b.id)),
      db.rateCardBookingItem
        .findMany({
          where: {
            OR: [
              { clientEmail: emailMatch },
              ...(invoiceIds.length
                ? [{ mediaInvoiceId: { in: invoiceIds } }]
                : []),
            ],
          },
          select: { id: true },
        })
        .then((bookings) => bookings.map((b) => b.id)),
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

    const invoiceIds = (
      await db.mediaInvoice.findMany({
        where: { clientId: authResult.userId },
        select: { id: true },
      })
    ).map((invoice) => invoice.id);
    const emailMatch = { equals: user.email, mode: "insensitive" };

    // Get IDs from both MediaBooking and RateCardBookingItem bookings
    const [mediaBookingIds, rateCardBookingIds] = await Promise.all([
      db.mediaBooking
        .findMany({
          where: { clientEmail: emailMatch },
          select: { id: true },
        })
        .then((bookings) => bookings.map((b) => b.id)),
      db.rateCardBookingItem
        .findMany({
          where: {
            OR: [
              { clientEmail: emailMatch },
              ...(invoiceIds.length
                ? [{ mediaInvoiceId: { in: invoiceIds } }]
                : []),
            ],
          },
          select: { id: true },
        })
        .then((bookings) => bookings.map((b) => b.id)),
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
 * Re-send a paid media invoice email to the client.
 */
export async function resendClientMediaInvoiceEmail(invoiceId) {
  try {
    const authResult = await getAuthUserId();
    if (!authResult?.userId) {
      return { success: false, error: "Unauthorized" };
    }
    if (!invoiceId) {
      return { success: false, error: "Invoice id is required" };
    }

    const invoice = await db.mediaInvoice.findFirst({
      where: {
        id: invoiceId,
        clientId: authResult.userId,
      },
      include: {
        agency: {
          select: {
            id: true,
            agencyName: true,
          },
        },
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    const account = await db.user.findUnique({
      where: { id: authResult.userId },
      select: { email: true, name: true },
    });
    const receiptEmail = account?.email || invoice.clientEmail;
    if (receiptEmail && receiptEmail !== invoice.clientEmail) {
      await db.mediaInvoice.update({
        where: { id: invoice.id },
        data: { clientEmail: receiptEmail },
      });
    }

    const { sendMediaInvoiceEmail } = await import("@/lib/email");
    const emailed = await sendMediaInvoiceEmail({
      ...invoice,
      clientEmail: receiptEmail,
      clientName: invoice.clientName || account?.name || "",
    });
    if (!emailed?.success) {
      return {
        success: false,
        error:
          emailed?.error ||
          "Email provider rejected the receipt. Check Resend domain verification.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error resending media invoice email:", error);
    return {
      success: false,
      error: error.message || "Failed to resend invoice email",
    };
  }
}

/**
 * Paid media invoices/receipts for the authenticated client
 */
export async function getClientMediaInvoices() {
  try {
    const authResult = await getAuthUserId();
    if (!authResult?.userId) {
      return { success: false, error: "Unauthorized", invoices: [] };
    }

    const invoices = await db.mediaInvoice.findMany({
      where: { clientId: authResult.userId },
      include: {
        agency: {
          select: {
            id: true,
            agencyName: true,
          },
        },
        bookingItems: {
          select: {
            id: true,
            status: true,
            mediaCampaignName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, invoices };
  } catch (error) {
    console.error("Error fetching client media invoices:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch invoices",
      invoices: [],
    };
  }
}

/**
 * Get all client media library data (bookings, certificates, reports, invoices, assets)
 */
export async function getClientMediaLibrary() {
  try {
    const { getClientMediaCampaignAssets } = await import(
      "@/actions/media-campaign-assets"
    );
    const [
      bookingsResult,
      certificatesResult,
      reportsResult,
      invoicesResult,
      assetsResult,
    ] = await Promise.all([
      getClientMediaBookings(),
      getClientTransmissionCertificates(),
      getClientCampaignReports(),
      getClientMediaInvoices(),
      getClientMediaCampaignAssets(),
    ]);

    return {
      success: true,
      bookings: bookingsResult.success ? bookingsResult.bookings : [],
      certificates: certificatesResult.success
        ? certificatesResult.certificates
        : [],
      reports: reportsResult.success ? reportsResult.reports : [],
      invoices: invoicesResult.success ? invoicesResult.invoices : [],
      assets: assetsResult.success ? assetsResult.assets : [],
    };
  } catch (error) {
    console.error("Error fetching client media library:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch media library",
      bookings: [],
      certificates: [],
      reports: [],
      invoices: [],
      assets: [],
    };
  }
}
