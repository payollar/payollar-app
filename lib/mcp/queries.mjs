import { clip, iso, money, normalizeMediaType, wordsForSeconds } from "./format.mjs";

const LISTING_STATUSES = ["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"];

function isAdmin(access) {
  return access?.role === "ADMIN";
}

function isAgency(access) {
  return access?.role === "MEDIA_AGENCY" && Boolean(access.agencyId);
}

function listingWhere(args) {
  const { query, location, mediaType, status, includeDrafts, access } = args;
  const where = {};
  const types = (Array.isArray(args.mediaTypes) ? args.mediaTypes : [])
    .map(normalizeMediaType)
    .filter(Boolean);
  const type = normalizeMediaType(mediaType);
  if (types.length) where.listingType = { in: types };
  else if (type) where.listingType = type;

  const staff = isAdmin(access) || isAgency(access);
  if (!staff) {
    where.status = "ACTIVE";
  } else if (status && LISTING_STATUSES.includes(status)) {
    where.status = status;
  } else if (!includeDrafts && !isAdmin(access)) {
    where.status = "ACTIVE";
  } else if (!includeDrafts) {
    where.status = "ACTIVE";
  } else {
    where.status = { in: ["ACTIVE", "DRAFT"] };
  }

  if (isAgency(access)) {
    where.AND = [
      ...(where.AND || []),
      { OR: [{ agencyId: access.agencyId }, { status: "ACTIVE" }] },
    ];
  }

  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { network: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { location: { contains: query, mode: "insensitive" } },
    ];
  }

  return where;
}

function shapeAgency(agency) {
  if (!agency) return null;
  return {
    id: agency.id,
    name: agency.agencyName,
    city: agency.city,
    region: agency.region,
    country: agency.country,
    website: agency.website,
    logoUrl: agency.logoUrl,
    verificationStatus: agency.verificationStatus,
    description: clip(agency.description, 280),
  };
}

function shapeListing(listing, { withRates = false } = {}) {
  const base = {
    id: listing.id,
    name: listing.name,
    network: listing.network,
    type: listing.listingType,
    status: listing.status,
    location: listing.location,
    frequency: listing.frequency,
    reach: listing.reach,
    demographics: listing.demographics,
    priceRange: listing.priceRange,
    timeSlots: listing.timeSlots,
    imageUrl: listing.imageUrl,
    description: clip(listing.description, withRates ? 500 : 220),
    agency: shapeAgency(listing.agency),
    packageCount: listing.packages?.length ?? listing._count?.packages ?? 0,
    timeClassCount: listing.timeClasses?.length ?? listing._count?.timeClasses ?? 0,
  };

  if (!withRates) return base;

  return {
    ...base,
    packages: (listing.packages || []).map((item) => ({
      id: item.id,
      name: item.name,
      priceGhs: money(item.price),
      duration: item.duration,
      spots: item.spots,
      estimatedViewers: item.estimatedViewers,
    })),
    timeClasses: (listing.timeClasses || []).map((item) => ({
      id: item.id,
      label: item.label,
      timeRange: item.timeRange,
      ratePer30SecGhs: money(item.ratePer30Sec),
    })),
  };
}

function shapeRateCardSummary(card) {
  return {
    id: card.id,
    title: card.title,
    description: clip(card.description, 240),
    isPublished: card.isPublished,
    listingType: card.listingType,
    location: card.location,
    reach: card.reach,
    demographics: card.demographics,
    imageUrl: card.imageUrl,
    updatedAt: iso(card.lastUpdated || card.updatedAt),
    agency: shapeAgency(card.agency),
    sectionCount: card.sections?.length ?? card._count?.sections ?? 0,
  };
}

