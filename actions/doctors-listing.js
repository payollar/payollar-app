"use server";

import { db } from "@/lib/prisma";

/**
 * Get doctors by specialty
 */
export async function getDoctorsBySpecialty(specialty) {
  try {
    const doctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
        specialty: specialty.split("%20").join(" "),
      },
      include: {
        skills: {
          select: {
            id: true,
            name: true,
          },
          take: 3, // Limit to first 3 skills for display
        },
        availabilities: {
          where: {
            status: "AVAILABLE",
            startTime: {
              gte: new Date(), // Only future availability
            },
          },
          take: 1, // Just check if any available slots exist
        },
      },
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
