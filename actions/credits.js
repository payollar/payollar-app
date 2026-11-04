"use server";

import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

// Define credit allocations per plan
const PLAN_CREDITS = {
  free_user: 0, // Basic plan: 2 credits
  standard: 10, // Standard plan: 10 credits per month
  premium: 24, // Premium plan: 24 credits per month
};

// Each appointment costs 2 credits
const APPOINTMENT_CREDIT_COST = 2;

/** One-time creator welcome offer: 100 credits ≈ GH₵100, claimable for 24h after signup eligibility */
const CREATOR_WELCOME_CREDITS = 100;
const CREATOR_WELCOME_TASK_ID = "creator-welcome-100";
const CREATOR_WELCOME_WINDOW_ID = "creator-welcome-100-window";
const WELCOME_WINDOW_MS = 24 * 60 * 60 * 1000;

function emptyWelcomeStatus(extra = {}) {
  return {
    eligible: false,
    claimed: false,
    canClaim: false,
    expired: false,
    reward: CREATOR_WELCOME_CREDITS,
    expiresAt: null,
    remainingMs: 0,
    ...extra,
  };
}

async function getOrStartWelcomeWindow(userId, { renewIfExpired = false } = {}) {
  const existing = await db.creditTransaction.findFirst({
    where: {
      userId,
      type: "TASK_REWARD",
      packageId: CREATOR_WELCOME_WINDOW_ID,
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true },
  });

  if (existing) {
    const remaining = existing.createdAt.getTime() + WELCOME_WINDOW_MS - Date.now();
    if (remaining > 0 || !renewIfExpired) {
      // Drop any older duplicate window rows from parallel creates
      await db.creditTransaction.deleteMany({
        where: {
          userId,
          type: "TASK_REWARD",
          packageId: CREATOR_WELCOME_WINDOW_ID,
          id: { not: existing.id },
        },
      });
      return existing;
    }

    await db.creditTransaction.deleteMany({
      where: {
        userId,
        type: "TASK_REWARD",
        packageId: CREATOR_WELCOME_WINDOW_ID,
      },
    });
  }

  return db.creditTransaction.create({
    data: {
      userId,
      amount: 0,
      type: "TASK_REWARD",
      packageId: CREATOR_WELCOME_WINDOW_ID,
    },
    select: { id: true, createdAt: true },
  });
}

/**
 * Status of the creator welcome credit offer (100 GH₵).
 * Eligible on verified signup — no tasks. 24h claim window starts on first offer view.
 */
export async function getCreatorWelcomeCreditsStatus() {
  const authResult = await getAuthUserId();
  if (!authResult?.userId) {
    return emptyWelcomeStatus();
  }

  try {
    const creator = await db.user.findUnique({
      where: { id: authResult.userId, role: "CREATOR" },
      select: {
        id: true,
        verificationStatus: true,
        credits: true,
      },
    });

    if (!creator || creator.verificationStatus !== "VERIFIED") {
      return emptyWelcomeStatus({ balance: creator?.credits ?? 0 });
    }

    const claimed = await db.creditTransaction.findFirst({
      where: {
        userId: creator.id,
        type: "TASK_REWARD",
        packageId: CREATOR_WELCOME_TASK_ID,
        amount: { gt: 0 },
      },
      select: { id: true, createdAt: true },
    });

    // Renew at most once when reading status if the prior window already lapsed unclaimed
    const window = await getOrStartWelcomeWindow(creator.id, {
      renewIfExpired: !claimed,
    });
    const expiresAt = new Date(window.createdAt.getTime() + WELCOME_WINDOW_MS);
    const remainingMs = Math.max(0, expiresAt.getTime() - Date.now());
    const expired = !claimed && remainingMs <= 0;

    return {
      eligible: true,
      claimed: Boolean(claimed),
      claimedAt: claimed?.createdAt ?? null,
      canClaim: !claimed && !expired,
      expired,
      expiresAt: expiresAt.toISOString(),
      remainingMs,
      reward: CREATOR_WELCOME_CREDITS,
      balance: creator.credits,
    };
  } catch (error) {
    console.error("Failed to load welcome credits status:", error);
    return emptyWelcomeStatus({ error: error.message });
  }
}

/**
 * Welcome credits stay in the wallet but cannot be withdrawn until the creator
 * has at least one non-cancelled booking (appointment).
 */