function shapeRateCard(card) {
  return {
    ...shapeRateCardSummary(card),
    sections: (card.sections || []).map((section) => ({
      title: section.title,
      tables: (section.tables || []).map((table) => {
        const columns = [...(table.columns || [])].sort(
          (a, b) => a.displayOrder - b.displayOrder
        );
        return {
          title: table.title,
          columns: columns.map((column) => ({
            name: column.name,
            type: column.dataType,
            visible: column.isVisibleOnFrontend,
          })),
          rows: (table.rows || []).slice(0, 40).map((row) => {
            const values = {};
            for (const cell of row.cells || []) {
              const name = cell.column?.name || "value";
              values[name] = cell.value;
            }
            return { bookable: row.isBookable, values };
          }),
        };
      }),
    })),
  };
}

const listingInclude = {
  agency: true,
  packages: { orderBy: { sortOrder: "asc" } },
  timeClasses: { orderBy: { sortOrder: "asc" } },
};

export async function listMediaInventory(db, args) {
  const limit = Math.min(args.limit ?? 12, 25);
  const listings = await db.mediaListing.findMany({
    where: listingWhere(args),
    include: {
      agency: true,
      _count: { select: { packages: true, timeClasses: true } },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: limit,
  });

  return {
    count: listings.length,
    listings: listings.map((listing) => shapeListing(listing)),
  };
}

export async function getListing(db, id, access) {
  const listing = await db.mediaListing.findUnique({
    where: { id },
    include: listingInclude,
  });
  if (!listing) return { found: false };
  const owns = isAgency(access) && listing.agencyId === access.agencyId;
  if (!isAdmin(access) && !owns && listing.status !== "ACTIVE") return { found: false };
  return { found: true, listing: shapeListing(listing, { withRates: true }) };
}

export async function listRateCards(db, args) {
  const limit = Math.min(args.limit ?? 12, 25);
  const where = {};
  const staff = isAdmin(args.access) || isAgency(args.access);
  if (!staff || args.publishedOnly) where.isPublished = true;
  if (isAgency(args.access) && !args.publishedOnly) {
    delete where.isPublished;
    where.OR = [{ isPublished: true }, { agencyId: args.access.agencyId }];
  }
  const type = normalizeMediaType(args.mediaType);
  if (type) where.listingType = type;
  if (args.location) where.location = { contains: args.location, mode: "insensitive" };
  if (args.query) {
    const text = [
      { title: { contains: args.query, mode: "insensitive" } },
      { description: { contains: args.query, mode: "insensitive" } },
      { location: { contains: args.query, mode: "insensitive" } },
    ];
    where.AND = [...(where.AND || []), { OR: text }];
  }

  const cards = await db.rateCard.findMany({
    where,
    include: {
      agency: true,
      _count: { select: { sections: true } },
    },
    orderBy: { lastUpdated: "desc" },
    take: limit,
  });

  return { count: cards.length, rateCards: cards.map(shapeRateCardSummary) };
}

export async function getRateCard(db, id, access) {
  const card = await db.rateCard.findUnique({
    where: { id },
    include: {
      agency: true,
      sections: {
        orderBy: { sortOrder: "asc" },
        include: {
          tables: {
            orderBy: { sortOrder: "asc" },
            include: {
              columns: { orderBy: { displayOrder: "asc" } },
              rows: {
                orderBy: { sortOrder: "asc" },
                include: { cells: { include: { column: true } } },
              },
            },
          },
        },
      },
    },
  });
  if (!card) return { found: false };
  const owns = isAgency(access) && card.agencyId === access.agencyId;
  if (!card.isPublished && !isAdmin(access) && !owns) return { found: false };
  return { found: true, rateCard: shapeRateCard(card) };
}

function spotCost(ratePer30Sec, durationSeconds, spots) {
  return money((Number(ratePer30Sec) * durationSeconds * spots) / 30);
}

function parseAmount(value) {
  if (value == null || value === "") return null;
  const cleaned = String(value).replace(/[,₵]|GHS/gi, "").trim();
  const match = cleaned.match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const number = Number(match[0]);
  return Number.isFinite(number) && number > 0 ? money(number) : null;
}

function priceColumnDuration(name) {
  const match = String(name).match(/(\d+)\s*(?:s|sec)/i);
  return match ? Number(match[1]) : null;
}

function isPriceColumn(name) {
  return /rate|price|₵|ghs|cedi|sec/i.test(String(name));
}

function rateCardOptions(cards, { budget, durationSeconds, spots }) {
  const options = [];
  for (const card of cards) {
    for (const section of card.sections || []) {
      for (const table of section.tables || []) {
        const columns = table.columns || [];
        for (const row of (table.rows || []).slice(0, 40)) {
          const values = {};
          for (const cell of row.cells || []) {
            const name = cell.column?.name;
            if (name) values[name] = cell.value;
          }
          const prices = columns
            .filter((column) => isPriceColumn(column.name))
            .map((column) => ({
              name: column.name,
              amount: parseAmount(values[column.name]),
              duration: priceColumnDuration(column.name),
            }))
            .filter((price) => price.amount != null);
          if (!prices.length) continue;

          const exact = prices.find((price) => price.duration === durationSeconds);
          const per30 = prices.find((price) => price.duration === 30) || prices.find((price) => /30/.test(price.name));
          const chosen = exact || per30 || prices[0];
          const unit = exact
            ? chosen.amount
            : per30
              ? money((per30.amount * durationSeconds) / 30)
              : chosen.amount;
          const estimated = money(unit * spots);
          const labelParts = Object.entries(values)
            .filter(([name, value]) => value && !isPriceColumn(name))
            .map(([, value]) => value)
            .slice(0, 3);

          options.push({
            kind: "rate_card",
            rateCardId: card.id,
            rateCard: card.title,
            isPublished: card.isPublished,
            station: card.agency?.agencyName || card.title,
            type: card.listingType,
            location: card.location,
            section: section.title,
            table: table.title,
            name: labelParts.join(" · ") || section.title,
            durationSeconds,
            spots,
            unitRateGhs: unit,
            rateColumn: chosen.name,
            estimatedCostGhs: estimated,
            fitsBudget: budget == null || estimated <= budget,
          });
        }
      }
    }
  }
  return options;
}

export async function quoteMediaMix(db, args) {
  const budget = money(args.budgetGhs);
  const spots = args.spots ?? 8;
  const durationSeconds = args.durationSeconds ?? 30;
  const listings = await db.mediaListing.findMany({
    where: listingWhere({ ...args, includeDrafts: args.includeDrafts ?? false }),
    include: listingInclude,
    orderBy: { name: "asc" },
    take: 40,
  });

  const cardWhere = {};
  const cardFilters = [];
  const staff = isAdmin(args.access) || isAgency(args.access);
  if (!staff || args.publishedOnly) cardWhere.isPublished = true;
  if (isAgency(args.access) && !args.publishedOnly) {
    delete cardWhere.isPublished;
    cardFilters.push({ OR: [{ isPublished: true }, { agencyId: args.access.agencyId }] });
  }
  const requestedTypes = (Array.isArray(args.mediaTypes) ? args.mediaTypes : [])
    .map(normalizeMediaType)
    .filter(Boolean);
  const type = normalizeMediaType(args.mediaType);
  if (requestedTypes.length) cardWhere.listingType = { in: requestedTypes };
  else if (type) cardWhere.listingType = type;
  if (args.location) {
    cardFilters.push({
      location: { contains: args.location, mode: "insensitive" },
    });
  }
  if (args.query) {
    cardFilters.push({
      OR: [
        { title: { contains: args.query, mode: "insensitive" } },
        { agency: { agencyName: { contains: args.query, mode: "insensitive" } } },
      ],
    });
  }
  if (cardFilters.length) cardWhere.AND = cardFilters;
  const cards = await db.rateCard.findMany({
    where: cardWhere,
    include: {
      agency: true,
      sections: {
        orderBy: { sortOrder: "asc" },
        include: {
          tables: {
            orderBy: { sortOrder: "asc" },
            include: {
              columns: true,
              rows: {
                where: { isBookable: true },
                orderBy: { sortOrder: "asc" },
                include: { cells: { include: { column: true } } },
              },
            },
          },
        },
      },
    },
    take: 12,
  });

  const options = [];
  for (const listing of listings) {
    for (const pack of listing.packages || []) {
      const price = money(pack.price);
      options.push({
        kind: "package",
        listingId: listing.id,
        station: listing.name,
        type: listing.listingType,
        location: listing.location,
        reach: listing.reach,
        demographics: listing.demographics,
        name: pack.name,
        priceGhs: price,
        duration: pack.duration,
        spots: pack.spots,
        estimatedViewers: pack.estimatedViewers,
        fitsBudget: budget == null || price <= budget,
      });
    }
    for (const timeClass of listing.timeClasses || []) {
      const cost = spotCost(timeClass.ratePer30Sec, durationSeconds, spots);
      options.push({
        kind: "time_class",
        listingId: listing.id,
        station: listing.name,
        type: listing.listingType,
        location: listing.location,
        reach: listing.reach,
        demographics: listing.demographics,
        name: timeClass.label,
        timeRange: timeClass.timeRange,
        ratePer30SecGhs: money(timeClass.ratePer30Sec),
        durationSeconds,
        spots,
        estimatedCostGhs: cost,
        fitsBudget: budget == null || cost <= budget,
      });
    }
  }

  options.push(...rateCardOptions(cards, { budget, durationSeconds, spots }));

  options.sort((a, b) => {
    if (a.fitsBudget !== b.fitsBudget) return a.fitsBudget ? -1 : 1;
    const aPrice = a.priceGhs ?? a.estimatedCostGhs ?? 0;
    const bPrice = b.priceGhs ?? b.estimatedCostGhs ?? 0;
    if (budget == null) return aPrice - bPrice;
    return Math.abs(budget - aPrice) - Math.abs(budget - bPrice);
  });

  const picked = [];
  const seenSources = new Set();
  for (const option of options) {
    const source = option.rateCardId || option.listingId || option.station;
    if (seenSources.has(source)) continue;
    seenSources.add(source);
    picked.push(option);
  }
  for (const option of options) {
    if (picked.length >= 15) break;
    if (!picked.includes(option)) picked.push(option);
  }

  return {
    budgetGhs: budget,
    spots,
    durationSeconds,
    currency: "GHS",
    optionCount: options.length,
    options: picked.slice(0, 15),
    note: "Package prices are the listed bundle price. Time-class and rate-card costs are the unit rate for the requested duration times the spot count. Rate-card unit rates scale from a 30-second column when that duration is not listed. Prices are Ghana cedis.",
  };
}

export async function buildCreativeBrief(db, args) {
  const durationSeconds = args.durationSeconds ?? 30;
  const inventory = await quoteMediaMix(db, {
    ...args,
    budgetGhs: args.budgetGhs,
    spots: args.spots ?? 1,
    durationSeconds,
    includeDrafts: false,
  });

  return {
    brief: {
      brand: args.brand,
      goal: args.goal,
      offer: args.offer || null,
      audience: args.audience || null,
      location: args.location || null,
      tone: args.tone || "clear, local, and specific",
      language: args.language || "English",
      budgetGhs: args.budgetGhs ?? null,
      mediaTypes: args.mediaTypes || null,
    },
    scriptTargets: {
      durationSeconds,
      radioWords: wordsForSeconds(durationSeconds, 2.5),
      tvVoiceoverWords: wordsForSeconds(durationSeconds, 2),
      billboardMaxWords: 8,
      formats: {
        tv: ["TVC", "live programme mention", "sponsorship", "jingle"],
        radio: ["produced spot", "live read", "jingle", "sponsorship"],
        billboard: ["one line plus a short location line"],
        digital: ["primary text, headline, and a call to action"],
      },
    },
    inventory: inventory.options,
    instructions:
      "Write the creative from this brief. Use only the stations, packages, and prices in inventory. Fit each script to scriptTargets. Say which buy the creative is for. If inventory is empty, write the creative and say rates still need to be checked in Payollar.",
  };
}

export async function listCampaigns(db, args) {
  const limit = Math.min(args.limit ?? 10, 20);
  const where = {};
  if (args.access?.role === "CLIENT" || args.access?.role === "CREATOR") {
    if (args.access.role === "CLIENT") where.clientId = args.access.userId;
    else where.status = args.status || "ACTIVE";
  } else if (args.status) where.status = args.status;
  if (args.location) where.location = { contains: args.location, mode: "insensitive" };
  if (args.query) {
    where.OR = [
      { title: { contains: args.query, mode: "insensitive" } },
      { brand: { contains: args.query, mode: "insensitive" } },
      { category: { contains: args.query, mode: "insensitive" } },
      { description: { contains: args.query, mode: "insensitive" } },
    ];
  }

  const campaigns = await db.campaign.findMany({
    where,
    include: {
      _count: { select: { applications: true } },
      applications: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return {
    count: campaigns.length,
    campaigns: campaigns.map((campaign) => {
      const counts = { PENDING: 0, ACCEPTED: 0, REJECTED: 0 };
      for (const application of campaign.applications) {
        counts[application.status] = (counts[application.status] || 0) + 1;
      }
      return {
        id: campaign.id,
        title: campaign.title,
        brand: campaign.brand,
        category: campaign.category,
        status: campaign.status,
        location: campaign.location,
        budgetMin: money(campaign.budgetMin),
        budgetMax: money(campaign.budgetMax),
        deadline: iso(campaign.deadline),
        requirements: campaign.requirements,
        description: clip(campaign.description, 400),
        imageUrl: campaign.imageUrl,
        applications: counts,
      };
    }),
  };
}

export async function airtimeRecap(db, args) {
  const limit = Math.min(args.limit ?? 15, 30);
  if (args.access && !isAdmin(args.access) && !isAgency(args.access)) {
    return { certificates: [], reports: [] };
  }
  const certificateWhere = {};
  const reportWhere = {};
  if (isAgency(args.access)) {
    certificateWhere.agencyId = args.access.agencyId;
    reportWhere.agencyId = args.access.agencyId;
  }
  if (args.campaignRef) certificateWhere.campaignRefId = { contains: args.campaignRef, mode: "insensitive" };
  if (args.station) certificateWhere.stationName = { contains: args.station, mode: "insensitive" };
  if (args.query) reportWhere.title = { contains: args.query, mode: "insensitive" };

  const [certificates, reports] = await Promise.all([
    db.transmissionCertificate.findMany({
      where: certificateWhere,
      orderBy: { airDate: "desc" },
      take: limit,
      select: {
        id: true,
        campaignRefId: true,
        fileName: true,
        fileUrl: true,
        airDate: true,
        airTime: true,
        stationName: true,
        notes: true,
      },
    }),
    db.mediaAgencyReport.findMany({
      where: reportWhere,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        reportType: true,
        content: true,
        metrics: true,
        startDate: true,
        endDate: true,
      },
    }),
  ]);

  return {
    certificates: certificates.map((item) => ({
      id: item.id,
      campaignRef: item.campaignRefId,
      station: item.stationName,
      airDate: iso(item.airDate),
      airTime: item.airTime,
      fileName: item.fileName,
      fileUrl: item.fileUrl,
      notes: clip(item.notes, 240),
    })),
    reports: reports.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.reportType,
      startDate: iso(item.startDate),
      endDate: iso(item.endDate),
      content: clip(item.content, 500),
      metrics: item.metrics,
    })),
  };
}

