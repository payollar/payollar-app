"use server";

import { db } from "@/lib/prisma";

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
      include: {
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
