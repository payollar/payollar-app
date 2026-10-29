import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { PRODUCT_GUIDE, run } from "./format.mjs";
import {
  airtimeRecap,
  buildCreativeBrief,
  getCreator,
  getListing,
  getRateCard,
  listCampaigns,
  listDigitalProducts,
  listMediaInventory,
  listRateCards,
  matchCreators,
  opsBrief,
  quoteMediaMix,
  searchCreators,
} from "./queries.mjs";

const mediaType = z
  .enum(["TV", "RADIO", "BILLBOARD", "DIGITAL", "INFLUENCER_MARKETING", "VIDEO_CLIPPING"])
  .optional()
  .describe("TV, RADIO, BILLBOARD, DIGITAL, INFLUENCER_MARKETING, or VIDEO_CLIPPING");

const readOnly = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
};

const BROWSE_TOOLS = [
  "get_product_context",
  "list_media_inventory",
  "get_listing",
  "list_rate_cards",
  "get_rate_card",
  "quote_media_mix",
  "build_creative_brief",
  "search_creators",
  "list_digital_products",
  "list_campaigns",
];

export function toolNamesFor(actor) {
  if (actor?.role === "ADMIN" || actor?.role === "MEDIA_AGENCY") {
    return [...BROWSE_TOOLS, "get_creator", "match_creators", "airtime_recap", "ops_brief"];
  }
  if (actor?.role === "CLIENT") {
    return [...BROWSE_TOOLS, "get_creator", "match_creators"];
  }
  if (actor?.role === "CREATOR") {
    return [...BROWSE_TOOLS, "get_creator"];
  }
  return ["get_product_context", "list_media_inventory", "get_listing", "search_creators", "list_digital_products"];
}

