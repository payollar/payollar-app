/**
 * Detect platform + extract public engagement from social post URLs.
 *
 * Provider order:
 * 1) Supadata (`SUPADATA_API_KEY`) — YouTube / TikTok / Instagram / X / Facebook
 * 2) YouTube Data API (`YOUTUBE_API_KEY` or `GOOGLE_API_KEY`) for YouTube only
 * 3) Best-effort HTML / public endpoints (fragile on IG/TikTok)
 *
 * Get a free Supadata key: https://dash.supadata.ai
 */

const PLATFORM_PATTERNS = [
  { id: "instagram", label: "Instagram", test: /(?:instagram\.com|instagr\.am)\//i },
  { id: "tiktok", label: "TikTok", test: /(?:tiktok\.com|vm\.tiktok\.com)\//i },
  { id: "youtube", label: "YouTube", test: /(?:youtube\.com|youtu\.be)\//i },
  { id: "x", label: "X", test: /(?:twitter\.com|x\.com)\//i },
  { id: "facebook", label: "Facebook", test: /(?:facebook\.com|fb\.watch)\//i },
  { id: "linkedin", label: "LinkedIn", test: /linkedin\.com\//i },
];

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export function detectSocialPlatform(url) {
  if (!url || typeof url !== "string") return null;
  const match = PLATFORM_PATTERNS.find((p) => p.test.test(url.trim()));
  return match ? { id: match.id, label: match.label } : { id: "other", label: "Other" };
}

/** Strip tracking params and canonicalize common social post URLs. */
export function normalizeSocialUrl(raw) {
  let value = String(raw || "").trim();
  if (!value) return "";
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  let u;
  try {
    u = new URL(value);
  } catch {
    return value;
  }

  // Drop share/tracking junk Instagram / TikTok paste into the clipboard
  [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "igsh",
    "igshid",
    "img_index",
    "psln",
    "srtk",
    "fbclid",
    "si",
    "feature",
    "pp",
  ].forEach((key) => u.searchParams.delete(key));

  const host = u.hostname.replace(/^www\./, "");
  if (host.includes("instagram.com") || host.includes("instagr.am")) {
    const match = u.pathname.match(/\/(reel|reels|p|tv)\/([^/?#]+)/i);
    if (match) {
      const kind = match[1].toLowerCase() === "reels" ? "reel" : match[1].toLowerCase();
      return `https://www.instagram.com/${kind}/${match[2]}/`;
    }
  }
  if (host.includes("tiktok.com")) {
    const match = u.pathname.match(/(@[^/]+\/video\/\d+)/i);
    if (match) return `https://www.tiktok.com/${match[1]}`;
  }
  if (host.includes("youtube.com") || host.includes("youtu.be")) {
    const id = youtubeVideoId(u.toString());
    if (id) return `https://www.youtube.com/watch?v=${id}`;
  }

  u.hash = "";
  return u.toString();
}

/** Drop obviously wrong scrape noise (e.g. views=2 with likes=14). */
function sanitizeEngagement({ views, likes, comments, shares, platform }) {
  let nextViews = views;
  let nextLikes = likes;
  let nextComments = comments;
  let nextShares = shares;

  // Video platforms almost never have fewer views than likes
  if (
    nextViews != null &&
    nextLikes != null &&
    nextViews < nextLikes &&
    ["instagram", "tiktok", "youtube", "facebook"].includes(platform)
  ) {
    nextViews = null;
  }

  return {
    views: nextViews,
    likes: nextLikes,
    comments: nextComments,
    shares: nextShares,
  };
}

function youtubeVideoId(url) {
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace(/^\//, "").split("/")[0] || null;
    }
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const shorts = u.pathname.match(/\/(?:shorts|embed|live)\/([^/?#]+)/);
    return shorts?.[1] || null;
  } catch {
    return null;
  }
}

function xStatusId(url) {
  try {
    const u = new URL(url.trim());
    const match = u.pathname.match(/\/status\/(\d+)/);
    return match?.[1] || null;
  } catch {
    return null;
  }
}

function parseCount(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return value >= 0 ? Math.round(value) : null;
  }
  const raw = String(value).trim().replace(/,/g, "").toUpperCase();
  const match = raw.match(/^([\d.]+)\s*([KMB])?/);
  if (!match) {
    const digits = raw.replace(/[^\d]/g, "");
    return digits ? Number(digits) : null;
  }
  let n = Number(match[1]);
  if (!Number.isFinite(n)) return null;
  const suffix = match[2];
  if (suffix === "K") n *= 1_000;
  if (suffix === "M") n *= 1_000_000;
  if (suffix === "B") n *= 1_000_000_000;
  return Math.round(n);
}

function pickJsonNumber(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1] != null) {
      const n = parseCount(match[1]);
      if (n != null) return n;
    }
  }
  return null;
}

async function fetchText(url, { accept = "text/html" } = {}) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: accept,
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
  return res.text();
}

async function extractYouTube(url, base) {
  const id = youtubeVideoId(url);
  if (!id) return base;

  const watchUrl = `https://www.youtube.com/watch?v=${id}`;
  let title = null;
  let views = null;
  let likes = null;
  let source = "youtube";

  try {
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
      { cache: "no-store" }
    );
    if (oembedRes.ok) {
      const data = await oembedRes.json();
      title = data.title || null;
    }
  } catch {
    /* ignore */
  }

  // Prefer Data API when a key is configured
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
  if (apiKey) {
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${id}&key=${apiKey}`;
      const apiRes = await fetch(apiUrl, { cache: "no-store" });
      if (apiRes.ok) {
        const data = await apiRes.json();
        const item = data.items?.[0];
        if (item) {
          title = item.snippet?.title || title;
          views = parseCount(item.statistics?.viewCount);
          likes = parseCount(item.statistics?.likeCount);
          const comments = parseCount(item.statistics?.commentCount);
          return {
            ...base,
            postUrl: watchUrl,
            title,
            views,
            likes,
            comments,
            source: "youtube-api",
          };
        }
      }
    } catch {
      /* fall through to HTML scrape */
    }
  }

  try {
    const html = await fetchText(watchUrl);
    views =
      pickJsonNumber(html, [
        /"viewCount"\s*:\s*"(\d+)"/,
        /"viewCount"\s*:\s*\{\s*"simpleText"\s*:\s*"([\d,.\sKMB]+)\s*views?"/i,
        /itemprop="interactionCount"[^>]*content="(\d+)"/,
      ]) ?? views;
    likes =
      pickJsonNumber(html, [
        /"label"\s*:\s*"([\d,.KMB]+)\s*likes?"/i,
        /"likeCount"\s*:\s*"(\d+)"/,
      ]) ?? likes;
    if (!title) {
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      title = titleMatch?.[1]?.replace(/\s*-\s*YouTube\s*$/i, "").trim() || null;
    }
    source = views != null ? "youtube-scrape" : title ? "oembed" : source;
  } catch {
    /* keep what we have */
  }

  return {
    ...base,
    postUrl: watchUrl,
    title,
    views,
    likes,
    source,
  };
}

async function extractTikTok(url, base) {
  let html;
  try {
    html = await fetchText(url);
  } catch {
    return base;
  }

  const title =
    html.match(/<title>([^<]+)<\/title>/i)?.[1]?.replace(/\s*\|\s*TikTok\s*$/i, "").trim() ||
    null;

  const views = pickJsonNumber(html, [
    /"playCount"\s*:\s*(\d+)/,
    /"playCount"\s*:\s*"(\d+)"/,
    /"viewCount"\s*:\s*(\d+)/,
  ]);
  const likes = pickJsonNumber(html, [
    /"diggCount"\s*:\s*(\d+)/,
    /"likeCount"\s*:\s*(\d+)/,
  ]);
  const comments = pickJsonNumber(html, [/"commentCount"\s*:\s*(\d+)/]);
  const shares = pickJsonNumber(html, [/"shareCount"\s*:\s*(\d+)/]);

  return {
    ...base,
    title,
    views,
    likes,
    comments,
    shares,
    source: views != null ? "tiktok-scrape" : "tiktok",
  };
}

async function extractX(url, base) {
  const statusId = xStatusId(url);
  if (!statusId) return base;

  try {
    const res = await fetch(`https://api.fxtwitter.com/status/${statusId}`, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const tweet = data.tweet || data;
      return {
        ...base,
        title: tweet.text ? String(tweet.text).slice(0, 140) : null,
        views: parseCount(tweet.views ?? tweet.view_count ?? tweet.viewCount),
        likes: parseCount(tweet.likes ?? tweet.favorite_count ?? tweet.likeCount),
        comments: parseCount(tweet.replies ?? tweet.reply_count ?? tweet.replyCount),
        shares: parseCount(tweet.retweets ?? tweet.retweet_count ?? tweet.retweetCount),
        source: "fxtwitter",
      };
    }
  } catch {
    /* fall through */
  }

  return base;
}

function instagramShortcode(url) {
  try {
    const u = new URL(normalizeSocialUrl(url));
    const match = u.pathname.match(/\/(?:reel|reels|p|tv)\/([^/?#]+)/i);
    return match?.[1] || null;
  } catch {
    return null;
  }
}

function mergeEngagement(primary = {}, secondary = {}, platform) {
  const merged = sanitizeEngagement({
    views: primary.views ?? secondary.views ?? null,
    likes: primary.likes ?? secondary.likes ?? null,
    comments: primary.comments ?? secondary.comments ?? null,
    shares: primary.shares ?? secondary.shares ?? null,
    platform,
  });
  return merged;
}

function hasEngagement(meta) {
  return (
    meta?.views != null ||
    meta?.likes != null ||
    meta?.comments != null ||
    meta?.shares != null
  );
}

/** Instagram public GraphQL — returns video_play_count when Meta exposes it. */
async function extractInstagramGraphql(url, base) {
  const shortcode = instagramShortcode(url);
  if (!shortcode) return null;

  try {
    const home = await fetch("https://www.instagram.com/", {
      headers: {
        "User-Agent": UA,
        Accept: "text/html",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
      redirect: "follow",
    });
    const setCookie = typeof home.headers.getSetCookie === "function" ? home.headers.getSetCookie() : [];
    const cookieHeader = setCookie.map((c) => c.split(";")[0]).join("; ");
    const csrf = cookieHeader.match(/csrftoken=([^;]+)/)?.[1] || "missing";

    // Single doc_id — hammering alternates trips Instagram rate limits.
    const res = await fetch("https://www.instagram.com/api/graphql", {
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Content-Type": "application/x-www-form-urlencoded",
        "X-IG-App-ID": "936619743392459",
        "X-CSRFToken": csrf,
        "X-FB-LSD": "AVqbxe3J_YA",
        "X-ASBD-ID": "129477",
        "Sec-Fetch-Site": "same-origin",
        Origin: "https://www.instagram.com",
        Referer: `https://www.instagram.com/reel/${shortcode}/`,
        Cookie: cookieHeader || `csrftoken=${csrf}`,
        Accept: "*/*",
      },
      body: new URLSearchParams({
        variables: JSON.stringify({ shortcode }),
        doc_id: "10015901848480474",
        lsd: "AVqbxe3J_YA",
      }),
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      const media = json?.data?.xdt_shortcode_media;
      if (media) {
        const caption =
          media.edge_media_to_caption?.edges?.[0]?.node?.text ||
          media.accessibility_caption ||
          null;
        const engagement = sanitizeEngagement({
          // Prefer play count (Reels) over legacy view count
          views: parseCount(media.video_play_count ?? media.video_view_count),
          likes: parseCount(
            media.edge_media_preview_like?.count ?? media.edge_liked_by?.count
          ),
          comments: parseCount(
            media.edge_media_to_parent_comment?.count ??
              media.edge_media_to_comment?.count
          ),
          shares: null,
          platform: "instagram",
        });

        return {
          ...base,
          postUrl: normalizeSocialUrl(url),
          title: caption ? String(caption).replace(/\n/g, " ").slice(0, 140) : null,
          ...engagement,
          source: "instagram-graphql",
        };
      }
    }
  } catch (error) {
    console.warn("Instagram GraphQL extract failed:", error?.message || error);
  }
  return null;
}

async function extractInstagramEmbed(url, base) {
  try {
    const clean = normalizeSocialUrl(url);
    const embedUrl = clean.includes("/embed")
      ? clean
      : `${clean.replace(/\/$/, "")}/embed/captioned/`;
    const html = await fetchText(embedUrl);
    const title =
      html.match(/<title>([^<]+)<\/title>/i)?.[1]?.replace(/\s*•\s*Instagram.*$/i, "").trim() ||
      html.match(/"caption"\s*:\s*"((?:\\.|[^"\\])*)"/)?.[1]?.replace(/\\n/g, " ").slice(0, 140) ||
      null;
    const likes = pickJsonNumber(html, [
      /"edge_liked_by"\s*:\s*\{\s*"count"\s*:\s*(\d+)/,
      /"edge_media_preview_like"\s*:\s*\{\s*"count"\s*:\s*(\d+)/,
      /"like_count"\s*:\s*(\d+)/,
    ]);
    const comments = pickJsonNumber(html, [
      /"edge_media_to_comment"\s*:\s*\{\s*"count"\s*:\s*(\d+)/,
      /"edge_media_to_parent_comment"\s*:\s*\{\s*"count"\s*:\s*(\d+)/,
      /"comment_count"\s*:\s*(\d+)/,
    ]);
    // Only trust structured play/view fields — loose "N views" text is often noise.
    const views = pickJsonNumber(html, [
      /"video_play_count"\s*:\s*(\d+)/,
      /"video_view_count"\s*:\s*(\d+)/,
      /"play_count"\s*:\s*(\d+)/,
      /"ig_play_count"\s*:\s*(\d+)/,
    ]);
    const engagement = sanitizeEngagement({
      views,
      likes,
      comments,
      shares: null,
      platform: "instagram",
    });
    if (!hasEngagement(engagement) && !title) return null;
    return {
      ...base,
      postUrl: clean,
      title,
      ...engagement,
      source: "instagram-embed",
    };
  } catch {
    return null;
  }
}

async function extractInstagram(url, base) {
  // GraphQL first (play counts), then embed for caption/likes fallback.
  const viaGraphql = await extractInstagramGraphql(url, base);
  const viaEmbed = await extractInstagramEmbed(url, base);

  if (viaGraphql && viaEmbed) {
    const engagement = mergeEngagement(viaGraphql, viaEmbed, "instagram");
    return {
      ...base,
      postUrl: viaGraphql.postUrl || viaEmbed.postUrl || normalizeSocialUrl(url),
      title: viaGraphql.title || viaEmbed.title,
      ...engagement,
      source:
        viaGraphql.views != null
          ? "instagram-graphql"
          : viaEmbed.source || "instagram",
    };
  }

  return viaGraphql || viaEmbed || { ...base, postUrl: normalizeSocialUrl(url) };
}

function pickSupadataViews(metadata, extra = {}) {
  return parseCount(
    metadata.stats?.views ??
      extra.playCount ??
      extra.play_count ??
      extra.video_play_count ??
      extra.video_view_count ??
      extra.view_count ??
      extra.ig_play_count ??
      extra.videoPlayCount ??
      extra.viewCount
  );
}

async function extractViaSupadata(url, base) {
  const apiKey = String(process.env.SUPADATA_API_KEY || "").trim();
  if (!apiKey) return null;

  // Try cleaned + raw URL — some providers are picky about format.
  const candidates = Array.from(
    new Set([normalizeSocialUrl(url), String(url || "").trim()].filter(Boolean))
  );

  for (const candidate of candidates) {
    try {
      const { Supadata } = await import("@supadata/js");
      const client = new Supadata({ apiKey });
      const metadata = await client.metadata({ url: candidate });
      if (!metadata) continue;

      const platformId =
        metadata.platform === "twitter" ? "x" : metadata.platform || base.platform;
      const platformLabel =
        PLATFORM_PATTERNS.find((p) => p.id === platformId)?.label ||
        (metadata.platform
          ? metadata.platform.charAt(0).toUpperCase() + metadata.platform.slice(1)
          : base.platformLabel);

      const extra = metadata.additionalData || {};
      const engagement = sanitizeEngagement({
        views: pickSupadataViews(metadata, extra),
        likes: parseCount(
          metadata.stats?.likes ?? extra.like_count ?? extra.likeCount ?? extra.diggCount
        ),
        comments: parseCount(
          metadata.stats?.comments ?? extra.comment_count ?? extra.commentCount
        ),
        shares: parseCount(
          metadata.stats?.shares ?? extra.share_count ?? extra.shareCount
        ),
        platform: platformId,
      });

      return {
        ...base,
        postUrl: normalizeSocialUrl(metadata.url || candidate),
        platform: platformId,
        platformLabel,
        title:
          metadata.title ||
          metadata.description?.slice(0, 140) ||
          metadata.author?.displayName ||
          null,
        ...engagement,
        source: "supadata",
      };
    } catch (error) {
      console.warn(
        "Supadata metadata failed:",
        error?.error || error?.message || error,
        error?.details || ""
      );
    }
  }
  return null;
}

async function extractPlatformNative(normalized, base, platformId) {
  if (platformId === "youtube") return extractYouTube(normalized, base);
  if (platformId === "tiktok") return extractTikTok(normalized, base);
  if (platformId === "x") return extractX(normalized, base);
  if (platformId === "instagram") return extractInstagram(normalized, base);
  return null;
}

/**
 * Best-effort public metadata + engagement counts when platforms expose them.
 * Supadata first, then platform scrapers — merge so IG plays aren't dropped
 * when Supadata only returns caption/likes (or fails entirely).
 */
export async function extractSocialPostMeta(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) {
    throw new Error("Paste a post URL first");
  }
  const normalized = normalizeSocialUrl(trimmed);
  if (!normalized) {
    throw new Error("Paste a post URL first");
  }
  try {
    // eslint-disable-next-line no-new
    new URL(normalized);
  } catch {
    throw new Error("That does not look like a valid URL");
  }

  const platform = detectSocialPlatform(normalized);
  const base = {
    postUrl: normalized,
    platform: platform?.id || "other",
    platformLabel: platform?.label || "Other",
    source: "manual",
    extractedAt: new Date().toISOString(),
    title: null,
    views: null,
    likes: null,
    comments: null,
    shares: null,
    reach: null,
  };

  const viaSupadata = String(process.env.SUPADATA_API_KEY || "").trim()
    ? await extractViaSupadata(normalized, base)
    : null;

  // Always run native extract when Supadata missed engagement — especially IG views.
  const needsNative =
    !viaSupadata ||
    !hasEngagement(viaSupadata) ||
    (platform?.id === "instagram" && viaSupadata.views == null) ||
    (platform?.id === "tiktok" && viaSupadata.views == null);

  const viaNative = needsNative
    ? await extractPlatformNative(normalized, base, platform?.id)
    : null;

  if (viaSupadata && viaNative) {
    const engagement = mergeEngagement(viaSupadata, viaNative, platform?.id);
    return {
      ...base,
      ...viaSupadata,
      ...viaNative,
      ...engagement,
      postUrl: viaSupadata.postUrl || viaNative.postUrl || normalized,
      title: viaSupadata.title || viaNative.title,
      platform: viaSupadata.platform || viaNative.platform || base.platform,
      platformLabel:
        viaSupadata.platformLabel || viaNative.platformLabel || base.platformLabel,
      source:
        viaSupadata.views != null
          ? "supadata"
          : viaNative.views != null
            ? viaNative.source
            : hasEngagement(viaSupadata)
              ? "supadata"
              : viaNative.source || "manual",
      extractedAt: base.extractedAt,
    };
  }

  if (viaSupadata && hasEngagement(viaSupadata)) return viaSupadata;
  if (viaNative) return viaNative;
  if (viaSupadata) return viaSupadata;

  return base;
}

export function isSocialCampaignCategory(category = "", subcategory = "") {
  const hay = `${category} ${subcategory}`.toLowerCase();
  return /social|influencer|video|reel|tiktok|instagram|clip|content|ugc/.test(hay);
}

export function buildChecklistFromDeliverables(deliverables = [], { social = false } = {}) {
  const items = [];
  const seen = new Set();

  const push = (label) => {
    const clean = String(label || "").trim();
    if (!clean) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    items.push({
      id: `item_${items.length + 1}`,
      label: clean,
      done: false,
    });
  };

  (Array.isArray(deliverables) ? deliverables : []).forEach(push);

  if (items.length === 0) {
    push("Deliverable completed as briefed");
    push("Creative matches brand guidelines");
  }

  if (social) {
    push("Content posted to the agreed platform(s)");
    push("Brand / campaign tagged correctly");
    push("Required caption, hashtags, or CTA included");
    push("Post link added under proof");
  }

  push("Ready for client review");
  return items;
}
