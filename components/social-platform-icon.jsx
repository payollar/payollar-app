import {
  siFacebook,
  siInstagram,
  siTiktok,
  siX,
  siYoutube,
} from "simple-icons";
import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** LinkedIn removed from simple-icons (trademark); keep official path locally. */
const LINKEDIN = {
  hex: "0A66C2",
  path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
};

const BRANDS = {
  instagram: siInstagram,
  tiktok: siTiktok,
  youtube: siYoutube,
  x: siX,
  twitter: siX,
  facebook: siFacebook,
  linkedin: LINKEDIN,
};

/**
 * Brand glyph from simple-icons for known social platforms.
 * @param {{ platform?: string|null, className?: string, branded?: boolean }} props
 */
export function SocialPlatformIcon({
  platform,
  className = "h-4 w-4",
  branded = true,
}) {
  const key = String(platform || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
  const icon = BRANDS[key];

  if (!icon?.path) {
    return <Link2 className={cn("text-slate-400", className)} aria-hidden />;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      style={branded ? { color: `#${icon.hex}` } : undefined}
    >
      <path fill="currentColor" d={icon.path} />
    </svg>
  );
}

export function socialPlatformLabel(platform) {
  const key = String(platform || "").trim().toLowerCase();
  if (key === "twitter" || key === "x") return "X";
  if (key === "youtube") return "YouTube";
  if (key === "tiktok") return "TikTok";
  if (key === "instagram") return "Instagram";
  if (key === "facebook") return "Facebook";
  if (key === "linkedin") return "LinkedIn";
  return platform ? String(platform) : "Link";
}

/** Detect platform id from a pasted post/profile URL. */
export function platformFromUrl(url) {
  const value = String(url || "").trim();
  if (!value) return null;
  if (/(?:instagram\.com|instagr\.am)\//i.test(value)) return "instagram";
  if (/(?:tiktok\.com|vm\.tiktok\.com)\//i.test(value)) return "tiktok";
  if (/(?:youtube\.com|youtu\.be)\//i.test(value)) return "youtube";
  if (/(?:twitter\.com|x\.com)\//i.test(value)) return "x";
  if (/(?:facebook\.com|fb\.watch)\//i.test(value)) return "facebook";
  if (/linkedin\.com\//i.test(value)) return "linkedin";
  return null;
}