export async function getCreatorWelcomePayoutGate(userId) {
  if (!userId) {
    return {
      welcomeCredits: 0,
      lockedCredits: 0,
      unlocked: true,
      hasBooking: false,
    };
  }

  const [welcomeTxn, booking] = await Promise.all([
    db.creditTransaction.findFirst({
      where: {
        userId,
        type: "TASK_REWARD",
        packageId: CREATOR_WELCOME_TASK_ID,
        amount: { gt: 0 },
      },
      select: { amount: true },
    }),
    db.appointment.findFirst({
      where: {
        creatorId: userId,
        status: { not: "CANCELLED" },
      },
      select: { id: true },
    }),
  ]);

  const welcomeCredits = Number(welcomeTxn?.amount || 0);
  const hasBooking = Boolean(booking);
  const unlocked = hasBooking || welcomeCredits === 0;

  return {
    welcomeCredits,
    lockedCredits: unlocked ? 0 : welcomeCredits,
    unlocked,
    hasBooking,
  };
}

/**
 * Recent credit ledger rows for Earnings activity (excludes zero-amount window markers).
 */
export async function getCreatorCreditActivity() {
  const authResult = await getAuthUserId();
  if (!authResult?.userId) {
    return { activities: [] };
  }

  try {
    const creator = await db.user.findUnique({
      where: { id: authResult.userId, role: "CREATOR" },
      select: { id: true },
    });
    if (!creator) {
      return { activities: [] };
    }

    const rows = await db.creditTransaction.findMany({
      where: {
        userId: creator.id,
        amount: { not: 0 },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        amount: true,
        type: true,
        packageId: true,
        createdAt: true,
      },
    });

    const activities = rows.map((row) => {
      let label = "Credit adjustment";
      if (row.type === "TASK_REWARD" && row.packageId === CREATOR_WELCOME_TASK_ID) {
        label = "Welcome credits claimed";
      } else if (row.type === "TASK_REWARD") {
        label = "Task reward";
      } else if (row.type === "CREDIT_PURCHASE") {
        label = "Credits purchased";
      } else if (row.type === "APPOINTMENT_DEDUCTION") {
        label = "Booking deduction";
      } else if (row.type === "ADMIN_ADJUSTMENT") {
        label = "Admin adjustment";
      }

      return {
        id: row.id,
        label,
        amount: row.amount,
        type: row.type,
        packageId: row.packageId,
        createdAt: row.createdAt,
      };
    });

    return { activities };
  } catch (error) {
    console.error("Failed to load credit activity:", error);
    return { activities: [] };
  }
}

/**
 * Claim the one-time GH₵100 creator welcome credits within the 24h window.
 */
export async function claimCreatorWelcomeCredits() {
  const authResult = await getAuthUserId();
  if (!authResult?.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const creator = await db.user.findUnique({
      where: { id: authResult.userId, role: "CREATOR" },
      select: {
        id: true,
        verificationStatus: true,
      },
    });

    if (!creator) {
      throw new Error("Creator account required");
    }
    if (creator.verificationStatus !== "VERIFIED") {
      throw new Error("Finish verification before claiming welcome credits");
    }

    const existing = await db.creditTransaction.findFirst({
      where: {
        userId: creator.id,
        type: "TASK_REWARD",
        packageId: CREATOR_WELCOME_TASK_ID,
        amount: { gt: 0 },
      },
      select: { id: true },
    });
    if (existing) {
      throw new Error("Welcome credits already claimed");
    }

    const window = await getOrStartWelcomeWindow(creator.id, {
      renewIfExpired: true,
    });
    const expiresAt = window.createdAt.getTime() + WELCOME_WINDOW_MS;
    if (Date.now() > expiresAt) {
      throw new Error("Welcome credits offer has expired");
    }

    const updatedUser = await db.$transaction(async (tx) => {
      await tx.creditTransaction.create({
        data: {
          userId: creator.id,
          amount: CREATOR_WELCOME_CREDITS,
          type: "TASK_REWARD",
          packageId: CREATOR_WELCOME_TASK_ID,
        },
      });

      return tx.user.update({
        where: { id: creator.id },
        data: { credits: { increment: CREATOR_WELCOME_CREDITS } },
        select: { id: true, credits: true },
      });
    });

    revalidatePath("/creator");
    revalidatePath("/creator/payouts");
    revalidatePath("/creator", "layout");

    return {
      success: true,
      credits: updatedUser.credits,
      rewarded: CREATOR_WELCOME_CREDITS,
    };
  } catch (error) {
    console.error("Failed to claim welcome credits:", error);
    throw new Error(error.message || "Failed to claim welcome credits");
  }
}

