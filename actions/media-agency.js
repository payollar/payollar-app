"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

/**
 * Submit media agency registration form
 * If user already has a MediaAgency (e.g. resubmitting for verification), updates it instead of creating.
 */
export async function submitMediaAgencyForm(data) {
  try {
    const {
      contactName,
      email,
      phone,
      city,
      region,
      country,
      listings, // Array of media listings
    } = data;

    // Get current user if authenticated
    let userId = null;
    try {
      const user = await checkUser();
      userId = user?.id || null;
    } catch (error) {
      // User not authenticated, continue without userId
    }

    const agencyData = {
      agencyName: contactName || "Media Agency",
      contactName,
      email,
      phone,
      city,
      region,
      country: country || "Ghana",
      verificationStatus: "PENDING",
    };

    // If user is authenticated, check for existing agency (unique on userId)
    if (userId) {
      const existingAgency = await db.mediaAgency.findUnique({
        where: { userId },
        include: { listings: true },
      });

      if (existingAgency) {
        // Update existing agency instead of creating
        const agency = await db.mediaAgency.update({
          where: { id: existingAgency.id },
          data: agencyData,
          include: { listings: true },
        });

        // Optionally add new listings if provided
        if (listings && listings.length > 0) {
          await db.mediaListing.createMany({
            data: listings.map((listing) => ({
              agencyId: agency.id,
              listingType: listing.listingType,
              name: listing.name,
              network: listing.network,
              location: listing.location,
              frequency: listing.frequency,
              description: listing.description,
              reach: listing.reach,
              demographics: listing.demographics || [],
              imageUrl: listing.imageUrl,
              priceRange: listing.priceRange,
              timeSlots: listing.timeSlots || [],
              status: "ACTIVE",
            })),
          });
          const updated = await db.mediaAgency.findUnique({
            where: { id: agency.id },
            include: { listings: true },
          });
          return { success: true, agency: updated };
        }

        return { success: true, agency };
      }
    }

    // Create new media agency (no existing agency for this user, or unauthenticated)
    const agency = await db.mediaAgency.create({
      data: {
        ...agencyData,
        userId,
        listings: listings && listings.length > 0 ? {
          create: listings.map((listing) => ({
            listingType: listing.listingType,
            name: listing.name,
            network: listing.network,
            location: listing.location,
            frequency: listing.frequency,
            description: listing.description,
            reach: listing.reach,
            demographics: listing.demographics || [],
            imageUrl: listing.imageUrl,
            priceRange: listing.priceRange,
            timeSlots: listing.timeSlots || [],
            status: "ACTIVE",
          })),
        } : undefined,
      },
      include: {
        listings: true,
      },
    });

    return { success: true, agency };
  } catch (error) {
    console.error("Error submitting media agency form:", error);
    return {
      success: false,
      error: error.message || "Failed to submit media agency form",
    };
  }
}

/**
 * Get media agency by ID
 */
