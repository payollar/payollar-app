"use server";

import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";
import { revalidatePath } from "next/cache";
import { NOTIFICATION_TYPES, notifyUser } from "@/lib/notifications";

const CAMPAIGN_OWNER_ROLES = ["CLIENT", "MEDIA_AGENCY"];

function revalidateCampaignPaths() {
  revalidatePath("/campaigns");
  revalidatePath("/creator/applications");
  revalidatePath("/creator/reports");
  revalidatePath("/client");
  revalidatePath("/client/campaigns");
  revalidatePath("/client/reports");
  revalidatePath("/media-agency");
  revalidatePath("/media-agency/campaigns");
}

/** Users who can create and manage talent campaigns (clients and media agencies). */
async function getCampaignOwner(userId) {
  const owner = await db.user.findFirst({
    where: {
      id: userId,
      role: { in: CAMPAIGN_OWNER_ROLES },
    },
    select: {
      id: true,
      role: true,
      mediaAgency: {
        select: { id: true, agencyName: true, verificationStatus: true },
      },
    },
  });

  if (!owner) return null;

  if (owner.role === "MEDIA_AGENCY" && !owner.mediaAgency) {
    throw new Error("Media agency profile not found. Complete setup in settings first.");
  }

  return owner;
}

/**
 * Create a new campaign
 */
function parseStringList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    /* treat as comma-separated */
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseFaqList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        question: String(item?.question || "").trim(),
        answer: String(item?.answer || "").trim(),
      }))
      .filter((item) => item.question && item.answer);
  } catch {
    return [];
  }
}

function parseOptionalInt(value) {
  if (value == null || value === "") return null;
  const number = Number.parseInt(String(value), 10);
  return Number.isFinite(number) ? number : null;
}

export async function createCampaign(formData) {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const owner = await getCampaignOwner(authResult.userId);

    if (!owner) {
      throw new Error("Only clients and media agencies can create campaigns");
    }

    const title = formData.get("title");
    const brand = formData.get("brand");
    const description = formData.get("description");
    const category = formData.get("category");
    const subcategory = formData.get("subcategory");
    const budgetMin = formData.get("budgetMin");
    const budgetMax = formData.get("budgetMax");
    const followerMin = formData.get("followerMin");
    const followerMax = formData.get("followerMax");
    const location = formData.get("location");
    const country = formData.get("country");
    const deadline = formData.get("deadline");
    const imageUrl = formData.get("imageUrl");
    const targetAudience = formData.get("targetAudience");
    const paymentNote = formData.get("paymentNote");
    const status = formData.get("status") || "DRAFT";

    const requirementsArray = parseStringList(formData.get("requirements"));
    const deliverablesArray = parseStringList(formData.get("deliverables"));
    const objectivesArray = parseStringList(formData.get("objectives"));
    const benefitsArray = parseStringList(formData.get("benefits"));
    const faqsArray = parseFaqList(formData.get("faqs"));
    let metricTargets = null;
    try {
      const rawTargets = formData.get("metricTargets");
      if (rawTargets) {
        const parsed = typeof rawTargets === "string" ? JSON.parse(rawTargets) : rawTargets;
        const num = (v) => {
          if (v === "" || v == null) return null;
          const n = Number(v);
          return Number.isFinite(n) && n >= 0 ? n : null;
        };
        const next = {
          views: num(parsed?.views),
          likes: num(parsed?.likes),
          comments: num(parsed?.comments),
          shares: num(parsed?.shares),
          reach: num(parsed?.reach),
        };
        if (Object.values(next).some((v) => v != null)) metricTargets = next;
      }
    } catch {
      metricTargets = null;
    }

    if (!title || !brand || !description || !category || !subcategory || !country || !location || !deadline) {
      throw new Error("Title, brand, description, category, subcategory, country, location, and deadline are required");
    }

    const minBudget = budgetMin ? parseFloat(budgetMin) : null;
    const maxBudget = budgetMax ? parseFloat(budgetMax) : null;
    if (minBudget != null && maxBudget != null && minBudget > maxBudget) {
      throw new Error("Minimum budget cannot be higher than the maximum");
    }

    const minFollowers = parseOptionalInt(followerMin);
    const maxFollowers = parseOptionalInt(followerMax);
    if (minFollowers != null && maxFollowers != null && minFollowers > maxFollowers) {
      throw new Error("Minimum followers cannot be higher than the maximum");
    }

    const campaign = await db.campaign.create({
      data: {
        clientId: owner.id,
        title: title.trim(),
        brand: brand.trim(),
        description: description.trim(),
        category: category.trim(),
        subcategory: subcategory.trim(),
        budgetMin: minBudget,
        budgetMax: maxBudget,
        followerMin: minFollowers,
        followerMax: maxFollowers,
        location: location.trim(),
        country: country.trim(),
        deadline: new Date(deadline),
        targetAudience: targetAudience?.trim() || null,
        paymentNote: paymentNote?.trim() || null,
        imageUrl: imageUrl || null,
        requirements: requirementsArray,
        deliverables: deliverablesArray,
        objectives: objectivesArray,
        benefits: benefitsArray,
        faqs: faqsArray.length ? faqsArray : null,
        metricTargets,
        status: status,
      },
    });

    revalidateCampaignPaths();
    return { success: true, campaign };
  } catch (error) {
    console.error("Failed to create campaign:", error);
    throw new Error("Failed to create campaign: " + error.message);
  }
}

