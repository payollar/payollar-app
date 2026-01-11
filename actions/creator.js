"use server";

import { getAuthUserId } from "@/lib/getAuthUserId";
import { db } from "@/lib/prisma";

/**
 * Get creator skills for the current logged-in creator
 */
export async function getCreatorSkills() {
  try {
    const authResult = await getAuthUserId();

    if (!authResult || !authResult.userId) {
      return { skills: [], error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: authResult.userId },
      include: { skills: true },
    });

    if (!user || user.role !== "CREATOR") {
      return { skills: [], error: "User not found or not a creator" };
    }

    return { skills: user.skills || [] };
  } catch (error) {
    console.error("Error fetching creator skills:", error);
    return { skills: [], error: "Failed to fetch skills" };
  }
}

