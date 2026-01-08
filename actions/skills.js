// actions/doctor.js
"use server";
import { db } from "@/lib/prisma";

/**
 * Fetch a doctor's profile by their clerkUserId (for public profile)
 */
export async function getDoctorProfile(doctorId) {
    const doctor = await db.user.findUnique({
      where: { id: doctorId }, // ✅ use database ID
      include: { skills: true },
    });
  
    if (!doctor) throw new Error("Doctor not found");
    return doctor;
  }
  