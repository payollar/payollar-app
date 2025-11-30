"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const CREDIT_VALUE = 10; // $10 per credit total
const PLATFORM_FEE_PER_CREDIT = 2; // $2 platform fee
const DOCTOR_EARNINGS_PER_CREDIT = 8; // $8 to doctor

/**
 * Request payout for all remaining credits
 */
export async function requestPayout(formData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const paypalEmail = formData.get("paypalEmail");

    if (!paypalEmail) {
      throw new Error("PayPal email is required");
    }

    // Check if doctor has any pending payout requests
    const existingPendingPayout = await db.payout.findFirst({
      where: {
        doctorId: doctor.id,
        status: "PROCESSING",
      },
    });

    if (existingPendingPayout) {
      throw new Error(
        "You already have a pending payout request. Please wait for it to be processed."
      );
    }

    // Get doctor's current credit balance
    const creditCount = doctor.credits;

    if (creditCount === 0) {
      throw new Error("No credits available for payout");
    }

    if (creditCount < 1) {
      throw new Error("Minimum 1 credit required for payout");
    }

    const totalAmount = creditCount * CREDIT_VALUE;
    const platformFee = creditCount * PLATFORM_FEE_PER_CREDIT;
    const netAmount = creditCount * DOCTOR_EARNINGS_PER_CREDIT;

    // Create payout request
    const payout = await db.payout.create({
      data: {
        doctorId: doctor.id,
        amount: totalAmount,
        credits: creditCount,
        platformFee,
        netAmount,
        paypalEmail,
        status: "PROCESSING",
      },
    });

    revalidatePath("/creator");
    return { success: true, payout };
  } catch (error) {
    console.error("Failed to request payout:", error);
    throw new Error("Failed to request payout: " + error.message);
  }
}

/**
 * Get doctor's payout history
 */
export async function getDoctorPayouts() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const payouts = await db.payout.findMany({
      where: {
        doctorId: doctor.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { payouts };
  } catch (error) {
    throw new Error("Failed to fetch payouts: " + error.message);
  }
}

/**
 * Get doctor's earnings summary (from product sales only)
 */
export async function getDoctorEarnings() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
      select: {
        id: true,
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // Get all completed product sales for this creator
    const allSales = await db.digitalProductSale.findMany({
      where: {
        sellerId: doctor.id,
        status: "COMPLETED",
      },
    });

    // Calculate this month's sales
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const thisMonthSales = allSales.filter(
      (sale) => new Date(sale.createdAt) >= currentMonth
    );

    // Calculate earnings from product sales
    const totalEarnings = allSales.reduce((sum, sale) => sum + sale.creatorEarnings, 0);
    const totalRevenue = allSales.reduce((sum, sale) => sum + sale.amount, 0);
    const thisMonthEarnings = thisMonthSales.reduce((sum, sale) => sum + sale.creatorEarnings, 0);
    const thisMonthRevenue = thisMonthSales.reduce((sum, sale) => sum + sale.amount, 0);

    // Calculate average per month
    const monthsSinceFirstSale = allSales.length > 0
      ? Math.max(1, Math.floor((new Date().getTime() - new Date(allSales[allSales.length - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)))
      : 1;
    const averageEarningsPerMonth = totalEarnings / monthsSinceFirstSale;

    // Available for payout (all earnings from completed sales)
    const availableForPayout = totalEarnings;

    return {
      earnings: {
        totalEarnings,
        totalRevenue,
        thisMonthEarnings,
        thisMonthRevenue,
        completedAppointments: 0, // Keep for backwards compatibility but set to 0
        averageEarningsPerMonth,
        totalSales: allSales.length,
        thisMonthSales: thisMonthSales.length,
        availableForPayout,
      },
    };
  } catch (error) {
    throw new Error("Failed to fetch doctor earnings: " + error.message);
  }
}