/**
 * Get all active campaigns (for public listing)
 */
const publicCampaignInclude = {
  client: {
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  },
  applications: {
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      talent: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          specialty: true,
          verificationStatus: true,
        },
      },
    },
  },
  _count: { select: { applications: true } },
};

function withApplicantCount(campaign) {
  if (!campaign) return null;
  return {
    ...campaign,
    applicants: campaign._count?.applications ?? 0,
  };
}

export async function getActiveCampaigns() {
  try {
    const campaigns = await db.campaign.findMany({
      where: {
        status: "ACTIVE",
      },
      include: publicCampaignInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      campaigns: campaigns.map(withApplicantCount),
    };
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    throw new Error("Failed to fetch campaigns: " + error.message);
  }
}

/**
 * Public campaign detail for the dedicated /campaigns/[id] page.
 * Active campaigns only.
 */
export async function getPublicCampaignById(campaignId) {
  if (!campaignId) return null;

  try {
    const campaign = await db.campaign.findFirst({
      where: {
        id: campaignId,
        status: "ACTIVE",
      },
      include: publicCampaignInclude,
    });

    return withApplicantCount(campaign);
  } catch (error) {
    console.error("Failed to fetch campaign:", error);
    return null;
  }
}

const CLIENT_CAMPAIGN_APPLICATION_SELECT = {
  id: true,
  status: true,
  name: true,
  email: true,
  phone: true,
  location: true,
  portfolio: true,
  experience: true,
  rate: true,
  availability: true,
  additionalInfo: true,
  createdAt: true,
  talent: {
    select: {
      id: true,
      name: true,
      imageUrl: true,
      specialty: true,
    },
  },
};

function withApplicationCounts(campaign) {
  const applications = campaign.applications || [];
  return {
    ...campaign,
    applicants: applications.length,
    pendingApplications: applications.filter((app) => app.status === "PENDING").length,
    acceptedApplications: applications.filter((app) => app.status === "ACCEPTED").length,
  };
}

/**
 * Get campaigns created by the current client or media agency user
 */
export async function getClientCampaigns() {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const owner = await getCampaignOwner(authResult.userId);

    if (!owner) {
      throw new Error("Only clients and media agencies can view campaigns");
    }

    const campaigns = await db.campaign.findMany({
      where: {
        clientId: owner.id,
      },
      include: {
        applications: {
          select: CLIENT_CAMPAIGN_APPLICATION_SELECT,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { campaigns: campaigns.map(withApplicationCounts) };
  } catch (error) {
    console.error("Failed to fetch client campaigns:", error);
    throw new Error("Failed to fetch campaigns: " + error.message);
  }
}

/**
 * Single campaign with applications for the owning client or media agency.
 */
export async function getClientCampaignById(campaignId) {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  if (!campaignId) {
    throw new Error("Campaign ID is required");
  }

  try {
    const owner = await getCampaignOwner(authResult.userId);

    if (!owner) {
      throw new Error("Only clients and media agencies can view campaigns");
    }

    const campaign = await db.campaign.findFirst({
      where: {
        id: campaignId,
        clientId: owner.id,
      },
      include: {
        applications: {
          select: CLIENT_CAMPAIGN_APPLICATION_SELECT,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!campaign) {
      return null;
    }

    return withApplicationCounts(campaign);
  } catch (error) {
    console.error("Failed to fetch client campaign:", error);
    throw new Error("Failed to fetch campaign: " + error.message);
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
    const owner = await getCampaignOwner(authResult.userId);

    if (!owner) {
      throw new Error("Only clients and media agencies can update campaigns");
    }

    const campaignId = formData.get("campaignId");
    const status = formData.get("status");

    if (!campaignId || !status) {
      throw new Error("Campaign ID and status are required");
    }

    const campaign = await db.campaign.findUnique({
      where: {
        id: campaignId,
        clientId: owner.id,
      },
    });

    if (!campaign) {
      throw new Error("Campaign not found or unauthorized");
    }

    const updatedCampaign = await db.campaign.update({
      where: {
        id: campaignId,
      },
      data: {
        status: status,
      },
    });

    revalidateCampaignPaths();
    return { success: true, campaign: updatedCampaign };
  } catch (error) {
    console.error("Failed to update campaign status:", error);
    throw new Error("Failed to update campaign: " + error.message);
  }
}

/**
 * Campaign applications submitted by the logged-in creator.
 */
export async function getCreatorCampaignApplications() {
  const authResult = await getAuthUserId();

  if (!authResult?.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const talent = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CREATOR",
      },
      select: { id: true },
    });

    if (!talent) {
      throw new Error("Creator account required");
    }

    const applications = await db.campaignApplication.findMany({
      where: { talentId: talent.id },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            brand: true,
            description: true,
            category: true,
            subcategory: true,
            location: true,
            country: true,
            deadline: true,
            status: true,
            imageUrl: true,
            budgetMin: true,
            budgetMax: true,
            deliverables: true,
          },
        },
        deliveryReport: {
          select: { id: true, status: true, updatedAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { applications };
  } catch (error) {
    console.error("Failed to fetch creator campaign applications:", error);
    throw new Error(
      "Failed to fetch applications: " + (error.message || "Unknown error")
    );
  }
}

/**
 * Prefill payload for campaign applications from the logged-in creator profile.
 * Returns null when the visitor is not a creator.
 */
export async function getCreatorApplicationProfile() {
  const authResult = await getAuthUserId();
  if (!authResult?.userId) return null;

  try {
    const user = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CREATOR",
      },
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
        description: true,
        experience: true,
        portfolioUrls: true,
        mobileMoneyNumber: true,
        verificationStatus: true,
        skills: {
          select: { name: true },
          orderBy: { createdAt: "asc" },
          take: 24,
        },
        services: {
          where: { isActive: true },
          select: { rate: true },
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
        portfolios: {
          select: { url: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        },
      },
    });

    if (!user) return null;

    const portfolioLinks = [
      ...(user.portfolioUrls || []),
      ...(user.portfolios || []).map((item) => item.url),
    ].filter(Boolean);
    const uniquePortfolio = [...new Set(portfolioLinks)];

    const experienceParts = [];
    if (user.specialty?.trim()) {
      experienceParts.push(`Specialty: ${user.specialty.trim()}`);
    }
    if (user.experience != null && Number.isFinite(user.experience)) {
      experienceParts.push(
        `${user.experience} year${user.experience === 1 ? "" : "s"} of experience`
      );
    }
    if (user.description?.trim()) {
      experienceParts.push(user.description.trim());
    }

    const skillNames = (user.skills || [])
      .map((skill) => skill.name?.trim())
      .filter(Boolean);

    const hasBuiltProfile = Boolean(
      user.description?.trim() ||
        user.specialty?.trim() ||
        uniquePortfolio.length > 0 ||
        user.experience != null ||
        skillNames.length > 0
    );

    return {
      ready: hasBuiltProfile,
      verified: user.verificationStatus === "VERIFIED",
      specialty: user.specialty || null,
      profilePath: user.specialty
        ? `/talents/${encodeURIComponent(user.specialty)}/${user.id}`
        : `/creator/profile`,
      defaults: {
        name: user.name?.trim() || "",
        email: user.email?.trim() || "",
        phone: user.mobileMoneyNumber?.trim() || "",
        location: "",
        portfolio: uniquePortfolio.join("\n"),
        experience: experienceParts.join("\n\n"),
        rate:
          user.services?.[0]?.rate != null
            ? String(user.services[0].rate)
            : "",
        availability: "",
        additionalInfo: skillNames.length
          ? `Skills: ${skillNames.join(", ")}`
          : "",
      },
    };
  } catch (error) {
    console.error("Failed to load creator application profile:", error);
    return null;
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
    const campaignId = String(formData.get("campaignId") || "").trim();
    const rateRaw = formData.get("rate");
    const availability = String(formData.get("availability") || "").trim();
    const note = String(
      formData.get("note") || formData.get("additionalInfo") || ""
    ).trim();

    if (!campaignId) {
      throw new Error("Campaign is required");
    }

    const profile = await getCreatorApplicationProfile();
    if (!profile?.ready) {
      throw new Error(
        "Complete your creator profile before applying. Brands receive your saved profile with the application."
      );
    }

    const talent = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CREATOR",
      },
      select: {
        id: true,
        name: true,
        email: true,
        verificationStatus: true,
        mobileMoneyNumber: true,
      },
    });

    if (!talent) {
      throw new Error("Talent not found. Only verified talents can apply to campaigns.");
    }

    if (talent.verificationStatus !== "VERIFIED") {
      throw new Error("You must be verified to apply to campaigns");
    }

    const name = String(profile.defaults?.name || talent.name || "").trim();
    const email = String(profile.defaults?.email || talent.email || "").trim();
    const phone = String(
      profile.defaults?.phone || talent.mobileMoneyNumber || ""
    ).trim();
    const portfolio = String(profile.defaults?.portfolio || "").trim();
    const experience = String(profile.defaults?.experience || "").trim();
    const skillsNote = String(profile.defaults?.additionalInfo || "").trim();

    if (!name || !email || !experience) {
      throw new Error(
        "Your profile is missing name, email, or experience details. Update your creator profile and try again."
      );
    }

    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.status !== "ACTIVE") {
      throw new Error("This campaign is not currently accepting applications");
    }

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

    const parsedRate =
      rateRaw !== null && rateRaw !== undefined && String(rateRaw).trim() !== ""
        ? parseFloat(String(rateRaw))
        : profile.defaults?.rate
          ? parseFloat(String(profile.defaults.rate))
          : null;
    const rate =
      parsedRate != null && Number.isFinite(parsedRate) ? parsedRate : null;

    const additionalInfo = [skillsNote, note ? `Campaign note: ${note}` : null]
      .filter(Boolean)
      .join("\n\n")
      .slice(0, 4000);

    // Snapshot the creator's saved profile for the brand — only fee / availability / note come from the form.
    const application = await db.campaignApplication.create({
      data: {
        campaignId: campaignId,
        talentId: talent.id,
        name,
        email,
        phone: phone || null,
        location: null,
        portfolio: portfolio || null,
        experience,
        rate,
        availability: availability || null,
        additionalInfo: additionalInfo || null,
        status: "PENDING",
      },
    });

    const owner = await db.user.findUnique({
      where: { id: campaign.clientId },
      select: { id: true, role: true },
    });
    const applicationsHref =
      owner?.role === "MEDIA_AGENCY"
        ? `/media-agency/campaigns/${campaignId}/applications`
        : `/client/campaigns/${campaignId}/applications`;
    await notifyUser({
      userId: campaign.clientId,
      actorId: talent.id,
      type: NOTIFICATION_TYPES.CAMPAIGN_APPLICATION,
      title: "New campaign application",
      body: `${name} applied to “${campaign.title || "your campaign"}”.`,
      href: applicationsHref,
      meta: { campaignId, applicationId: application.id },
    });

    revalidatePath("/campaigns");
    revalidatePath(`/campaigns/${campaignId}`);
    revalidatePath("/creator/applications");
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
    const owner = await getCampaignOwner(authResult.userId);

    if (!owner) {
      throw new Error("Only clients and media agencies can update applications");
    }

    const applicationId = formData.get("applicationId");
    const status = formData.get("status");

    if (!applicationId || !status) {
      throw new Error("Application ID and status are required");
    }

    if (!["PENDING", "ACCEPTED", "REJECTED", "REDRAWN"].includes(status)) {
      throw new Error("Invalid application status");
    }

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

    if (!application || application.campaign.clientId !== owner.id) {
      throw new Error("Application not found or unauthorized");
    }

    const updatedApplication = await db.campaignApplication.update({
      where: {
        id: applicationId,
      },
      data: {
        status: status,
      },
    });

    if (["ACCEPTED", "REJECTED", "REDRAWN"].includes(status)) {
      const statusLabel =
        status === "ACCEPTED"
          ? "accepted"
          : status === "REJECTED"
            ? "declined"
            : "released";
      await notifyUser({
        userId: application.talentId,
        actorId: owner.id,
        type: NOTIFICATION_TYPES.APPLICATION_STATUS,
        title: `Application ${statusLabel}`,
        body: `Your application was ${statusLabel}.`,
        href: "/creator/applications",
        meta: {
          applicationId,
          campaignId: application.campaignId,
          status,
        },
      });
    }

    revalidateCampaignPaths();
    revalidatePath(`/client/campaigns/${application.campaignId}/applications`);
    revalidatePath(`/media-agency/campaigns/${application.campaignId}/applications`);
    return { success: true, application: updatedApplication };
  } catch (error) {
    console.error("Failed to update application status:", error);
    throw new Error("Failed to update application: " + error.message);
  }
}