export async function opsBrief(db, access) {
  const now = new Date();
  const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const agencyId = isAgency(access) ? access.agencyId : null;
  const bookingWhere = (status) => ({ status, ...(agencyId ? { agencyId } : {}) });
  const listingWhereCount = (status) => ({ status, ...(agencyId ? { agencyId } : {}) });
  const cardWhere = (published) => ({ isPublished: published, ...(agencyId ? { agencyId } : {}) });
  const campaignClient = !isAdmin(access) && access?.userId ? { clientId: access.userId } : {};

  const [
    pendingBookings,
    confirmedBookings,
    activeListings,
    draftListings,
    publishedRateCards,
    unpublishedRateCards,
    pendingAgencies,
    activeCampaigns,
    draftCampaigns,
    closingSoon,
    pendingApplications,
  ] = await Promise.all([
    db.mediaBooking.count({ where: bookingWhere("PENDING") }),
    db.mediaBooking.count({ where: bookingWhere("CONFIRMED") }),
    db.mediaListing.count({ where: listingWhereCount("ACTIVE") }),
    db.mediaListing.count({ where: listingWhereCount("DRAFT") }),
    db.rateCard.count({ where: cardWhere(true) }),
    db.rateCard.count({ where: cardWhere(false) }),
    isAdmin(access) ? db.mediaAgency.count({ where: { verificationStatus: "PENDING" } }) : Promise.resolve(null),
    db.campaign.count({ where: { status: "ACTIVE", ...campaignClient } }),
    db.campaign.count({ where: { status: "DRAFT", ...campaignClient } }),
    db.campaign.count({
      where: { status: "ACTIVE", deadline: { gte: now, lte: inSevenDays }, ...campaignClient },
    }),
    db.campaignApplication.count({
      where: isAdmin(access)
        ? { status: "PENDING" }
        : access?.role === "CREATOR"
          ? { status: "PENDING", talentId: access.userId }
          : { status: "PENDING", campaign: { clientId: access?.userId || "__none__" } },
    }),
  ]);

  return {
    asOf: iso(now),
    bookings: { pending: pendingBookings, confirmed: confirmedBookings },
    listings: { active: activeListings, draft: draftListings },
    rateCards: { published: publishedRateCards, unpublished: unpublishedRateCards },
    agenciesPendingVerification: pendingAgencies,
    campaigns: {
      active: activeCampaigns,
      draft: draftCampaigns,
      activeClosingWithin7Days: closingSoon,
      pendingApplications,
    },
  };
}

