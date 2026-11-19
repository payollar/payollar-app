import { NextResponse } from "next/server";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const UA = "Payollar/1.0 (media map search; https://payollar.com)";

function withGhana(q) {
  return /ghana/i.test(q) ? q : `${q}, Ghana`;
}

const ROAD_WORDS = new Set([
  "link",
  "street",
  "st",
  "road",
  "rd",
  "avenue",
  "ave",
  "lane",
  "ln",
  "drive",
  "dr",
  "close",
  "crescent",
  "way",
  "highway",
  "bypass",
]);

/** Progressive query fallbacks — house numbers often miss in OSM Ghana. */
function queryVariants(raw) {
  const base = String(raw || "").trim().replace(/\s+/g, " ");
  if (!base) return [];

  const noHouseNo = base
    .replace(/^(no\.?|number|#)\s*\d+[a-z]?\s+/i, "")
    .replace(/^\d+[a-z]?\s+/i, "")
    .trim();

  const words = (noHouseNo || base).split(" ").filter(Boolean);
  const meaningful = words.filter((w) => !ROAD_WORDS.has(w.toLowerCase()));
  const variants = [withGhana(base)];

  if (noHouseNo && noHouseNo.toLowerCase() !== base.toLowerCase()) {
    variants.push(withGhana(noHouseNo));
  }
  if (meaningful.length >= 2) {
    variants.push(withGhana(meaningful.join(" ")));
  }
  if (meaningful.length >= 1) {
    variants.push(withGhana(meaningful[meaningful.length - 1]));
  }

  return [...new Set(variants.filter(Boolean))];
}

async function nominatimSearch(q) {
  const url = new URL(NOMINATIM);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "6");
  url.searchParams.set("countrycodes", "gh");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("q", q);

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": UA,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const err = new Error("Place search failed");
    err.status = 502;
    throw err;
  }

  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((hit) => ({
    place_id: hit.place_id,
    lat: hit.lat,
    lon: hit.lon,
    display_name: hit.display_name,
  }));
}

/**
 * GET /api/geocode/search?q=... — proxy Nominatim (avoids browser CORS).
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = String(searchParams.get("q") || "").trim();
    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: "Enter at least 2 characters" },
        { status: 400 }
      );
    }

    let results = [];
    for (const variant of queryVariants(q)) {
      results = await nominatimSearch(variant);
      if (results.length) break;
      // Nominatim usage policy: max ~1 req/sec
      await new Promise((r) => setTimeout(r, 1100));
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("geocode search error:", error);
    return NextResponse.json(
      { error: "Place search failed" },
      { status: error.status || 500 }
    );
  }
}