export async function getMediaAgency(id) {
  try {
    const agency = await db.mediaAgency.findUnique({
      where: { id },
      include: {
        listings: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        },
        bookings: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    return { success: true, agency };
  } catch (error) {
    console.error("Error fetching media agency:", error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch media agency" 
    };
  }
}

/**
 * Get all published rate cards for public display
 */
export async function getPublishedRateCards(mediaType = null) {
  try {
    const where = {
      isPublished: true,
    };

    if (mediaType) {
      where.listingType = mediaType;
    }

    const rateCards = await db.rateCard.findMany({
      where,
      include: {
        agency: {
          select: {
            id: true,
            agencyName: true,
            verificationStatus: true,
          },
        },
      },
      orderBy: [
        { listingType: "asc" },
        { createdAt: "desc" },
      ],
    });

    return { success: true, rateCards };
  } catch (error) {
    console.error("Error fetching rate cards:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch rate cards",
      rateCards: [],
    };
  }
}

/**
 * Get all active media listings (stations) for public selection
 */
export async function getActiveMediaListings(mediaType = null) {
  try {
    const where = {
      status: "ACTIVE",
    };

    if (mediaType) {
      where.listingType = mediaType;
    }

    const baseInclude = {
      agency: {
        select: {
          id: true,
          agencyName: true,
          verificationStatus: true,
        },
      },
    };
    // Don't include packages/timeClasses to avoid Prisma errors if tables don't exist
    const listings = await db.mediaListing.findMany({
      where,
      include: baseInclude,
      orderBy: [
        { listingType: "asc" },
        { name: "asc" },
      ],
    });
    
    const withPackages = listings.map((l) => ({
      ...l,
      packages: [],
      timeClasses: [],
    }));

    return { success: true, listings: withPackages };
  } catch (error) {
    console.error("Error fetching media listings:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch media listings",
      listings: [],
    };
  }
}

/**
 * Get media agency by user ID
 */
export async function getMediaAgencyByUserId(userId) {
  try {
    const agency = await db.mediaAgency.findUnique({
      where: { userId },
      include: {
        listings: {
          orderBy: { createdAt: "desc" },
        },
        bookings: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return { success: true, agency };
  } catch (error) {
    console.error("Error fetching media agency by user ID:", error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch media agency" 
    };
  }
}

/**
 * Add a new media listing to an existing agency
 */
export async function addMediaListing(agencyId, listingData) {
  try {
    const listing = await db.mediaListing.create({
      data: {
        agencyId,
        listingType: listingData.listingType,
        name: listingData.name,
        network: listingData.network,
        location: listingData.location,
        frequency: listingData.frequency,
        description: listingData.description,
        reach: listingData.reach,
        demographics: listingData.demographics || [],
        imageUrl: listingData.imageUrl,
        priceRange: listingData.priceRange,
        timeSlots: listingData.timeSlots || [],
        status: "ACTIVE",
      },
    });

    return { success: true, listing };
  } catch (error) {
    console.error("Error adding media listing:", error);
    return { 
      success: false, 
      error: error.message || "Failed to add media listing" 
    };
  }
}

/**
 * Update media listing
 */
export async function updateMediaListing(listingId, listingData) {
  try {
    const listing = await db.mediaListing.update({
      where: { id: listingId },
      data: {
        name: listingData.name,
        network: listingData.network,
        location: listingData.location,
        frequency: listingData.frequency,
        description: listingData.description,
        reach: listingData.reach,
        demographics: listingData.demographics || [],
        imageUrl: listingData.imageUrl,
        priceRange: listingData.priceRange,
        timeSlots: listingData.timeSlots || [],
        status: listingData.status,
      },
    });

    return { success: true, listing };
  } catch (error) {
    console.error("Error updating media listing:", error);
    return { 
      success: false, 
      error: error.message || "Failed to update media listing" 
    };
  }
}

/**
 * Get a single media listing by ID (with packages when table exists)
 */
export async function getMediaListingById(id) {
  try {
    const baseInclude = {
      agency: {
        select: {
          id: true,
          agencyName: true,
          verificationStatus: true,
        },
      },
    };
    // Don't include packages/timeClasses to avoid Prisma errors if tables don't exist
    const listing = await db.mediaListing.findUnique({
      where: { id },
      include: baseInclude,
    });
    if (!listing) return { success: false, error: "Listing not found" };
    return {
      success: true,
      listing: {
        ...listing,
        packages: listing.packages ?? [],
        timeClasses: listing.timeClasses ?? [],
      },
    };
  } catch (error) {
    console.error("Error fetching media listing:", error);
    return { success: false, error: error.message || "Failed to fetch listing" };
  }
}

/**
 * Add a package to a media listing
 */
export async function createMediaListingPackage(listingId, data) {
  try {
    const count = await db.mediaListingPackage.count({ where: { listingId } });
    const pkg = await db.mediaListingPackage.create({
      data: {
        listingId,
        name: data.name,
        price: Number(data.price),
        duration: data.duration || null,
        spots: data.spots != null ? Number(data.spots) : null,
        estimatedViewers: data.estimatedViewers || null,
        sortOrder: count,
      },
    });
    return { success: true, package: pkg };
  } catch (error) {
    console.error("Error creating media listing package:", error);
    return { success: false, error: error.message || "Failed to create package" };
  }
}

/**
 * Update a media listing package
 */
export async function updateMediaListingPackage(packageId, data) {
  try {
    const pkg = await db.mediaListingPackage.update({
      where: { id: packageId },
      data: {
        ...(data.name != null && { name: data.name }),
        ...(data.price != null && { price: Number(data.price) }),
        ...(data.duration !== undefined && { duration: data.duration || null }),
        ...(data.spots !== undefined && { spots: data.spots != null ? Number(data.spots) : null }),
        ...(data.estimatedViewers !== undefined && { estimatedViewers: data.estimatedViewers || null }),
        ...(data.sortOrder != null && { sortOrder: Number(data.sortOrder) }),
      },
    });
    return { success: true, package: pkg };
  } catch (error) {
    console.error("Error updating media listing package:", error);
    return { success: false, error: error.message || "Failed to update package" };
  }
}

/**
 * Delete a media listing package
 */
export async function deleteMediaListingPackage(packageId) {
  try {
    await db.mediaListingPackage.delete({ where: { id: packageId } });
    return { success: true };
  } catch (error) {
    console.error("Error deleting media listing package:", error);
    return { success: false, error: error.message || "Failed to delete package" };
  }
}

/**
 * Create a media booking/inquiry
 */
export async function createMediaBooking(bookingData) {
  try {
    const booking = await db.mediaBooking.create({
      data: {
        listingId: bookingData.listingId,
        agencyId: bookingData.agencyId,
        clientName: bookingData.clientName,
        clientEmail: bookingData.clientEmail,
        clientPhone: bookingData.clientPhone,
        packageName: bookingData.packageName,
        packagePrice: bookingData.packagePrice,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        duration: bookingData.duration,
        slots: bookingData.slots,
        totalAmount: bookingData.totalAmount,
        status: "PENDING",
        notes: bookingData.notes,
      },
      include: {
        listing: true,
        agency: true,
      },
    });

    return { success: true, booking };
  } catch (error) {
    console.error("Error creating media booking:", error);
    return { 
      success: false, 
      error: error.message || "Failed to create media booking" 
    };
  }
}

/**
 * Get media agency performance stats
 */
export async function getMediaAgencyStats(agencyId) {
  try {
    const agency = await db.mediaAgency.findUnique({
      where: { id: agencyId },
      include: {
        listings: {
          include: {
            bookings: true,
          },
        },
        bookings: true,
      },
    });

    if (!agency) {
      return { success: false, error: "Media agency not found" };
    }

    const totalListings = agency.listings.length;
    const activeListings = agency.listings.filter(l => l.status === "ACTIVE").length;
    const totalBookings = agency.bookings.length;
    const pendingBookings = agency.bookings.filter(b => b.status === "PENDING").length;
    const confirmedBookings = agency.bookings.filter(b => b.status === "CONFIRMED").length;
    const completedBookings = agency.bookings.filter(b => b.status === "COMPLETED").length;
    
    const totalRevenue = agency.bookings
      .filter(b => b.status === "COMPLETED" || b.status === "CONFIRMED")
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return {
      success: true,
      stats: {
        totalListings,
        activeListings,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        totalRevenue,
      },
    };
  } catch (error) {
    console.error("Error fetching media agency stats:", error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch stats" 
    };
  }
}

