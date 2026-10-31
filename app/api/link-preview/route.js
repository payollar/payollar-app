import { NextResponse } from "next/server";

function instagramTarget(raw) {
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "");
  if (host !== "instagram.com") return null;
  const parts = parsed.pathname.split("/").filter(Boolean);
  const kinds = new Set(["p", "reel", "reels", "tv"]);
  for (let index = 0; index < parts.length - 1; index += 1) {
    if (!kinds.has(parts[index])) continue;
    const code = parts[index + 1].replace(/[^A-Za-z0-9_-]/g, "");
    if (code.length < 5) return null;
    const kind = parts[index] === "reels" ? "reel" : parts[index];
    return `https://www.instagram.com/${kind}/${code}/embed/`;
  }
  return null;
}

function thumbnailFromEmbed(html) {
  const urls = [...html.matchAll(/https?:\/\/[^"'\\\s>]+\.(?:jpg|jpeg|webp)/gi)].map((match) =>
    match[0].replace(/&amp;/g, "&")
  );
  return (
    urls.find((url) => /fbcdn\.net|cdninstagram\.com/.test(url) && /\/t51\.[^/]+-15\//.test(url)) || null
  );
}

export async function GET(request) {
  const target = instagramTarget(request.nextUrl.searchParams.get("url") || "");
  if (!target) {
    return NextResponse.json({ thumbnail: null }, { status: 400 });
  }

  try {
    const response = await fetch(target, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    });
    if (!response.ok) return NextResponse.json({ thumbnail: null });
    const html = await response.text();
    return NextResponse.json(
      { thumbnail: thumbnailFromEmbed(html) },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    );
  } catch {
    return NextResponse.json({ thumbnail: null });
  }
}