/**
 * Release an accepted hire when the parties do not reach agreement,
 * so the brand can pick another applicant.
 */
export async function redrawCampaignApplication(applicationId, note = "") {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const owner = await getCampaignOwner(authResult.userId);

    if (!owner) {
      throw new Error("Only clients and media agencies can redraw applications");
    }

    if (!applicationId) {
      throw new Error("Application ID is required");
    }

    const application = await db.campaignApplication.findUnique({
      where: { id: applicationId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            clientId: true,
          },
        },
        talent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!application || application.campaign.clientId !== owner.id) {
      throw new Error("Application not found or unauthorized");
    }

    if (application.status !== "ACCEPTED") {
      throw new Error("Only accepted applications can be redrawn");
    }

    const updatedApplication = await db.campaignApplication.update({
      where: { id: applicationId },
      data: { status: "REDRAWN" },
    });

    const reason = String(note || "").trim().slice(0, 500);
    const openBooking = await db.appointment.findFirst({
      where: {
        clientId: owner.id,
        creatorId: application.talentId,
        status: { in: ["REQUESTED", "SCHEDULED"] },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        conversation: { select: { id: true } },
      },
    });

    if (openBooking?.conversation?.id) {
      const body = [
        `We've redrawn the hire for “${application.campaign.title}” because we couldn't reach an agreement.`,
        reason ? `Note: ${reason}` : null,
        "You're welcome to stay in touch on Payollar for other opportunities.",
      ]
        .filter(Boolean)
        .join("\n\n")
        .slice(0, 2000);

      await db.bookingMessage.create({
        data: {
          conversationId: openBooking.conversation.id,
          senderId: owner.id,
          body,
          kind: "TEXT",
        },
      });
      await db.bookingConversation.update({
        where: { id: openBooking.conversation.id },
        data: { updatedAt: new Date() },
      });
      revalidatePath("/messages");
      revalidatePath(`/messages/${openBooking.id}`);
    }

    await notifyUser({
      userId: application.talentId,
      actorId: owner.id,
      type: NOTIFICATION_TYPES.APPLICATION_STATUS,
      title: "Hire redrawn",
      body: reason
        ? `Your hire for “${application.campaign.title}” was released. ${reason}`
        : `Your hire for “${application.campaign.title}” was released.`,
      href: "/creator/applications",
      meta: {
        applicationId,
        campaignId: application.campaignId,
        status: "REDRAWN",
      },
    });

    revalidateCampaignPaths();
    revalidatePath(`/client/campaigns/${application.campaignId}/applications`);
    revalidatePath(`/media-agency/campaigns/${application.campaignId}/applications`);
    revalidatePath("/creator/applications");

    return { success: true, application: updatedApplication };
  } catch (error) {
    console.error("Failed to redraw application:", error);
    throw new Error("Failed to redraw application: " + (error.message || "Unknown error"));
  }
}

