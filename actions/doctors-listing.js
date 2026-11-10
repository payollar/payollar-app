"use server";

import { db } from "@/lib/prisma";

const talentCardInclude = {
  skills: {
    select: {
      id: true,
      name: true,
    },
    orderBy: { createdAt: "asc" },
  },
  availabilities: {
    where: {
      status: "AVAILABLE",
      startTime: {
        gte: new Date(),
      },
    },
    take: 1,
  },
  services: {
    where: { isActive: true },
    select: { rate: true, rateType: true },
    orderBy: { rate: "asc" },
    take: 1,
  },
};

/**
 * Get all verified creators for the All talents directory.
 */
export async function getAllVerifiedTalents() {
  try {
    const doctors = await db.user.findMany({
      where: {
        role: "CREATOR",
        verificationStatus: "VERIFIED",
      },
      include: talentCardInclude,
      orderBy: {
        name: "asc",
      },
    });

    return { doctors };
  } catch (error) {
    console.error("Failed to fetch all talents:", error);
    return { doctors: [], error: "Failed to fetch talents" };
  }
}

/**
 * Ranked verified creators for the public Find talents leaderboard.
 * Score blends completed bookings, scheduled work, and product revenue.
 */
export async function getTalentLeaderboardEntries() {
  try {
    const creators = await db.user.findMany({
      where: {
        role: "CREATOR",
        verificationStatus: "VERIFIED",
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        specialty: true,
        creatorAppointments: {
          select: { status: true },
        },
        productPurchases: {
          select: { amount: true },
        },
      },
      take: 60,
    });

    const entries = creators.map((creator) => {
      const completed = creator.creatorAppointments.filter(
        (appointment) => appointment.status === "COMPLETED"
      ).length;
      const booked = creator.creatorAppointments.filter(
        (appointment) =>
          appointment.status === "SCHEDULED" || appointment.status === "COMPLETED"
      ).length;
      const cancelled = creator.creatorAppointments.filter(
        (appointment) => appointment.status === "CANCELLED"
      ).length;
      const productRevenue = creator.productPurchases.reduce(
        (sum, sale) => sum + Number(sale.amount || 0),
        0
      );
      const total = Math.max(completed + cancelled, 1);
      const winRate = Math.round((completed / total) * 100);
      const score = Number(
        ((completed + booked * 0.35) / Math.max(cancelled + 1, 1)).toFixed(2)
      );
      const value = Math.round(completed * 4200 + booked * 1800 + productRevenue);

      return {
        userId: creator.id,
        userName: creator.name || "Talent",
        specialty: creator.specialty || "Creator",
        avatarUrl: creator.imageUrl,
        value: Math.max(value, 1200),
        completed,
        booked,
        winRate,
        score,
        rankChange: 0,
      };
    });

    entries.sort((a, b) => b.value - a.value);
    return { entries };
  } catch (error) {
    console.error("Failed to fetch talent leaderboard:", error);
    return { entries: [], error: "Failed to fetch leaderboard" };
  }
}

/**
 * Get doctors by specialty
 */
export async function getDoctorsBySpecialty(specialty) {
  try {
    const doctors = await db.user.findMany({
      where: {
        role: "CREATOR",
        verificationStatus: "VERIFIED",
        specialty: specialty.split("%20").join(" "),
      },
      include: talentCardInclude,
      orderBy: {
        name: "asc",
      },
    });

    return { doctors };
  } catch (error) {
    console.error("Failed to fetch talents by specialty:", error);
    return { error: "Failed to fetch talents" };
  }
}
