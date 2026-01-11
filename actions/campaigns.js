"use server";

import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";
import { revalidatePath } from "next/cache";

/**
 * Create a new campaign
 */
export async function createCampaign(formData) {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const client = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CLIENT",
      },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    // Get form data
    const title = formData.get("title");
    const brand = formData.get("brand");
    const description = formData.get("description");
    const category = formData.get("category");
    const budgetMin = formData.get("budgetMin");
    const budgetMax = formData.get("budgetMax");
    const location = formData.get("location");
    const deadline = formData.get("deadline");
    const imageUrl = formData.get("imageUrl");
    const requirements = formData.get("requirements"); // JSON string or comma-separated
    const status = formData.get("status") || "DRAFT";

    // Validate required fields
    if (!title || !brand || !description || !category || !location || !deadline) {
      throw new Error("Title, brand, description, category, location, and deadline are required");
    }

    // Parse requirements
    let requirementsArray = [];
    if (requirements) {
      try {
        requirementsArray = JSON.parse(requirements);
      } catch {
        // If not JSON, treat as comma-separated string
        requirementsArray = requirements.split(",").map((r) => r.trim()).filter(Boolean);
      }
    }

    // Create campaign
    const campaign = await db.campaign.create({
      data: {
        clientId: client.id,
        title: title.trim(),
        brand: brand.trim(),
        description: description.trim(),
        category: category.trim(),
        budgetMin: budgetMin ? parseFloat(budgetMin) : null,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        location: location.trim(),
        deadline: new Date(deadline),
        imageUrl: imageUrl || null,
        requirements: requirementsArray,
        status: status,
      },
    });

    revalidatePath("/campaigns");
    revalidatePath("/client");
    return { success: true, campaign };
  } catch (error) {
    console.error("Failed to create campaign:", error);
    throw new Error("Failed to create campaign: " + error.message);
  }
}

/**
 * Get all active campaigns (for public listing)
 */
export async function getActiveCampaigns() {
  try {
    const campaigns = await db.campaign.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        applications: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add applicant count to each campaign
    const campaignsWithCounts = campaigns.map((campaign) => ({
      ...campaign,
      applicants: campaign.applications.length,
    }));

    return { campaigns: campaignsWithCounts };
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    throw new Error("Failed to fetch campaigns: " + error.message);
  }
}

/**
 * Get campaigns created by the current client
 */
export async function getClientCampaigns() {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const client = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CLIENT",
      },
      select: {
        id: true,
      },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    const campaigns = await db.campaign.findMany({
      where: {
        clientId: client.id,
      },
      include: {
        applications: {
          select: {
            id: true,
            status: true,
            talent: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                specialty: true,
              },
            },
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add applicant counts
    const campaignsWithCounts = campaigns.map((campaign) => ({
      ...campaign,
      applicants: campaign.applications.length,
      pendingApplications: campaign.applications.filter((app) => app.status === "PENDING").length,
    }));

    return { campaigns: campaignsWithCounts };
  } catch (error) {
    console.error("Failed to fetch client campaigns:", error);
    throw new Error("Failed to fetch campaigns: " + error.message);
  }
}

/**
 * Update campaign status
 */
export async function updateCampaignStatus(formData) {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const client = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CLIENT",
      },
      select: {
        id: true,
      },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    const campaignId = formData.get("campaignId");
    const status = formData.get("status");

    if (!campaignId || !status) {
      throw new Error("Campaign ID and status are required");
    }

    // Verify the campaign belongs to this client
    const campaign = await db.campaign.findUnique({
      where: {
        id: campaignId,
        clientId: client.id,
      },
    });

    if (!campaign) {
      throw new Error("Campaign not found or unauthorized");
    }

    // Update campaign status
    const updatedCampaign = await db.campaign.update({
      where: {
        id: campaignId,
      },
      data: {
        status: status,
      },
    });

    revalidatePath("/campaigns");
    revalidatePath("/client");
    return { success: true, campaign: updatedCampaign };
  } catch (error) {
    console.error("Failed to update campaign status:", error);
    throw new Error("Failed to update campaign: " + error.message);
  }
}

/**
 * Apply to a campaign (for talents)
 */
export async function applyToCampaign(formData) {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const talent = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CREATOR",
      },
    });

    if (!talent) {
      throw new Error("Talent not found. Only verified talents can apply to campaigns.");
    }

    if (talent.verificationStatus !== "VERIFIED") {
      throw new Error("You must be verified to apply to campaigns");
    }

    const campaignId = formData.get("campaignId");
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const location = formData.get("location");
    const portfolio = formData.get("portfolio");
    const experience = formData.get("experience");
    const rate = formData.get("rate");
    const availability = formData.get("availability");
    const additionalInfo = formData.get("additionalInfo");

    // Validate required fields
    if (!campaignId || !name || !email || !experience) {
      throw new Error("Campaign ID, name, email, and experience are required");
    }

    // Check if campaign exists and is active
    const campaign = await db.campaign.findUnique({
      where: {
        id: campaignId,
      },
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.status !== "ACTIVE") {
      throw new Error("This campaign is not currently accepting applications");
    }

    // Check if already applied
    const existingApplication = await db.campaignApplication.findUnique({
      where: {
        campaignId_talentId: {
          campaignId: campaignId,
          talentId: talent.id,
        },
      },
    });

    if (existingApplication) {
      throw new Error("You have already applied to this campaign");
    }

    // Create application
    const application = await db.campaignApplication.create({
      data: {
        campaignId: campaignId,
        talentId: talent.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        location: location?.trim() || null,
        portfolio: portfolio?.trim() || null,
        experience: experience.trim(),
        rate: rate ? parseFloat(rate) : null,
        availability: availability?.trim() || null,
        additionalInfo: additionalInfo?.trim() || null,
        status: "PENDING",
      },
    });

    revalidatePath("/campaigns");
    return { success: true, application };
  } catch (error) {
    console.error("Failed to apply to campaign:", error);
    throw new Error("Failed to submit application: " + error.message);
  }
}

/**
 * Update application status (for clients to accept/reject)
 */
export async function updateApplicationStatus(formData) {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const client = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CLIENT",
      },
      select: {
        id: true,
      },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    const applicationId = formData.get("applicationId");
    const status = formData.get("status");

    if (!applicationId || !status) {
      throw new Error("Application ID and status are required");
    }

    // Verify the application belongs to a campaign owned by this client
    const application = await db.campaignApplication.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        campaign: {
          select: {
            clientId: true,
          },
        },
      },
    });

    if (!application || application.campaign.clientId !== client.id) {
      throw new Error("Application not found or unauthorized");
    }

    // Update application status
    const updatedApplication = await db.campaignApplication.update({
      where: {
        id: applicationId,
      },
      data: {
        status: status,
      },
    });

    revalidatePath("/client");
    return { success: true, application: updatedApplication };
  } catch (error) {
    console.error("Failed to update application status:", error);
    throw new Error("Failed to update application: " + error.message);
  }
}

