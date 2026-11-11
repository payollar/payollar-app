"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";
import { MEDIA_ASSET_TYPES } from "@/lib/media-campaign-assets";

const VALID_ASSET_TYPES = new Set(MEDIA_ASSET_TYPES.map((type) => type.id));

async function requireClientUser() {
  const authResult = await getAuthUserId();
  if (!authResult?.userId) {
    return { error: "Unauthorized" };
  }
  const user = await db.user.findUnique({
    where: { id: authResult.userId },
    select: { id: true, email: true, role: true, name: true },
  });
  if (!user || user.role !== "CLIENT" || !user.email) {
    return { error: "Client not found" };
  }
  return { user };
}

async function resolveClientBooking({ user, bookingType, bookingId }) {
  if (bookingType === "RATE_CARD") {
    const booking = await db.rateCardBookingItem.findFirst({
      where: {
        id: bookingId,
        clientEmail: user.email,
      },
      select: {
        id: true,
        agencyId: true,
        mediaCampaignName: true,
        snapshotDescription: true,
        status: true,
        agency: { select: { agencyName: true } },
        rateCard: { select: { title: true } },
      },
    });
    if (!booking) return null;
    return {
      bookingType: "RATE_CARD",
      bookingId: booking.id,
      agencyId: booking.agencyId,
      agencyName: booking.agency?.agencyName || null,
      campaignName:
        booking.mediaCampaignName ||
        booking.snapshotDescription ||
        booking.rateCard?.title ||
        null,
      status: booking.status,
    };
  }

  if (bookingType === "MEDIA") {
    const booking = await db.mediaBooking.findFirst({
      where: {
        id: bookingId,
        clientEmail: user.email,
      },
      select: {
        id: true,
        agencyId: true,
        packageName: true,
        status: true,
        agency: { select: { agencyName: true } },
        listing: { select: { name: true } },
      },
    });
    if (!booking) return null;
    return {
      bookingType: "MEDIA",
      bookingId: booking.id,
      agencyId: booking.agencyId,
      agencyName: booking.agency?.agencyName || null,
      campaignName: booking.packageName || booking.listing?.name || null,
      status: booking.status,
    };
  }

  return null;
}

export async function getClientMediaCampaignAssets() {
  try {
    const auth = await requireClientUser();
    if (auth.error) {
      return { success: false, error: auth.error, assets: [] };
    }

    const assets = await db.mediaCampaignAsset.findMany({
      where: { clientId: auth.user.id },
      include: {
        agency: {
          select: { id: true, agencyName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, assets };
  } catch (error) {
    console.error("Error fetching client media assets:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch assets",
      assets: [],
    };
  }
}

export async function createClientMediaCampaignAsset(payload = {}) {
  try {
    const auth = await requireClientUser();
    if (auth.error) {
      return { success: false, error: auth.error };
    }

    const bookingType = String(payload.bookingType || "").trim();
    const bookingId = String(payload.bookingId || "").trim();
    const assetType = String(payload.assetType || "").trim();
    const fileUrl = String(payload.fileUrl || "").trim();
    const fileName = String(payload.fileName || "").trim();
    const fileType = String(payload.fileType || "application/octet-stream").trim();
    const fileSize =
      payload.fileSize != null && Number.isFinite(Number(payload.fileSize))
        ? Number(payload.fileSize)
        : null;
    const fileKey = payload.fileKey ? String(payload.fileKey).trim() : null;
    const title = payload.title ? String(payload.title).trim() : null;
    const notes = payload.notes ? String(payload.notes).trim() : null;

    if (!bookingType || !bookingId) {
      return { success: false, error: "Select a booking for this creative" };
    }
    if (!VALID_ASSET_TYPES.has(assetType)) {
      return { success: false, error: "Choose a valid asset type" };
    }
    if (!fileUrl || !fileName) {
      return { success: false, error: "Upload a creative file first" };
    }

    const booking = await resolveClientBooking({
      user: auth.user,
      bookingType,
      bookingId,
    });
    if (!booking) {
      return { success: false, error: "Booking not found" };
    }
    if (booking.status === "CANCELLED") {
      return { success: false, error: "Cannot upload creatives to a cancelled booking" };
    }

    const asset = await db.mediaCampaignAsset.create({
      data: {
        clientId: auth.user.id,
        agencyId: booking.agencyId,
        bookingType: booking.bookingType,
        bookingId: booking.bookingId,
        campaignName: booking.campaignName,
        title: title || fileName,
        assetType,
        fileUrl,
        fileName,
        fileType,
        fileSize,
        fileKey,
        notes,
        status: "SUBMITTED",
      },
      include: {
        agency: { select: { id: true, agencyName: true } },
      },
    });

    revalidatePath("/client/media");
    revalidatePath("/media-agency/requests");

    return { success: true, asset };
  } catch (error) {
    console.error("Error creating media campaign asset:", error);
    return {
      success: false,
      error: error.message || "Failed to save creative",
    };
  }
}

export async function deleteClientMediaCampaignAsset(assetId) {
  try {
    const auth = await requireClientUser();
    if (auth.error) {
      return { success: false, error: auth.error };
    }

    const existing = await db.mediaCampaignAsset.findFirst({
      where: { id: assetId, clientId: auth.user.id },
      select: { id: true },
    });
    if (!existing) {
      return { success: false, error: "Asset not found" };
    }

    await db.mediaCampaignAsset.delete({ where: { id: assetId } });
    revalidatePath("/client/media");
    revalidatePath("/media-agency/requests");
    return { success: true };
  } catch (error) {
    console.error("Error deleting media campaign asset:", error);
    return {
      success: false,
      error: error.message || "Failed to delete creative",
    };
  }
}

export async function getAgencyMediaCampaignAssetsForBookings(bookingKeys = []) {
  try {
    const authResult = await getAuthUserId();
    if (!authResult?.userId) {
      return { success: false, error: "Unauthorized", assetsByBooking: {} };
    }

    const agency = await db.mediaAgency.findUnique({
      where: { userId: authResult.userId },
      select: { id: true },
    });
    if (!agency) {
      return { success: false, error: "Agency not found", assetsByBooking: {} };
    }

    const keys = Array.isArray(bookingKeys)
      ? bookingKeys
          .map((key) => ({
            bookingType: String(key?.bookingType || "").trim(),
            bookingId: String(key?.bookingId || "").trim(),
          }))
          .filter((key) => key.bookingType && key.bookingId)
      : [];

    if (keys.length === 0) {
      const assets = await db.mediaCampaignAsset.findMany({
        where: { agencyId: agency.id },
        orderBy: { createdAt: "desc" },
      });
      const assetsByBooking = {};
      for (const asset of assets) {
        const key = `${asset.bookingType}:${asset.bookingId}`;
        if (!assetsByBooking[key]) assetsByBooking[key] = [];
        assetsByBooking[key].push(asset);
      }
      return { success: true, assets, assetsByBooking };
    }

    const assets = await db.mediaCampaignAsset.findMany({
      where: {
        agencyId: agency.id,
        OR: keys.map((key) => ({
          bookingType: key.bookingType,
          bookingId: key.bookingId,
        })),
      },
      orderBy: { createdAt: "desc" },
    });

    const assetsByBooking = {};
    for (const asset of assets) {
      const key = `${asset.bookingType}:${asset.bookingId}`;
      if (!assetsByBooking[key]) assetsByBooking[key] = [];
      assetsByBooking[key].push(asset);
    }

    return { success: true, assets, assetsByBooking };
  } catch (error) {
    console.error("Error fetching agency media assets:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch assets",
      assetsByBooking: {},
    };
  }
}