/**
 * Checks user's subscription and allocates monthly credits if needed
 * This should be called on app initialization (e.g., in a layout component)
 */
export async function checkAndAllocateCredits(user) {
  try {
    if (!user) {
      return null;
    }

    // Only allocate credits for patients
    if (user.role !== "CLIENT") {
      return user;
    }

    // Check if user has a subscription
    // Note: Subscription plans would need to be stored in the database
    // For now, defaulting to free_user plan
    // TODO: Implement subscription system with Better Auth
    const hasBasic = true; // Default to free plan
    const hasStandard = false;
    const hasPremium = false;

    let currentPlan = null;
    let creditsToAllocate = 0;

    if (hasPremium) {
      currentPlan = "premium";
      creditsToAllocate = PLAN_CREDITS.premium;
    } else if (hasStandard) {
      currentPlan = "standard";
      creditsToAllocate = PLAN_CREDITS.standard;
    } else if (hasBasic) {
      currentPlan = "free_user";
      creditsToAllocate = PLAN_CREDITS.free_user;
    }

    // If user doesn't have any plan, just return the user
    if (!currentPlan) {
      return user;
    }

    // Check if we already allocated credits for this month
    const currentMonth = format(new Date(), "yyyy-MM");

    // If there's a transaction this month, check if it's for the same plan
    if (user.transactions.length > 0) {
      const latestTransaction = user.transactions[0];
      const transactionMonth = format(
        new Date(latestTransaction.createdAt),
        "yyyy-MM"
      );
      const transactionPlan = latestTransaction.packageId;

      // If we already allocated credits for this month and the plan is the same, just return
      if (
        transactionMonth === currentMonth &&
        transactionPlan === currentPlan
      ) {
        return user;
      }
    }

    // Allocate credits and create transaction record
    const updatedUser = await db.$transaction(async (tx) => {
      // Create transaction record
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: creditsToAllocate,
          type: "CREDIT_PURCHASE",
          packageId: currentPlan,
        },
      });

      // Update user's credit balance
      const updatedUser = await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          credits: {
            increment: creditsToAllocate,
          },
        },
      });

      return updatedUser;
    });

    // Revalidate relevant paths to reflect updated credit balance
    revalidatePath("/talents");
    revalidatePath("/appointments");

    return updatedUser;
  } catch (error) {
    console.error(
      "Failed to check subscription and allocate credits:",
      error.message
    );
    return null;
  }
}

/**
 * Deducts credits for booking an appointment
 */
export async function deductCreditsForAppointment(userId, doctorId) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    const doctor = await db.user.findUnique({
      where: { id: doctorId },
    });

    // Ensure user has sufficient credits
    if (user.credits < APPOINTMENT_CREDIT_COST) {
      throw new Error("Insufficient credits to book an appointment");
    }

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // Deduct credits from patient and add to doctor
    const result = await db.$transaction(async (tx) => {
      // Create transaction record for patient (deduction)
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: -APPOINTMENT_CREDIT_COST,
          type: "APPOINTMENT_DEDUCTION",
        },
      });

      // Create transaction record for doctor (addition)
      await tx.creditTransaction.create({
        data: {
          userId: doctor.id,
          amount: APPOINTMENT_CREDIT_COST,
          type: "APPOINTMENT_DEDUCTION", // Using same type for consistency
        },
      });

      // Update patient's credit balance (decrement)
      const updatedUser = await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          credits: {
            decrement: APPOINTMENT_CREDIT_COST,
          },
        },
      });

      // Update doctor's credit balance (increment)
      await tx.user.update({
        where: {
          id: doctor.id,
        },
        data: {
          credits: {
            increment: APPOINTMENT_CREDIT_COST,
          },
        },
      });

      return updatedUser;
    });

    return { success: true, user: result };
  } catch (error) {
    console.error("Failed to deduct credits:", error);
    return { success: false, error: error.message };
  }
}
