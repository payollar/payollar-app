import { NextResponse } from "next/server";

const NOMINATIM = "https://nominatim.openstreetmap.org/reverse";
const UA = "Payollar/1.0 (media map reverse; https://payollar.com)";

/**
 * GET /api/geocode/reverse?lat=...&lon=... — proxy Nominatim reverse geocode.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = Number(searchParams.get("lat"));
    const lon = Number(searchParams.get("lon") ?? searchParams.get("lng"));

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json(
        { error: "Valid lat and lon required" },
        { status: 400 }
      );
    }

    const url = new URL(NOMINATIM);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": UA,
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Reverse geocode failed" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      display_name: data?.display_name || null,
    });
  } catch (error) {
    console.error("geocode reverse error:", error);
    return NextResponse.json(
      { error: "Reverse geocode failed" },
      { status: 500 }
    );
  }
}