function shapeCreatorSummary(creator) {
  return {
    id: creator.id,
    name: creator.name,
    specialty: creator.specialty,
    experienceYears: creator.experience,
    verificationStatus: creator.verificationStatus,
    description: clip(creator.description, 280),
    portfolioUrls: (creator.portfolioUrls || []).slice(0, 5),
    skills: (creator.skills || []).map((skill) => skill.name),
    services: (creator.services || []).map((service) => ({
      title: service.title,
      category: service.category,
      rate: money(service.rate),
      rateType: service.rateType,
      description: clip(service.description, 160),
    })),
  };
}

export async function searchCreators(db, args) {
  const limit = Math.min(args.limit ?? 10, 20);
  const where = { role: "CREATOR" };
  if (args.verifiedOnly) where.verificationStatus = "VERIFIED";
  if (args.specialty) {
    where.specialty = { contains: args.specialty, mode: "insensitive" };
  }
  if (args.query) {
    where.OR = [
      { name: { contains: args.query, mode: "insensitive" } },
      { specialty: { contains: args.query, mode: "insensitive" } },
      { description: { contains: args.query, mode: "insensitive" } },
      { skills: { some: { name: { contains: args.query, mode: "insensitive" } } } },
      { services: { some: { title: { contains: args.query, mode: "insensitive" } } } },
    ];
  }

  const creators = await db.user.findMany({
    where,
    include: {
      skills: { select: { name: true }, take: 8 },
      services: {
        where: { isActive: true },
        select: {
          title: true,
          description: true,
          rate: true,
          rateType: true,
          category: true,
        },
        take: 6,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  return {
    count: creators.length,
    currency: "GHS",
    creators: creators.map(shapeCreatorSummary),
  };
}

export async function getCreator(db, id, access) {
  if (access?.role === "CREATOR" && access.userId !== id) return { found: false };
  const creator = await db.user.findFirst({
    where: { id, role: "CREATOR" },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      specialty: true,
      portfolioUrls: true,
      experience: true,
      description: true,
      verificationStatus: true,
      createdAt: true,
      skills: { select: { name: true } },
      portfolios: {
        orderBy: { createdAt: "desc" },
        take: 12,
        select: { title: true, description: true, url: true, fileType: true },
      },
      services: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          rate: true,
          rateType: true,
          duration: true,
          category: true,
          imageUrl: true,
        },
      },
      digitalProducts: {
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          category: true,
          imageUrl: true,
          fileType: true,
          downloadCount: true,
          status: true,
        },
      },
    },
  });
  if (!creator) return { found: false };

  const now = new Date();
  const [slots, appointmentGroups, applications, viewCount, sales] = await Promise.all([
    db.availability.findMany({
      where: { creatorId: id, endTime: { gte: now } },
      orderBy: { startTime: "asc" },
      take: 8,
      select: { startTime: true, endTime: true, status: true },
    }),
    db.appointment.groupBy({
      by: ["status"],
      where: { creatorId: id },
      _count: { _all: true },
    }),
    db.campaignApplication.findMany({
      where: { talentId: id },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        status: true,
        rate: true,
        location: true,
        availability: true,
        campaign: {
          select: {
            id: true,
            title: true,
            brand: true,
            category: true,
            status: true,
            location: true,
            deadline: true,
          },
        },
      },
    }),
    db.profileView.count({ where: { creatorId: id } }),
    db.digitalProductSale.aggregate({
      where: { sellerId: id, status: "COMPLETED" },
      _count: { _all: true },
      _sum: { creatorEarnings: true },
    }),
  ]);

  const appointments = {};
  for (const group of appointmentGroups) {
    appointments[group.status] = group._count._all;
  }

  const result = {
    found: true,
    currency: "GHS",
    creator: {
      ...shapeCreatorSummary(creator),
      imageUrl: creator.imageUrl,
      description: clip(creator.description, 800),
      memberSince: iso(creator.createdAt),
      portfolio: creator.portfolios.map((item) => ({
        title: item.title,
        description: clip(item.description, 200),
        url: item.url,
        fileType: item.fileType,
      })),
      services: creator.services.map((service) => ({
        id: service.id,
        title: service.title,
        category: service.category,
        rate: money(service.rate),
        rateType: service.rateType,
        durationMinutes: service.duration,
        imageUrl: service.imageUrl,
        description: clip(service.description, 300),
      })),
      products: creator.digitalProducts.map((product) => ({
        id: product.id,
        title: product.title,
        category: product.category,
        price: money(product.price),
        status: product.status,
        fileType: product.fileType,
        downloadCount: product.downloadCount,
        imageUrl: product.imageUrl,
        description: clip(product.description, 240),
      })),
      upcomingAvailability: slots.map((slot) => ({
        start: iso(slot.startTime),
        end: iso(slot.endTime),
        status: slot.status,
      })),
      appointments,
      applications: applications.map((application) => ({
        status: application.status,
        expectedRate: money(application.rate),
        location: application.location,
        availability: clip(application.availability, 160),
        campaign: application.campaign
          ? {
              id: application.campaign.id,
              title: application.campaign.title,
              brand: application.campaign.brand,
              category: application.campaign.category,
              status: application.campaign.status,
              location: application.campaign.location,
              deadline: iso(application.campaign.deadline),
            }
          : null,
      })),
      profileViews: viewCount,
      completedProductSales: sales._count._all,
      productEarnings: money(sales._sum.creatorEarnings || 0),
    },
  };
  const full = isAdmin(access) || access?.userId === id;
  if (!full) {
    result.creator.applications = [];
    result.creator.appointments = {};
    result.creator.completedProductSales = null;
    result.creator.productEarnings = null;
    result.creator.products = result.creator.products.filter((product) => product.status === "ACTIVE");
  }
  return result;
}