export function createPayollarServer(db, actor) {
  const server = new McpServer({
    name: "payollar",
    version: "0.1.0",
  });
  const allowed = new Set(toolNamesFor(actor));
  const scoped = (args = {}) => ({ ...(args || {}), access: actor });
  const register = (name, config, handler) => {
    if (!allowed.has(name)) return;
    server.registerTool(name, config, handler);
  };

  server.registerResource(
    "product-guide",
    "payollar://guide",
    {
      title: "Payollar product guide",
      description: "What Payollar sells and how to use its media data when planning or designing.",
      mimeType: "text/plain",
    },
    async () => ({
      contents: [{ uri: "payollar://guide", mimeType: "text/plain", text: PRODUCT_GUIDE }],
    })
  );

  register(
    "get_product_context",
    {
      title: "Payollar product context",
      description: "Read how Payollar works: roles, inventory, rate cards, campaigns, and creative length rules. Call this before designing or quoting.",
      annotations: readOnly,
    },
    async () => run(async () => ({ guide: PRODUCT_GUIDE }))
  );

  register(
    "list_media_inventory",
    {
      title: "List media inventory",
      description: "List TV, radio, billboard, digital, influencer, and clipping listings. Returns station, location, reach, and whether packages or time classes exist. Use get_listing for prices.",
      annotations: readOnly,
      inputSchema: {
        query: z.string().optional().describe("Station, network, or keyword"),
        location: z.string().optional().describe("City or region, such as Accra"),
        mediaType,
        status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
        includeDrafts: z.boolean().optional().describe("Include draft listings. Defaults to true."),
        limit: z.number().int().min(1).max(25).optional(),
      },
    },
    async (args) =>
      run(() =>
        listMediaInventory(db, scoped({ ...args, includeDrafts: args.includeDrafts ?? true }))
      )
  );

  register(
    "get_listing",
    {
      title: "Get a media listing",
      description: "Get one listing with packages and 30-second time-class rates in Ghana cedis.",
      annotations: readOnly,
      inputSchema: {
        id: z.string().describe("Media listing id"),
      },
    },
    async (args) => run(() => getListing(db, args.id, actor))
  );

  register(
    "list_rate_cards",
    {
      title: "List rate cards",
      description: "List smart rate cards. Includes unpublished cards unless publishedOnly is true.",
      annotations: readOnly,
      inputSchema: {
        query: z.string().optional(),
        location: z.string().optional(),
        mediaType,
        publishedOnly: z.boolean().optional(),
        limit: z.number().int().min(1).max(25).optional(),
      },
    },
    async (args) => run(() => listRateCards(db, scoped(args)))
  );

  register(
    "get_rate_card",
    {
      title: "Get a rate card",
      description: "Open one rate card as sections, tables, and row values. Use this when designing around a station's actual prices.",
      annotations: readOnly,
      inputSchema: {
        id: z.string().describe("Rate card id"),
      },
    },
    async (args) => run(() => getRateCard(db, args.id, actor))
  );

  register(
    "quote_media_mix",
    {
      title: "Quote a media mix",
      description: "Price packages, time classes, and rate-card rows against a budget in Ghana cedis. Cost is the unit rate for the requested duration times the spot count. A city filter only returns cards tagged with that city.",
      annotations: readOnly,
      inputSchema: {
        budgetGhs: z.number().positive().optional().describe("Budget in Ghana cedis"),
        location: z.string().optional(),
        mediaType,
        spots: z.number().int().min(1).max(500).optional().describe("Number of spots. Defaults to 8."),
        durationSeconds: z.number().int().min(5).max(180).optional().describe("Spot length. Defaults to 30."),
        query: z.string().optional(),
      },
    },
    async (args) => run(() => quoteMediaMix(db, scoped(args)))
  );

  register(
    "build_creative_brief",
    {
      title: "Build a creative brief",
      description: "Build a brief for scripts and visuals from live rate cards and listings. Returns word counts for one spot of the given duration, plus the buys the creative must fit. Defaults to 1 spot. You write the creative; this tool supplies the constraints.",
      annotations: readOnly,
      inputSchema: {
        brand: z.string().describe("Brand or product name"),
        goal: z.string().describe("What the ad should make people do or remember"),
        offer: z.string().optional(),
        audience: z.string().optional(),
        location: z.string().optional(),
        tone: z.string().optional(),
        language: z.string().optional().describe("Language for the script, such as English or Twi"),
        budgetGhs: z.number().positive().optional(),
        mediaType,
        mediaTypes: z.array(z.string()).optional(),
        spots: z.number().int().min(1).max(500).optional(),
        durationSeconds: z.number().int().min(5).max(180).optional(),
        query: z.string().optional(),
      },
    },
    async (args) => run(() => buildCreativeBrief(db, scoped(args)))
  );

  register(
    "search_creators",
    {
      title: "Search creators",
      description: "Search creator profiles, skills, and service rates in Ghana cedis. Omits email, phone, and payout details. Use get_creator for portfolio, products, availability, and applications.",
      annotations: readOnly,
      inputSchema: {
        query: z.string().optional().describe("Name, skill, or specialty"),
        specialty: z.string().optional(),
        verifiedOnly: z.boolean().optional(),
        limit: z.number().int().min(1).max(20).optional(),
      },
    },
    async (args) => run(() => searchCreators(db, scoped(args)))
  );

  register(
    "get_creator",
    {
      title: "Get a creator",
      description: "Open one creator: portfolio, services, digital products, upcoming availability, campaign applications, profile views, and completed product sales. Prices are Ghana cedis. Omits contact and payout details.",
      annotations: readOnly,
      inputSchema: {
        id: z.string().describe("Creator id from search_creators"),
      },
    },
    async (args) => run(() => getCreator(db, actor?.role === "CREATOR" ? actor.userId : args.id, actor))
  );

  register(
    "list_digital_products",
    {
      title: "List digital products",
      description: "List creator products such as music, video, courses, and templates. Prices are Ghana cedis. File download URLs are omitted.",
      annotations: readOnly,
      inputSchema: {
        query: z.string().optional(),
        category: z.string().optional(),
        status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
        limit: z.number().int().min(1).max(20).optional(),
      },
    },
    async (args) => run(() => listDigitalProducts(db, scoped(args)))
  );

  register(
    "match_creators",
    {
      title: "Match creators to a brief",
      description: "Rank creators for a campaign or a free-text brief using specialty, skills, and service rates in Ghana cedis.",
      annotations: readOnly,
      inputSchema: {
        campaignId: z.string().optional(),
        query: z.string().optional().describe("Role or skill, such as voice over or influencer"),
        specialty: z.string().optional(),
        budget: z.number().positive().optional().describe("Maximum budget in Ghana cedis"),
        verifiedOnly: z.boolean().optional(),
        limit: z.number().int().min(1).max(12).optional(),
      },
    },
    async (args) => run(() => matchCreators(db, scoped(args)))
  );

  register(
    "list_campaigns",
    {
      title: "List campaigns",
      description: "List client campaigns with budget, location, deadline, and application counts. Omits applicant contact details.",
      annotations: readOnly,
      inputSchema: {
        query: z.string().optional(),
        location: z.string().optional(),
        status: z.enum(["DRAFT", "ACTIVE", "CLOSED", "CANCELLED"]).optional(),
        limit: z.number().int().min(1).max(20).optional(),
      },
    },
    async (args) => run(() => listCampaigns(db, scoped(args)))
  );

  register(
    "airtime_recap",
    {
      title: "Airtime recap",
      description: "Read transmission certificates and performance reports so you can write a client recap of what aired.",
      annotations: readOnly,
      inputSchema: {
        campaignRef: z.string().optional(),
        station: z.string().optional(),
        query: z.string().optional().describe("Report title keyword"),
        limit: z.number().int().min(1).max(30).optional(),
      },
    },
    async (args) => run(() => airtimeRecap(db, scoped(args)))
  );

  register(
    "ops_brief",
    {
      title: "Operations brief",
      description: "Counts for pending bookings, draft listings, unpublished rate cards, campaigns closing within 7 days, and pending applications.",
      annotations: readOnly,
    },
    async () => run(() => opsBrief(db, actor))
  );

  server.registerPrompt(
    "design_creative",
    {
      title: "Design a Payollar creative",
      description: "Draft scripts and a visual concept from a brand goal and live Payollar inventory.",
      argsSchema: {
        brand: z.string(),
        goal: z.string(),
        location: z.string().optional(),
      },
    },
    async ({ brand, goal, location }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Design a Payollar creative for ${brand}. Goal: ${goal}. Location: ${location || "Ghana"}. Call build_creative_brief first and use only the stations and prices it returns. Write a radio script, a TV voice-over, and a billboard line that match the duration targets.`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "plan_media_buy",
    {
      title: "Plan a media buy",
      description: "Recommend a media mix from live Payollar rates.",
      argsSchema: {
        budgetGhs: z.string(),
        location: z.string().optional(),
        goal: z.string(),
      },
    },
    async ({ budgetGhs, location, goal }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Plan a media buy in Ghana cedis. Budget: ${budgetGhs}. Location: ${location || "any"}. Goal: ${goal}. Call quote_media_mix and recommend a mix using only returned options. Show the station, the package or time class, the spot count, and the total.`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "cast_talent",
    {
      title: "Cast Payollar talent",
      description: "Shortlist creators for a campaign and describe the deliverable to ask for.",
      argsSchema: {
        brief: z.string(),
        specialty: z.string().optional(),
      },
    },
    async ({ brief, specialty }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Cast talent on Payollar for this brief: ${brief}. Specialty: ${specialty || "any"}. Call match_creators, then get_creator for the best two. Recommend who to hire and what to ask them to deliver. Use only the rates the tools return.`,
          },
        },
      ],
    })
  );

  return server;
}
