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
        listings: totalListings,
      },
      credits: {
        total: creditsStats._sum.credits || 0,
        average: Math.round(creditsStats._avg.credits || 0),
      },
    };
  } catch (error) {
    console.error("Failed to fetch admin analytics:", error);
    throw new Error("Failed to fetch analytics");
  }
}