export async function listDigitalProducts(db, args) {
  const limit = Math.min(args.limit ?? 12, 20);
  const where = {};
  const ownDrafts = args.access?.role === "CREATOR";
  if (isAdmin(args.access)) {
    if (args.status) where.status = args.status;
    else where.status = { in: ["ACTIVE", "DRAFT"] };
  } else if (ownDrafts) {
    where.OR = [{ status: "ACTIVE" }, { creatorId: args.access.userId }];
    if (args.status) where.AND = [{ status: args.status }];
  } else {
    where.status = "ACTIVE";
  }
  if (args.category) where.category = { contains: args.category, mode: "insensitive" };
  if (args.query) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { title: { contains: args.query, mode: "insensitive" } },
          { description: { contains: args.query, mode: "insensitive" } },
          { creator: { name: { contains: args.query, mode: "insensitive" } } },
        ],
      },
    ];
  }

  const products = await db.digitalProduct.findMany({
    where,
    include: {
      creator: { select: { id: true, name: true, specialty: true, verificationStatus: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  return {
    count: products.length,
    currency: "GHS",
    products: products.map((product) => ({
      id: product.id,
      title: product.title,
      category: product.category,
      price: money(product.price),
      status: product.status,
      fileType: product.fileType,
      downloadCount: product.downloadCount,
      imageUrl: product.imageUrl,
      description: clip(product.description, 240),
      creator: {
        id: product.creator.id,
        name: product.creator.name,
        specialty: product.creator.specialty,
        verificationStatus: product.creator.verificationStatus,
      },
    })),
  };
}

export async function matchCreators(db, args) {
  let campaign = null;
  if (args.campaignId) {
    campaign = await db.campaign.findUnique({
      where: { id: args.campaignId },
      select: {
        id: true,
        title: true,
        brand: true,
        category: true,
        description: true,
        location: true,
        budgetMin: true,
        budgetMax: true,
        requirements: true,
        deadline: true,
        status: true,
      },
    });
  }

  const query = args.query || campaign?.category || campaign?.title || "";
  const found = await searchCreators(db, {
    query: query || undefined,
    specialty: args.specialty,
    verifiedOnly: args.verifiedOnly,
    limit: 20,
  });

  const budgetMax = args.budget ?? campaign?.budgetMax ?? null;
  const needles = [query, campaign?.category, ...(campaign?.requirements || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 3);

  const ranked = found.creators
    .map((creator) => {
      const haystack = [creator.name, creator.specialty, creator.description, ...creator.skills, ...creator.services.map((service) => `${service.title} ${service.category}`)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const overlap = needles.filter((word) => haystack.includes(word)).length;
      const rates = creator.services.map((service) => service.rate).filter((rate) => rate != null);
      const lowest = rates.length ? Math.min(...rates) : null;
      const withinBudget = budgetMax == null || lowest == null || lowest <= budgetMax;
      return {
        ...creator,
        lowestServiceRate: lowest,
        withinBudget,
        matchScore: overlap + (creator.verificationStatus === "VERIFIED" ? 2 : 0) + (creator.portfolioUrls.length ? 1 : 0),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore || Number(b.withinBudget) - Number(a.withinBudget))
    .slice(0, Math.min(args.limit ?? 8, 12));

  return {
    currency: "GHS",
    campaign: campaign
      ? {
          id: campaign.id,
          title: campaign.title,
          brand: campaign.brand,
          category: campaign.category,
          location: campaign.location,
          budgetMin: money(campaign.budgetMin),
          budgetMax: money(campaign.budgetMax),
          deadline: iso(campaign.deadline),
          requirements: campaign.requirements,
          description: clip(campaign.description, 400),
        }
      : null,
    creators: ranked,
    note: "Creator service rates, product prices, and campaign budgets are the amounts stored on Payollar and shown in the app in Ghana cedis. Appointment credit payouts are a separate balance and are not included.",
  };
}
