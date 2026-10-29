const MEDIA_TYPES = [
  "TV",
  "RADIO",
  "BILLBOARD",
  "DIGITAL",
  "INFLUENCER_MARKETING",
  "VIDEO_CLIPPING",
];

export function clip(value, max = 360) {
  if (value == null) return null;
  const text = String(value).replace(/\s+/g, " ").trim();
  if (!text) return null;
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

export function money(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.round(number * 100) / 100;
}

export function iso(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function wordsForSeconds(seconds, wordsPerSecond) {
  const count = Math.round(Number(seconds) * wordsPerSecond);
  return Math.max(8, count);
}

export function normalizeMediaType(value) {
  if (!value) return null;
  const normalized = String(value).trim().toUpperCase().replace(/[\s-]+/g, "_");
  return MEDIA_TYPES.includes(normalized) ? normalized : null;
}

export function ok(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

export function fail(message) {
  return {
    isError: true,
    content: [{ type: "text", text: message }],
  };
}

export async function run(fn) {
  try {
    return ok(await fn());
  } catch (error) {
    console.error("[payollar-mcp]", error);
    return fail("Payollar could not load that data. Try a narrower filter.");
  }
}

export const PRODUCT_GUIDE = `Payollar is a Ghana media marketplace. Clients buy TV, radio, billboard, digital, influencer, and video-clipping inventory. Creators are talent: musicians, hosts, influencers, voice artists, and other specialists. They publish a profile, portfolio, bookable services, and digital products, then apply to client campaigns. Media agencies publish listings, packages, time-class rates, and smart rate cards.

Media rate cards, creator service rates, digital products, and campaign budgets are shown in the app in Ghana cedis. Appointment credit payouts are a separate balance and are not exposed here.

A time class rate is the price of one 30-second spot. A package is a bundled offer with its own price, duration, and spot count. Rate cards are spreadsheet-like sections and tables an agency publishes. Campaigns are client briefs that creators apply to. Transmission certificates are proof an ad aired. Reports are performance write-ups.

Roles: CLIENT buys. CREATOR is talent. MEDIA_AGENCY sells inventory. ADMIN operates the platform.

Creative rules:
- Radio copy is about 2.5 words per second. A 30-second spot is about 75 words.
- TV voice-over is about 2 words per second. A 30-second spot is about 60 words.
- Billboard lines stay under 8 words.
- Use only prices, stations, and packages returned by the tools. Do not invent rates.
- Match the script length to the duration being bought.
- TV formats include TVC, live programme mention, sponsorship, product placement, jingle, and station announcement.
- Radio formats include jingle, produced spot, live read, live programme mention, and sponsorship.

This server is read-only. It does not book, charge, or change records. It omits bank details, passwords, and contact details.`;
