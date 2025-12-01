"use server"

import { db } from "@/lib/prisma"
import { checkUser } from "@/lib/checkUser"

/**
 * Submit media agency registration form
 */
export async function submitMediaAgencyForm(data) {
  try {
    const {
      agencyName,
      contactName,
      email,
      phone,
      website,
      address,
      city,
      region,
      country,
      description,
      logoUrl,
      listings, // Array of media listings
    } = data

    // Get current user if authenticated
    let userId = null
    try {
      const user = await checkUser()
      userId = user?.id || null
    } catch (error) {
      // User not authenticated, continue without userId
    }

    // Create media agency
    const agency = await db.mediaAgency.create({
      data: {
        userId,
        agencyName,
        contactName,
        email,
        phone,
        website,
        address,
        city,
        region,
        country: country || "Ghana",
        description,
        logoUrl,
        verificationStatus: "PENDING",
        listings: listings && listings.length > 0 ? {
          create: listings.map(listing => ({
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
            status: "DRAFT",
          }))
        } : undefined,
      },
      include: {
        listings: true,
      },
    })

    return { success: true, agency }
  } catch (error) {
    console.error("Error submitting media agency form:", error)
    return { 
      success: false, 
      error: error.message || "Failed to submit media agency form" 
    }
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
    })

    return { success: true, agency }
  } catch (error) {
    console.error("Error fetching media agency:", error)
    return { 
      success: false, 
      error: error.message || "Failed to fetch media agency" 
    }
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
    })

    return { success: true, agency }
  } catch (error) {
    console.error("Error fetching media agency by user ID:", error)
    return { 
      success: false, 
      error: error.message || "Failed to fetch media agency" 
    }
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
        status: "DRAFT",
      },
    })

    return { success: true, listing }
  } catch (error) {
    console.error("Error adding media listing:", error)
    return { 
      success: false, 
      error: error.message || "Failed to add media listing" 
    }
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
    })

    return { success: true, listing }
  } catch (error) {
    console.error("Error updating media listing:", error)
    return { 
      success: false, 
      error: error.message || "Failed to update media listing" 
    }
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
    })

    return { success: true, booking }
  } catch (error) {
    console.error("Error creating media booking:", error)
    return { 
      success: false, 
      error: error.message || "Failed to create media booking" 
    }
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
    })

    if (!agency) {
      return { success: false, error: "Media agency not found" }
    }

    const totalListings = agency.listings.length
    const activeListings = agency.listings.filter(l => l.status === "ACTIVE").length
    const totalBookings = agency.bookings.length
    const pendingBookings = agency.bookings.filter(b => b.status === "PENDING").length
    const confirmedBookings = agency.bookings.filter(b => b.status === "CONFIRMED").length
    const completedBookings = agency.bookings.filter(b => b.status === "COMPLETED").length
    
    const totalRevenue = agency.bookings
      .filter(b => b.status === "COMPLETED" || b.status === "CONFIRMED")
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0)

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
    }
  } catch (error) {
    console.error("Error fetching media agency stats:", error)
    return { 
      success: false, 
      error: error.message || "Failed to fetch stats" 
    }
  }
}

