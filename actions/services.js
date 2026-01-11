"use server";

import { getAuthUserId } from "@/lib/getAuthUserId";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Get all services for the current logged-in creator
 */
export async function getCreatorServices() {
  try {
    const authResult = await getAuthUserId();

    if (!authResult || !authResult.userId) {
      return { services: [], error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: authResult.userId },
      include: { services: { orderBy: { createdAt: "desc" } } },
    });

    if (!user || user.role !== "CREATOR") {
      return { services: [], error: "User not found or not a creator" };
    }

    return { services: user.services || [] };
  } catch (error) {
    console.error("Error fetching creator services:", error);
    return { services: [], error: "Failed to fetch services" };
  }
}

/**
 * Create a new service for the current creator
 */
export async function createService(formData) {
  try {
    const authResult = await getAuthUserId();

    if (!authResult || !authResult.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: authResult.userId },
    });

    if (!user || user.role !== "CREATOR") {
      return { success: false, error: "User not found or not a creator" };
    }

    const title = formData.get("title");
    const description = formData.get("description");
    const rate = parseFloat(formData.get("rate"));
    const rateType = formData.get("rateType") || "PER_HOUR";
    const duration = formData.get("duration") ? parseInt(formData.get("duration")) : null;
    const category = formData.get("category") || null;
    const isActive = formData.get("isActive") === "true" || formData.get("isActive") === true;

    if (!title || !rate || isNaN(rate) || rate <= 0) {
      return { success: false, error: "Title and valid rate are required" };
    }

    const service = await db.service.create({
      data: {
        creatorId: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        rate,
        rateType,
        duration,
        category: category?.trim() || null,
        isActive,
      },
    });

    revalidatePath("/creator/services");
    return { success: true, service };
  } catch (error) {
    console.error("Error creating service:", error);
    return { success: false, error: "Failed to create service" };
  }
}

/**
 * Update an existing service
 */
export async function updateService(formData) {
  try {
    const authResult = await getAuthUserId();

    if (!authResult || !authResult.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: authResult.userId },
    });

    if (!user || user.role !== "CREATOR") {
      return { success: false, error: "User not found or not a creator" };
    }

    const serviceId = formData.get("serviceId");
    const title = formData.get("title");
    const description = formData.get("description");
    const rate = parseFloat(formData.get("rate"));
    const rateType = formData.get("rateType") || "PER_HOUR";
    const duration = formData.get("duration") ? parseInt(formData.get("duration")) : null;
    const category = formData.get("category") || null;
    const isActive = formData.get("isActive") === "true" || formData.get("isActive") === true;

    if (!serviceId || !title || !rate || isNaN(rate) || rate <= 0) {
      return { success: false, error: "Service ID, title, and valid rate are required" };
    }

    // Verify the service belongs to the creator
    const existingService = await db.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService || existingService.creatorId !== user.id) {
      return { success: false, error: "Service not found or unauthorized" };
    }

    const service = await db.service.update({
      where: { id: serviceId },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        rate,
        rateType,
        duration,
        category: category?.trim() || null,
        isActive,
      },
    });

    revalidatePath("/creator/services");
    return { success: true, service };
  } catch (error) {
    console.error("Error updating service:", error);
    return { success: false, error: "Failed to update service" };
  }
}

/**
 * Delete a service
 */
export async function deleteService(formData) {
  try {
    const authResult = await getAuthUserId();

    if (!authResult || !authResult.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: authResult.userId },
    });

    if (!user || user.role !== "CREATOR") {
      return { success: false, error: "User not found or not a creator" };
    }

    const serviceId = formData.get("serviceId");

    if (!serviceId) {
      return { success: false, error: "Service ID is required" };
    }

    // Verify the service belongs to the creator
    const existingService = await db.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService || existingService.creatorId !== user.id) {
      return { success: false, error: "Service not found or unauthorized" };
    }

    await db.service.delete({
      where: { id: serviceId },
    });

    revalidatePath("/creator/services");
    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { success: false, error: "Failed to delete service" };
  }
}
