import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { CreatorLeaderboard } from "../_components/creator-leaderboard";
import {
  CREATOR_LEADERBOARD_DEMO,
  shapeCreatorLeaderboard,
} from "@/lib/creator-leaderboard";

export const dynamic = "force-dynamic";

async function loadCreatorEntries() {
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
      take: 40,
    });

    if (!creators.length) return CREATOR_LEADERBOARD_DEMO;

    return creators.map((creator) => {
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
        userName: creator.name || "Creator",
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
  } catch (error) {
    console.error("Creator leaderboard load failed:", error);
    return CREATOR_LEADERBOARD_DEMO;
  }
}

export default async function CreatorLeaderboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CREATOR") {
    redirect("/onboarding");
  }

  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  const liveEntries = await loadCreatorEntries();
  const shaped = shapeCreatorLeaderboard(liveEntries);
  const entries =
    shaped.entries.length >= 3 ? liveEntries : CREATOR_LEADERBOARD_DEMO;

  return (
    <CreatorLeaderboard
      currentUserId={user.id}
      currentUserName={user.name}
      entries={entries}
    />
  );
}
