"use server";

import { db } from "@/lib/prisma";

/**
 * Get all verified creators/talents with their services
 */
export async function getAllTalents(options = {}) {
  try {
    const {
      search = "",
      specialty = null,
      category = null,
      limit = 50,
    } = options;

    const where = {
      role: "CREATOR",
      verificationStatus: "VERIFIED",
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { specialty: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (specialty) {
      where.specialty = specialty;
    }

    const talents = await db.user.findMany({
      where,
      take: limit,
      include: {
        services: {
          where: {
            isActive: true,
            ...(category ? { category } : {}),
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5, // Limit services per talent
        },
        skills: {
          take: 5,
        },
        _count: {
          select: {
            services: {
              where: { isActive: true },
            },
            creatorAppointments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { talents };
  } catch (error) {
    console.error("Error fetching talents:", error);
    return { talents: [], error: "Failed to fetch talents" };
  }
}

/**
 * Get all available service categories
 */
export async function getServiceCategories() {
  try {
    const services = await db.service.findMany({
      where: {
        isActive: true,
        creator: {
          verificationStatus: "VERIFIED",
        },
      },
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    const categories = services
      .map((s) => s.category)
      .filter((cat) => cat)
      .sort();

    return { categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { categories: [] };
  }
}
