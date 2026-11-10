/** Creator social platforms for profile handles → portfolioUrls. */

export const CREATOR_SOCIAL_PLATFORMS = [
  {
    id: "instagram",
    network: "instagram",
    label: "Instagram",
    placeholder: "yourname",
    prefix: "@",
    hosts: ["instagram.com", "instagr.am"],
  },
  {
    id: "x",
    network: "x",
    label: "X",
    placeholder: "yourname",
    prefix: "@",
    hosts: ["x.com", "twitter.com"],
  },
  {
    id: "tiktok",
    network: "tiktok",
    label: "TikTok",
    placeholder: "yourname",
    prefix: "@",
    hosts: ["tiktok.com"],
  },
  {
    id: "youtube",
    network: "youtube",
    label: "YouTube",
    placeholder: "@channel or channel",
    prefix: "",
    hosts: ["youtube.com", "youtu.be"],
  },
  {
    id: "linkedin",
    network: "linkedin",
    label: "LinkedIn",
    placeholder: "in/yourname",
    prefix: "",
    hosts: ["linkedin.com"],
  },
  {
    id: "facebook",
    network: "facebook",
    label: "Facebook",
    placeholder: "yourpage",
    prefix: "",
    hosts: ["facebook.com", "fb.com", "fb.watch"],
  },
];

function stripHandle(value) {
  return String(value || "")
    .trim()
    .replace(/^@+/, "")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "");
}

export function normalizeSocialHandle(platformId, raw) {
  const platform = CREATOR_SOCIAL_PLATFORMS.find((item) => item.id === platformId);
  if (!platform) return "";
  let value = String(raw || "").trim();
  if (!value) return "";

  // Allow pasting full URLs
  try {
    if (/^https?:\/\//i.test(value) || value.includes(".com/") || value.includes(".be/")) {
      const withProto = /^https?:\/\//i.test(value) ? value : `https://${value}`;
      const parsed = new URL(withProto);
      const host = parsed.hostname.replace(/^www\./, "");
      if (platform.hosts.some((h) => host.includes(h))) {
        const parts = parsed.pathname.split("/").filter(Boolean);
        if (platform.id === "linkedin") {
          if (parts[0] === "in" && parts[1]) return `in/${parts[1]}`;
          return parts.join("/") || "";
        }
        if (platform.id === "youtube") {
          if (parts[0]?.startsWith("@")) return parts[0];
          if (parts[0] === "c" || parts[0] === "channel" || parts[0] === "user") {
            return parts[1] || "";
          }
          return parts[0] || parsed.searchParams.get("v") || "";
        }
        if (platform.id === "tiktok") {
          const at = parts.find((p) => p.startsWith("@"));
          return (at || parts[0] || "").replace(/^@/, "");
        }
        return (parts[0] || "").replace(/^@/, "");
      }
    }
  } catch {
    // fall through
  }

  value = stripHandle(value);
  if (platform.id === "linkedin" && value && !value.startsWith("in/")) {
    return `in/${value.replace(/^in\//, "")}`;
  }
  return value;
}

export function socialHandleToUrl(platformId, handle) {
  const cleaned = normalizeSocialHandle(platformId, handle);
  if (!cleaned) return null;
  switch (platformId) {
    case "instagram":
      return `https://www.instagram.com/${cleaned}/`;
    case "x":
      return `https://x.com/${cleaned}`;
    case "tiktok":
      return `https://www.tiktok.com/@${cleaned}`;
    case "youtube":
      return cleaned.startsWith("@")
        ? `https://www.youtube.com/${cleaned}`
        : `https://www.youtube.com/@${cleaned}`;
    case "linkedin":
      return `https://www.linkedin.com/${cleaned.replace(/^\/+/, "")}`;
    case "facebook":
      return `https://www.facebook.com/${cleaned}`;
    default:
      return null;
  }
}

export function detectSocialPlatform(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return (
      CREATOR_SOCIAL_PLATFORMS.find((platform) =>
        platform.hosts.some((h) => host.includes(h))
      )?.id || null
    );
  } catch {
    return null;
  }
}

export function parseSocialHandlesFromUrls(urls = []) {
  const handles = Object.fromEntries(CREATOR_SOCIAL_PLATFORMS.map((p) => [p.id, ""]));
  const otherUrls = [];

  for (const url of urls) {
    const platformId = detectSocialPlatform(url);
    if (!platformId) {
      otherUrls.push(url);
      continue;
    }
    if (handles[platformId]) {
      otherUrls.push(url);
      continue;
    }
    handles[platformId] = normalizeSocialHandle(platformId, url);
  }

  return { handles, otherUrls };
}

export function buildSocialUrlsFromHandles(handles = {}) {
  return CREATOR_SOCIAL_PLATFORMS.map((platform) =>
    socialHandleToUrl(platform.id, handles[platform.id])
  ).filter(Boolean);
}

export function socialLinksForDisplay(handles = {}) {
  return CREATOR_SOCIAL_PLATFORMS.map((platform) => {
    const handle = normalizeSocialHandle(platform.id, handles[platform.id]);
    const href = socialHandleToUrl(platform.id, handle);
    if (!href) return null;
    const displayHandle =
      platform.prefix && !handle.startsWith("@") && !handle.startsWith("in/")
        ? `${platform.prefix}${handle}`
        : handle.startsWith("in/")
          ? handle
          : handle.startsWith("@")
            ? handle
            : platform.prefix
              ? `${platform.prefix}${handle}`
              : handle;
    return {
      network: platform.network,
      href,
      handle: displayHandle,
      label: platform.label,
    };
  }).filter(Boolean);
}
