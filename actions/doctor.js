"use server";

import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";
import { revalidatePath } from "next/cache";

/**
 * Set doctor's availability slots
 */
export async function setAvailabilitySlots(formData) {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get the doctor
    const doctor = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CREATOR",
      },
    });

    if (!doctor) {
      throw new Error("Talent not found");
    }

    // Get form data
    const startTime = formData.get("startTime");
    const endTime = formData.get("endTime");

    // Validate input
    if (!startTime || !endTime) {
      throw new Error("Start time and end time are required");
    }

    if (startTime >= endTime) {
      throw new Error("Start time must be before end time");
    }

    // Check if the doctor already has slots
    const existingSlots = await db.availability.findMany({
      where: {
        creatorId: doctor.id,
      },
    });

    // If slots exist, delete them all (we're replacing them)
    if (existingSlots.length > 0) {
      // Don't delete slots that already have appointments
      const slotsWithNoAppointments = existingSlots.filter(
        (slot) => !slot.appointment
      );

      if (slotsWithNoAppointments.length > 0) {
        await db.availability.deleteMany({
          where: {
            id: {
              in: slotsWithNoAppointments.map((slot) => slot.id),
            },
          },
        });
      }
    }

    // Create new availability slot
    const newSlot = await db.availability.create({
      data: {
        creatorId: doctor.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: "AVAILABLE",
      },
    });

    revalidatePath("/creator");
    revalidatePath("/creator/profile");
    revalidatePath("/creator/availability");
    return { success: true, slot: newSlot };
  } catch (error) {
    console.error("Failed to set availability slots:", error);
    throw new Error("Failed to set availability: " + error.message);
  }
}

/**
 * Get doctor's current availability slots
 */
export async function getDoctorAvailability() {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const doctor = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CREATOR",
      },
    });

    if (!doctor) {
      throw new Error("Talent not found");
    }

    const availabilitySlots = await db.availability.findMany({
      where: {
        creatorId: doctor.id,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return { slots: availabilitySlots || [] };
  } catch (error) {
    // Return empty slots instead of throwing an error
    console.error("Failed to fetch availability slots:", error);
    return { slots: [] };
  }
}

/**
 * Get doctor's upcoming appointments
 */

export async function getDoctorAppointments() {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const doctor = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CREATOR",
      },
    });

    if (!doctor) {
      throw new Error("Talent not found");
    }

    const appointments = await db.appointment.findMany({
      where: {
        creatorId: doctor.id,
        status: {
          in: ["SCHEDULED"],
        },
      },
      include: {
        client: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return { appointments };
  } catch (error) {
    throw new Error("Failed to fetch appointments " + error.message);
  }
}

/**
 * Cancel an appointment (can be done by both doctor and patient)
 */
export async function cancelAppointment(formData) {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const user = await db.user.findUnique({
      where: {
        id: authResult.userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const appointmentId = formData.get("appointmentId");

    if (!appointmentId) {
      throw new Error("Appointment ID is required");
    }

    // Find the appointment with both patient and doctor details
    const appointment = await db.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        client: true,
        creator: true,
      },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Verify the user is either the doctor or the patient for this appointment
    if (appointment.creatorId !== user.id && appointment.clientId !== user.id) {
      throw new Error("You are not authorized to cancel this appointment");
    }

    // Update the appointment status to CANCELLED
    await db.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: "CANCELLED",
      },
    });

    // Determine which path to revalidate based on user role
    if (user.role === "CREATOR") {
      revalidatePath("/creator");
    } else if (user.role === "CLIENT") {
      revalidatePath("/appointments");
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to cancel appointment:", error);
    throw new Error("Failed to cancel appointment: " + error.message);
  }
}

/**
 * Add notes to an appointment
 */
export async function addAppointmentNotes(formData) {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const doctor = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CREATOR",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const appointmentId = formData.get("appointmentId");
    const notes = formData.get("notes");

    if (!appointmentId || !notes) {
      throw new Error("Appointment ID and notes are required");
    }

    // Verify the appointment belongs to this doctor
    const appointment = await db.appointment.findUnique({
      where: {
        id: appointmentId,
        creatorId: doctor.id,
      },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Update the appointment notes
    const updatedAppointment = await db.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        notes,
      },
    });

    revalidatePath("/creator");
    return { success: true, appointment: updatedAppointment };
  } catch (error) {
    console.error("Failed to add appointment notes:", error);
    throw new Error("Failed to update notes: " + error.message);
  }
}

/**
 * Mark an appointment as completed (only by doctor after end time)
 */
export async function markAppointmentCompleted(formData) {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const doctor = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CREATOR",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const appointmentId = formData.get("appointmentId");

    if (!appointmentId) {
      throw new Error("Appointment ID is required");
    }

    // Find the appointment
    const appointment = await db.appointment.findUnique({
      where: {
        id: appointmentId,
        creatorId: doctor.id, // Ensure appointment belongs to this doctor
      },
      include: {
        client: true,
      },
    });

    if (!appointment) {
      throw new Error("Appointment not found or not authorized");
    }

    // Check if appointment is currently scheduled
    if (appointment.status !== "SCHEDULED") {
      throw new Error("Only scheduled appointments can be marked as completed");
    }

    // Check if current time is after the appointment end time
    const now = new Date();
    const appointmentEndTime = new Date(appointment.endTime);

    if (now < appointmentEndTime) {
      throw new Error(
        "Cannot mark appointment as completed before the scheduled end time"
      );
    }

    // Update the appointment status to COMPLETED
    const updatedAppointment = await db.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: "COMPLETED",
      },
    });

    revalidatePath("/creator");
    return { success: true, appointment: updatedAppointment };
  } catch (error) {
    console.error("Failed to mark appointment as completed:", error);
    throw new Error(
      "Failed to mark appointment as completed: " + error.message
    );
  }
}

/**
 * Get public doctor profile (with skills, bio, etc.)
 */
export async function getPublicDoctorProfile(doctorId) {
  try {
    const doctor = await db.user.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        name: true,
        description: true,
        skills: {
          select: { id: true, name: true },
        },
        // add any other public fields you want here
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    return doctor;
  } catch (error) {
    console.error("Failed to fetch public doctor profile:", error);
    throw new Error("Failed to fetch profile: " + error.message);
  }
}

/**
 * Update creator/talent profile information
 */
export async function updateCreatorProfile(formData) {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get the creator/talent
    const creator = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CREATOR",
      },
    });

    if (!creator) {
      throw new Error("Creator not found");
    }

    // Get form data
    const name = formData.get("name");
    const specialty = formData.get("specialty");
    const description = formData.get("description");
    const imageUrl = formData.get("imageUrl");

    // Validate required fields
    if (!name || !description) {
      throw new Error("Name and description are required");
    }

    // Update the creator profile
    const updatedCreator = await db.user.update({
      where: {
        id: creator.id,
      },
      data: {
        name: name.trim(),
        specialty: specialty?.trim() || null,
        description: description.trim(),
        imageUrl: imageUrl || creator.imageUrl, // Keep existing if not provided
      },
    });

    revalidatePath("/creator");
    return { success: true, creator: updatedCreator };
  } catch (error) {
    console.error("Failed to update creator profile:", error);
    throw new Error("Failed to update profile: " + error.message);
  }
}

