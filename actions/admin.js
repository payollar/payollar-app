"use server";

import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";
import { revalidatePath } from "next/cache";
import { sendVerificationStatusEmail } from "@/lib/email";

/**
 * Verifies if current user has admin role
 */
export async function verifyAdmin() {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    return false;
  }

  try {
    const user = await db.user.findUnique({
      where: {
        id: authResult.userId,
      },
    });

    return user?.role === "ADMIN";
  } catch (error) {
    console.error("Failed to verify admin:", error);
    return false;
  }
}

/**
 * Gets all doctors with pending verification
 */
export async function getPendingDoctors() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const pendingDoctors = await db.user.findMany({
      where: {
        role: "CREATOR",
        verificationStatus: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { doctors: pendingDoctors };
  } catch (error) {
    throw new Error("Failed to fetch pending talents");
  }
}

/**
 * Gets all verified doctors
 */
export async function getVerifiedDoctors() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const verifiedDoctors = await db.user.findMany({
      where: {
        role: "CREATOR",
        verificationStatus: "VERIFIED",
      },
      orderBy: {
        name: "asc",
      },
    });

    return { doctors: verifiedDoctors };
  } catch (error) {
    console.error("Failed to get verified talents:", error);
    return { error: "Failed to fetch verified talents" };
  }
}

/**
 * Updates a doctor's verification status
 */
