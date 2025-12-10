"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { format, startOfMonth, endOfMonth } from "date-fns";

/**
 * Get all appointments for the authenticated patient
 */
export async function getPatientAppointments() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "CLIENT",
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new Error("Patient not found");
    }

    const appointments = await db.appointment.findMany({
      where: {
        clientId: user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            specialty: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return { appointments };
  } catch (error) {
    console.error("Failed to get patient appointments:", error);
    return { error: "Failed to fetch appointments" };
  }
}

/**
 * Get client dashboard statistics and overview
 */
export async function getClientStats() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "CLIENT",
      },
      include: {
        clientAppointments: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                specialty: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            startTime: "desc",
          },
          take: 5,
        },
      },
    });

    if (!user) {
      throw new Error("Client not found");
    }

    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    // Get all appointments for calculations
    const allAppointments = await db.appointment.findMany({
      where: {
        clientId: user.id,
      },
    });

    // Calculate stats
    const totalAppointments = allAppointments.length;
    const completedAppointments = allAppointments.filter(
      (apt) => apt.status === "COMPLETED"
    ).length;
    const upcomingAppointments = allAppointments.filter(
      (apt) =>
        apt.status === "SCHEDULED" && new Date(apt.startTime) > now
    ).length;
    const cancelledAppointments = allAppointments.filter(
      (apt) => apt.status === "CANCELLED"
    ).length;

    // Get appointments this month
    const appointmentsThisMonth = allAppointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return aptDate >= startOfCurrentMonth && aptDate <= endOfCurrentMonth;
    }).length;

    return {
      stats: {
        totalAppointments,
        completedAppointments,
        upcomingAppointments,
        cancelledAppointments,
        appointmentsThisMonth,
      },
      recentAppointments: user.patientAppointments || [],
    };
  } catch (error) {
    console.error("Failed to get client stats:", error);
    throw new Error("Failed to fetch client statistics: " + error.message);
  }
}

/**
 * Get client credit transactions history
 */
export async function getClientTransactions() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "CLIENT",
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new Error("Client not found");
    }

    const transactions = await db.creditTransaction.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { transactions };
  } catch (error) {
    console.error("Failed to get client transactions:", error);
    throw new Error("Failed to fetch transactions: " + error.message);
  }
}

/**
 * Update client profile information
 */
export async function updateClientProfile(formData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get the client
    const client = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "CLIENT",
      },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    // Get form data
    const name = formData.get("name");
    const imageUrl = formData.get("imageUrl");

    // Validate required fields
    if (!name) {
      throw new Error("Name is required");
    }

    // Update the client profile
    const updatedClient = await db.user.update({
      where: {
        id: client.id,
      },
      data: {
        name: name.trim(),
        imageUrl: imageUrl || client.imageUrl, // Keep existing if not provided
      },
    });

    revalidatePath("/client");
    return { success: true, client: updatedClient };
  } catch (error) {
    console.error("Failed to update client profile:", error);
    throw new Error("Failed to update profile: " + error.message);
  }
}