export async function updateDoctorStatus(formData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const doctorId = formData.get("doctorId");
  const status = formData.get("status");

  if (!doctorId || !["VERIFIED", "REJECTED"].includes(status)) {
    throw new Error("Invalid input");
  }

  try {
    const doctor = await db.user.findUnique({
      where: { id: doctorId },
      select: { email: true, name: true },
    });

    await db.user.update({
      where: {
        id: doctorId,
      },
      data: {
        verificationStatus: status,
      },
    });

    // Send verification status email
    if (doctor?.email) {
      try {
        await sendVerificationStatusEmail(
          doctor.email,
          doctor.name || "Creator",
          status
        );
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Don't throw - email failure shouldn't block status update
      }
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update doctor status:", error);
    throw new Error(`Failed to update doctor status: ${error.message}`);
  }
}

/**
 * Suspends or reinstates a doctor
 */
export async function updateDoctorActiveStatus(formData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const doctorId = formData.get("doctorId");
  const suspend = formData.get("suspend") === "true";

  if (!doctorId) {
    throw new Error("Doctor ID is required");
  }

  try {
    const status = suspend ? "PENDING" : "VERIFIED";

    await db.user.update({
      where: {
        id: doctorId,
      },
      data: {
        verificationStatus: status,
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update doctor active status:", error);
    throw new Error(`Failed to update doctor status: ${error.message}`);
  }
}

/**
 * Gets all pending payouts that need admin approval
 */
export async function getPendingPayouts() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const pendingPayouts = await db.payout.findMany({
      where: {
        status: "PROCESSING",
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            specialty: true,
            credits: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { payouts: pendingPayouts };
  } catch (error) {
    console.error("Failed to fetch pending payouts:", error);
    throw new Error("Failed to fetch pending payouts");
  }
}

/**
 * Approves a payout request and deducts credits from doctor's account
 */
export async function approvePayout(formData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const payoutId = formData.get("payoutId");

  if (!payoutId) {
    throw new Error("Payout ID is required");
  }

  try {
    // Get admin user info
    const authResult = await getAuthUserId();
    if (!authResult || !authResult.userId) {
      throw new Error("Unauthorized");
    }
    const admin = await db.user.findUnique({
      where: { id: authResult.userId },
    });

    // Find the payout request
    const payout = await db.payout.findUnique({
      where: {
        id: payoutId,
        status: "PROCESSING",
      },
      include: {
        creator: true,
      },
    });

    if (!payout) {
      throw new Error("Payout request not found or already processed");
    }

    // Check if doctor has enough credits
    if (payout.creator.credits < payout.credits) {
      throw new Error("Doctor doesn't have enough credits for this payout");
    }

    // Process the payout in a transaction
    await db.$transaction(async (tx) => {
      // Update payout status to PROCESSED
      await tx.payout.update({
        where: {
          id: payoutId,
        },
        data: {
          status: "PROCESSED",
          processedAt: new Date(),
          processedBy: admin?.id || "unknown",
        },
      });

      // Deduct credits from doctor's account
      await tx.user.update({
        where: {
          id: payout.creatorId,
        },
        data: {
          credits: {
            decrement: payout.credits,
          },
        },
      });

      // Create a transaction record for the deduction
      await tx.creditTransaction.create({
        data: {
          userId: payout.creatorId,
          amount: -payout.credits,
          type: "ADMIN_ADJUSTMENT",
        },
      });
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to approve payout:", error);
    throw new Error(`Failed to approve payout: ${error.message}`);
  }
}

/**
 * Gets all pending media agencies
 */
export async function getPendingMediaAgencies() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const pendingAgencies = await db.mediaAgency.findMany({
      where: {
        verificationStatus: "PENDING",
      },
      include: {
        listings: {
          orderBy: { createdAt: "desc" },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { agencies: pendingAgencies };
  } catch (error) {
    console.error("Failed to fetch pending media agencies:", error);
    throw new Error("Failed to fetch pending media agencies");
  }
}

/**
 * Gets all verified media agencies
 */
export async function getVerifiedMediaAgencies() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const verifiedAgencies = await db.mediaAgency.findMany({
      where: {
        verificationStatus: "VERIFIED",
      },
      include: {
        listings: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            listings: true,
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { agencies: verifiedAgencies };
  } catch (error) {
    console.error("Failed to fetch verified media agencies:", error);
    throw new Error("Failed to fetch verified media agencies");
  }
}

/**
 * Updates a media agency's verification status
 */
export async function updateMediaAgencyStatus(formData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const agencyId = formData.get("agencyId");
  const status = formData.get("status");

  if (!agencyId || !["VERIFIED", "REJECTED"].includes(status)) {
    throw new Error("Invalid input");
  }

  try {
    await db.mediaAgency.update({
      where: {
        id: agencyId,
      },
      data: {
        verificationStatus: status,
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update media agency status:", error);
    throw new Error(`Failed to update media agency status: ${error.message}`);
  }
}

/**
 * Updates a media listing's status
 */
export async function updateMediaListingStatus(formData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const listingId = formData.get("listingId");
  const status = formData.get("status");

  if (!listingId || !["ACTIVE", "INACTIVE", "ARCHIVED"].includes(status)) {
    throw new Error("Invalid input");
  }

  try {
    await db.mediaListing.update({
      where: {
        id: listingId,
      },
      data: {
        status: status,
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update media listing status:", error);
    throw new Error(`Failed to update media listing status: ${error.message}`);
  }
}

/**
 * Gets all users with pagination and filtering
 */
export async function getAllUsers(options = {}) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const {
      page = 1,
      limit = 50,
      search = "",
      role = null,
      verificationStatus = null,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { specialty: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role && role !== "ALL") {
      where.role = role;
    }

    if (verificationStatus && verificationStatus !== "ALL") {
      where.verificationStatus = verificationStatus;
    }

    // Get users with counts - explicitly select imageUrl
    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
          role: true,
          verificationStatus: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
          specialty: true,
          experience: true,
          description: true,
          portfolioUrls: true,
          credits: true,
          _count: {
            select: {
              clientAppointments: true,
              creatorAppointments: true,
              digitalProducts: true,
              campaigns: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw new Error("Failed to fetch users");
  }
}

/**
 * Gets user statistics
 */
export async function getUserStats() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const [
      totalUsers,
      clients,
      creators,
      admins,
      unassigned,
      verifiedCreators,
      pendingCreators,
      rejectedCreators,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "CLIENT" } }),
      db.user.count({ where: { role: "CREATOR" } }),
      db.user.count({ where: { role: "ADMIN" } }),
      db.user.count({ where: { role: "UNASSIGNED" } }),
      db.user.count({
        where: { role: "CREATOR", verificationStatus: "VERIFIED" },
      }),
      db.user.count({
        where: { role: "CREATOR", verificationStatus: "PENDING" },
      }),
      db.user.count({
        where: { role: "CREATOR", verificationStatus: "REJECTED" },
      }),
    ]);

    return {
      totalUsers,
      clients,
      creators,
      admins,
      unassigned,
      verifiedCreators,
      pendingCreators,
      rejectedCreators,
    };
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    throw new Error("Failed to fetch user statistics");
  }
}

/**
 * Gets advanced analytics data for admin dashboard
 */
export async function getAdminAnalytics() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // User growth over time
    const userGrowth = await db.user.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Appointments stats
    const [totalAppointments, recentAppointments, appointmentsByStatus] = await Promise.all([
      db.appointment.count(),
      db.appointment.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
      db.appointment.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    // Payouts stats
    const [totalPayouts, pendingPayouts, processedPayouts, totalPayoutAmount] = await Promise.all([
      db.payout.count(),
      db.payout.count({ where: { status: "PROCESSING" } }),
      db.payout.count({ where: { status: "PROCESSED" } }),
      db.payout.aggregate({
        where: { status: "PROCESSED" },
        _sum: { netAmount: true },
      }),
    ]);

    // Digital products stats
    const [totalProducts, activeProducts] = await Promise.all([
      db.digitalProduct.count(),
      db.digitalProduct.count({ where: { status: "ACTIVE" } }),
    ]);

    // Campaigns stats
    const [totalCampaigns, activeCampaigns] = await Promise.all([
      db.campaign.count(),
      db.campaign.count({ where: { status: "ACTIVE" } }),
    ]);

    // Media agencies stats
    const [totalAgencies, verifiedAgencies, totalListings] = await Promise.all([
      db.mediaAgency.count(),
      db.mediaAgency.count({ where: { verificationStatus: "VERIFIED" } }),
      db.mediaListing.count(),
    ]);

    // Credits stats
    const creditsStats = await db.user.aggregate({
      where: { role: "CREATOR" },
      _sum: { credits: true },
      _avg: { credits: true },
    });

    // Campaign applications
    const [pendingApplications, acceptedApplications, applicationsByStatus] = await Promise.all([
      db.campaignApplication.count({ where: { status: "PENDING" } }),
      db.campaignApplication.count({ where: { status: "ACCEPTED" } }),
      db.campaignApplication.groupBy({ by: ["status"], _count: true }),
    ]);

    // Logistics
    const [logisticsTotal, logisticsProblem, logisticsReturn, logisticsByStatus] = await Promise.all([
      db.logisticsShipment.count(),
      db.logisticsShipment.count({
        where: { status: { in: ["PROBLEM", "RETURN_REQUESTED"] } },
      }),
      db.logisticsShipment.count({ where: { status: "RETURN_REQUESTED" } }),
      db.logisticsShipment.groupBy({ by: ["status"], _count: true }),
    ]);

    // Media negotiations
    const [negotiationsTotal, negotiationsOpen, negotiationsByStatus] = await Promise.all([
      db.mediaNegotiation.count(),
      db.mediaNegotiation.count({
        where: { status: { in: ["OPEN", "DISCOUNT_REQUESTED", "COUNTERED"] } },
      }),
      db.mediaNegotiation.groupBy({ by: ["status"], _count: true }),
    ]);

    // Media bookings (listing + rate card)
    const [
      mediaBookingsPending,
      mediaBookingsConfirmed,
      rateCardBookingsPending,
      rateCardBookingsConfirmed,
      publishedRateCards,
      totalRateCards,
    ] = await Promise.all([
      db.mediaBooking.count({ where: { status: "PENDING" } }),
      db.mediaBooking.count({ where: { status: "CONFIRMED" } }),
      db.rateCardBookingItem.count({ where: { status: "PENDING" } }),
      db.rateCardBookingItem.count({ where: { status: "CONFIRMED" } }),
      db.rateCard.count({ where: { isPublished: true } }),
      db.rateCard.count(),
    ]);

    // Delivery reports + transmission certificates
    const [deliverySubmitted, deliveryByStatus, transmissionCertificates] = await Promise.all([
      db.deliveryReport.count({ where: { status: "SUBMITTED" } }),
      db.deliveryReport.groupBy({ by: ["status"], _count: true }),
      db.transmissionCertificate.count(),
    ]);

    // Marketplace sales (coming soon — keep tracked, not in live transaction value)
    const [salesCompleted, salesPending, salesRefunded, salesRevenue] = await Promise.all([
      db.digitalProductSale.count({ where: { status: "COMPLETED" } }),
      db.digitalProductSale.count({ where: { status: "PENDING" } }),
      db.digitalProductSale.count({ where: { status: "REFUNDED" } }),
      db.digitalProductSale.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true, platformFee: true, creatorEarnings: true },
      }),
    ]);

    // Live booking volume: talents + media + campaigns (marketplace excluded until launch)
    const mediaCommitted = { in: ["CONFIRMED", "COMPLETED"] };
    const [
      talentInvoiceAgg,
      talentInvoiceCount,
      mediaListingAgg,
      mediaRateCardAgg,
      campaignRatesAgg,
      recentTalentInvoices,
      recentMediaListings,
      recentRateCards,
      recentCampaignRates,
    ] = await Promise.all([
      db.bookingInvoice.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      db.bookingInvoice.count({ where: { status: "PAID" } }),
      db.mediaBooking.aggregate({
        where: { status: mediaCommitted },
        _sum: { totalAmount: true },
        _count: true,
      }),
      db.rateCardBookingItem.aggregate({
        where: { status: mediaCommitted },
        _sum: { totalAmount: true },
        _count: true,
      }),
      db.campaignApplication.aggregate({
        where: { status: "ACCEPTED", rate: { not: null } },
        _sum: { rate: true },
        _count: true,
      }),
      db.bookingInvoice.findMany({
        where: { status: "PAID" },
        orderBy: { updatedAt: "desc" },
        take: 12,
        select: {
          id: true,
          title: true,
          amount: true,
          currency: true,
          updatedAt: true,
          createdAt: true,
          appointment: {
            select: {
              id: true,
              status: true,
              client: { select: { name: true, email: true } },
              creator: { select: { name: true, email: true } },
            },
          },
        },
      }),
      db.mediaBooking.findMany({
        where: { status: mediaCommitted },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: {
          id: true,
          totalAmount: true,
          status: true,
          packageName: true,
          clientName: true,
          updatedAt: true,
          createdAt: true,
          agency: { select: { agencyName: true } },
          listing: { select: { name: true } },
        },
      }),
      db.rateCardBookingItem.findMany({
        where: { status: mediaCommitted },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: {
          id: true,
          totalAmount: true,
          status: true,
          snapshotDescription: true,
          clientName: true,
          updatedAt: true,
          createdAt: true,
          agency: { select: { agencyName: true } },
          rateCard: { select: { title: true } },
        },
      }),
      db.campaignApplication.findMany({
        where: { status: "ACCEPTED", rate: { not: null } },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: {
          id: true,
          rate: true,
          name: true,
          updatedAt: true,
          createdAt: true,
          campaign: { select: { title: true } },
          talent: { select: { name: true } },
        },
      }),
    ]);

    const talentsGhs = Number(talentInvoiceAgg._sum.amount || 0);
    const mediaGhs =
      Number(mediaListingAgg._sum.totalAmount || 0) +
      Number(mediaRateCardAgg._sum.totalAmount || 0);
    const campaignsGhs = Number(campaignRatesAgg._sum.rate || 0);
    const bookingVolumeGhs = talentsGhs + mediaGhs + campaignsGhs;
    const bookingTxnCount =
      talentInvoiceCount +
      (mediaListingAgg._count || 0) +
      (mediaRateCardAgg._count || 0) +
      (campaignRatesAgg._count || 0);

    const recentTransactions = [
      ...recentTalentInvoices.map((inv) => ({
        id: `talent-${inv.id}`,
        source: "TALENT",
        title: inv.title || "Talent session invoice",
        amount: Number(inv.amount) || 0,
        status: inv.appointment?.status === "COMPLETED" ? "COMPLETED" : "PAID",
        party: inv.appointment?.client?.name || "Client",
        counterparty: inv.appointment?.creator?.name || "Talent",
        createdAt: inv.updatedAt || inv.createdAt,
      })),
      ...recentMediaListings.map((b) => ({
        id: `media-${b.id}`,
        source: "MEDIA",
        title: b.listing?.name
          ? `Media · ${b.listing.name}`
          : b.packageName || "Media booking",
        amount: Number(b.totalAmount) || 0,
        status: b.status,
        party: b.clientName || "Client",
        counterparty: b.agency?.agencyName || "Agency",
        createdAt: b.updatedAt || b.createdAt,
      })),
      ...recentRateCards.map((b) => ({
        id: `rate-${b.id}`,
        source: "MEDIA",
        title: b.rateCard?.title
          ? `Rate card · ${b.rateCard.title}`
          : b.snapshotDescription || "Rate card booking",
        amount: Number(b.totalAmount) || 0,
        status: b.status,
        party: b.clientName || "Client",
        counterparty: b.agency?.agencyName || "Agency",
        createdAt: b.updatedAt || b.createdAt,
      })),
      ...recentCampaignRates.map((a) => ({
        id: `campaign-${a.id}`,
        source: "CAMPAIGN",
        title: a.campaign?.title
          ? `Campaign · ${a.campaign.title}`
          : "Campaign hire",
        amount: Number(a.rate) || 0,
        status: "ACCEPTED",
        party: a.campaign?.title ? "Brand" : "Client",
        counterparty: a.talent?.name || a.name || "Talent",
        createdAt: a.updatedAt || a.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);

    // Verification queues
    const [pendingCreators, pendingAgencies] = await Promise.all([
      db.user.count({
        where: { role: "CREATOR", verificationStatus: "PENDING" },
      }),
      db.mediaAgency.count({ where: { verificationStatus: "PENDING" } }),
    ]);

    const [openDisputes, disputesUnderReview, disputesResolved] =
      await Promise.all([
        db.dispute.count({ where: { status: "OPEN" } }),
        db.dispute.count({ where: { status: "UNDER_REVIEW" } }),
        db.dispute.count({ where: { status: "RESOLVED" } }),
      ]);

    // Recent activity (last 7 days)
    const recentUsers = await db.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Calculate growth rates
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const previousWeekUsers = await db.user.count({
      where: {
        createdAt: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo,
        },
      },
    });

    const userGrowthRate = previousWeekUsers > 0
      ? ((recentUsers - previousWeekUsers) / previousWeekUsers * 100).toFixed(1)
      : recentUsers > 0 ? "100" : "0";

    // Generate monthly user growth data
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const count = await db.user.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });
      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        users: count,
      });
    }

    return {
      users: {
        total: await db.user.count(),
        recent: recentUsers,
        growthRate: userGrowthRate,
        monthlyData,
      },
      appointments: {
        total: totalAppointments,
        recent: recentAppointments,
        byStatus: appointmentsByStatus,
      },
      payouts: {
        total: totalPayouts,
        pending: pendingPayouts,
        processed: processedPayouts,
        totalAmount: totalPayoutAmount._sum.netAmount || 0,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
      },
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns,
      },
      mediaAgencies: {
        total: totalAgencies,
        verified: verifiedAgencies,
        pending: pendingAgencies,
        listings: totalListings,
      },
      credits: {
        total: creditsStats._sum.credits || 0,
        average: Math.round(creditsStats._avg.credits || 0),
      },
      applications: {
        pending: pendingApplications,
        accepted: acceptedApplications,
        byStatus: applicationsByStatus,
      },
      logistics: {
        total: logisticsTotal,
        attention: logisticsProblem,
        returns: logisticsReturn,
        byStatus: logisticsByStatus,
      },
      negotiations: {
        total: negotiationsTotal,
        open: negotiationsOpen,
        byStatus: negotiationsByStatus,
      },
      mediaBookings: {
        pending: mediaBookingsPending + rateCardBookingsPending,
        confirmed: mediaBookingsConfirmed + rateCardBookingsConfirmed,
        listingPending: mediaBookingsPending,
        rateCardPending: rateCardBookingsPending,
        publishedRateCards,
        totalRateCards,
      },
      delivery: {
        submitted: deliverySubmitted,
        byStatus: deliveryByStatus,
        transmissionCertificates,
      },
      marketplace: {
        completed: salesCompleted,
        pending: salesPending,
        refunded: salesRefunded,
        revenue: salesRevenue._sum.amount || 0,
        platformFees: salesRevenue._sum.platformFee || 0,
        creatorEarnings: salesRevenue._sum.creatorEarnings || 0,
        comingSoon: true,
      },
      /** Live GMV from bookings only (marketplace excluded until launch). */
      transactions: {
        volumeGhs: bookingVolumeGhs,
        count: bookingTxnCount,
        talentsGhs,
        mediaGhs,
        campaignsGhs,
        talentInvoicesPaid: talentInvoiceCount,
        mediaBookingsCommitted:
          (mediaListingAgg._count || 0) + (mediaRateCardAgg._count || 0),
        campaignHires: campaignRatesAgg._count || 0,
        recent: recentTransactions,
      },
      verification: {
        pendingCreators,
        pendingAgencies,
      },
      operations: {
        attention:
          pendingCreators +
          pendingAgencies +
          pendingPayouts +
          deliverySubmitted +
          negotiationsOpen +
          logisticsProblem +
          pendingApplications +
          mediaBookingsPending +
          rateCardBookingsPending +
          openDisputes,
      },
      disputes: {
        open: openDisputes,
        underReview: disputesUnderReview,
        resolved: disputesResolved,
        total: openDisputes + disputesUnderReview + disputesResolved,
      },
    };
  } catch (error) {
    console.error("Failed to fetch admin analytics:", error);
    throw new Error("Failed to fetch analytics");
  }
}

const disputeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  imageUrl: true,
  specialty: true,
};

/**
 * Lists disputes for admin review
 */
export async function getDisputes({ status = "ALL" } = {}) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const where =
      status && status !== "ALL"
        ? { status }
        : undefined;

    const disputes = await db.dispute.findMany({
      where,
      include: {
        reporter: { select: disputeUserSelect },
        againstUser: { select: disputeUserSelect },
        resolvedBy: {
          select: { id: true, name: true, email: true },
        },
        appointment: {
          select: {
            id: true,
            status: true,
            startTime: true,
            source: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    const [open, underReview, resolved, rejected, closed] = await Promise.all([
      db.dispute.count({ where: { status: "OPEN" } }),
      db.dispute.count({ where: { status: "UNDER_REVIEW" } }),
      db.dispute.count({ where: { status: "RESOLVED" } }),
      db.dispute.count({ where: { status: "REJECTED" } }),
      db.dispute.count({ where: { status: "CLOSED" } }),
    ]);

    return {
      disputes,
      stats: {
        open,
        underReview,
        resolved,
        rejected,
        closed,
        total: open + underReview + resolved + rejected + closed,
        attention: open + underReview,
      },
    };
  } catch (error) {
    console.error("Failed to fetch disputes:", error);
    throw new Error("Failed to fetch disputes");
  }
}

/**
 * Updates dispute status / resolution notes
 */
export async function updateDisputeStatus(formData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const disputeId = formData.get("disputeId");
  const status = formData.get("status");
  const resolution = formData.get("resolution") || null;
  const priority = formData.get("priority");

  const allowedStatuses = [
    "OPEN",
    "UNDER_REVIEW",
    "RESOLVED",
    "REJECTED",
    "CLOSED",
  ];
  const allowedPriorities = ["LOW", "MEDIUM", "HIGH"];

  if (!disputeId || !allowedStatuses.includes(status)) {
    throw new Error("Invalid input");
  }

  if (priority && !allowedPriorities.includes(priority)) {
    throw new Error("Invalid priority");
  }

  try {
    const authResult = await getAuthUserId();
    const terminal = ["RESOLVED", "REJECTED", "CLOSED"].includes(status);

    const dispute = await db.dispute.update({
      where: { id: disputeId },
      data: {
        status,
        ...(priority ? { priority } : {}),
        resolution: resolution || undefined,
        resolvedAt: terminal ? new Date() : null,
        resolvedById: terminal ? authResult?.userId || null : null,
      },
      include: {
        reporter: { select: disputeUserSelect },
        againstUser: { select: disputeUserSelect },
      },
    });

    revalidatePath("/admin");
    return { success: true, dispute };
  } catch (error) {
    console.error("Failed to update dispute:", error);
    throw new Error("Failed to update dispute");
  }
}
