"use client";

import * as React from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

const PALETTES = {
  dark: { text: "#F5F4F1", muted: "rgba(245,244,241,0.55)", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.12)", fill: "#F5F4F1", onFill: "#0A0A0A", panel: "#0E0E0E", line: "rgba(255,255,255,0.07)", focus: "rgba(245,244,241,0.85)" },
  light: { text: "#0A0A0A", muted: "rgba(10,10,10,0.55)", bg: "#FFFFFF", border: "rgba(10,10,10,0.12)", fill: "#0A0A0A", onFill: "#FFFFFF", panel: "#FFFFFF", line: "rgba(10,10,10,0.07)", focus: "rgba(10,10,10,0.85)" },
};

// Simple monochrome marks on a 24px grid (not the official logos).
const GLYPHS = {
  github: <path d="M7 4v10M7 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM17 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM17 10c0 4-4 4-10 6" />,
  x: <path d="M4.5 4.5h4.2l10.8 15h-4.2ZM19 4.5l-5.6 6.3M10.6 13.2 5 19.5" />,
  linkedin: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8.5 10.5V16M8.5 8h.01M12 16v-3.2a2 2 0 0 1 4 0V16M12 10.5V16" />
    </>
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <path d="M16.6 7.4h.01" />
    </>
  ),
  youtube: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="4" />
      <path d="m10.5 9.5 4 2.5-4 2.5Z" />
    </>
  ),
  dribbble: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8 4.5c3.5 4 5.8 9 6.6 15M3.6 11c4.4.3 9.5-.8 13.4-4.3M6 18c2.6-3.6 7-5 14.4-3.5" />
    </>
  ),
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7.5 7.4 5.2a2 2 0 0 0 2.2 0l7.4-5.2" />
    </>
  ),
  website: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5a13 13 0 0 1 0 17 13 13 0 0 1 0-17Z" />
    </>
  ),
  tiktok: (
    <>
      <path d="M14 4v9.2a3.8 3.8 0 1 1-2.6-3.6" />
      <path d="M14 7.2c1.2 1.4 2.8 2.2 4.6 2.3" />
    </>
  ),
  facebook: (
    <>
      <path d="M14 9h2.5V6.2H14c-2.2 0-3.7 1.4-3.7 3.8V12H8.2v2.8h2.1V20h3V14.8H16l.4-2.8h-2.9V10.4c0-.8.3-1.4 1.5-1.4Z" />
    </>
  ),
};

const LABELS = {
  github: "GitHub",
  x: "X",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  dribbble: "Dribbble",
  email: "Email",
  website: "Website",
  tiktok: "TikTok",
  facebook: "Facebook",
};

const DEFAULT_LINKS = [
  { network: "github", href: "https://github.com", handle: "@mayachen", followers: "3.2k" },
  { network: "x", href: "https://x.com", handle: "@mayadesigns", followers: "12.4k" },
  { network: "linkedin", href: "https://linkedin.com", handle: "in/mayachen", followers: "8.1k" },
  { network: "instagram", href: "https://instagram.com", handle: "@maya.studio", followers: "21k" },
  { network: "youtube", href: "https://youtube.com", handle: "Maya Makes", followers: "46k" },
  { network: "email", href: "mailto:hello@mayachen.design", handle: "hello@mayachen.design" },
];

export function SocialGlyph({
  network,
  size = 18,
  className,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {GLYPHS[network] || GLYPHS.website}
    </svg>
  );
}

function Glyph({
  n,
  size = 18
}) {
  return <SocialGlyph network={n} size={size} />;
}

export const SOCIAL_NETWORK_LABELS = LABELS;

function DockItem({
  link,
  mouseX,
  p,
  reduce
}) {
  const ref = React.useRef(null);
  const distance = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? x - (r.left + r.width / 2) : Infinity;
  });
  const target = useTransform(distance, [-130, 0, 130], [44, reduce ? 44 : 68, 44]);
  const size = useSpring(target, { stiffness: 320, damping: 24, mass: 0.4 });
  const icon = useTransform(size, [44, 68], [18, 26]);
  const label = link.label ?? LABELS[link.network];
  return (
    <motion.a ref={ref} href={link.href} target={link.network === "email" ? undefined : "_blank"} rel="noopener noreferrer" aria-label={label} className="group relative flex shrink-0 items-center justify-center rounded-2xl no-underline outline-none focus-visible:ring-2" style={{ width: size, height: size, background: p.bg, border: `1px solid ${p.border}`, color: p.text, ["--tw-ring-color"]: p.focus }}>
      <motion.span className="flex items-center justify-center" style={{ width: icon, height: icon }}>
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {GLYPHS[link.network]}
        </svg>
      </motion.span>
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-md text-[11.5px] font-semibold whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ padding: "3px 8px", background: p.fill, color: p.onFill }}>
        {label}
      </span>
    </motion.a>
  );
}

export function SocialLinks({
  links = DEFAULT_LINKS,
  variant = "icons",
  theme = "dark",
  className
}) {
  const p = PALETTES[theme];
  const reduce = Boolean(useReducedMotion());
  const mouseX = useMotionValue(Infinity);

  if (variant === "dock") {
    // A fixed width with room for the swell, so growing icons never push the page around.
    return (
      <nav aria-label="Social links" className={cn("inline-flex items-end justify-center rounded-3xl", className)} style={{ gap: 10, height: 80, width: links.length * 54 + 64, padding: "0 12px 10px", background: p.panel, border: `1px solid ${p.border}`, fontFamily: "Inter, sans-serif" }} onMouseMove={(e) => mouseX.set(e.clientX)} onMouseLeave={() => mouseX.set(Infinity)}>
        {links.map((l) => (
          <DockItem key={l.network + l.href} link={l} mouseX={mouseX} p={p} reduce={reduce} />
        ))}
      </nav>
    );
  }

  if (variant === "list") {
    return (
      <nav aria-label="Social links" className={cn("flex w-full flex-col overflow-hidden rounded-2xl", className)} style={{ background: p.panel, border: `1px solid ${p.border}`, fontFamily: "Inter, sans-serif" }}>
        {links.map((l, i) => (
          <motion.a key={l.network + l.href} href={l.href} target={l.network === "email" ? undefined : "_blank"} rel="noopener noreferrer" className="group flex items-center no-underline outline-none focus-visible:ring-2 focus-visible:ring-inset" style={{ gap: 14, padding: "13px 16px", borderTop: i ? `1px solid ${p.line}` : undefined, color: p.text, ["--tw-ring-color"]: p.focus }} initial="rest" whileHover="hover">
            <span className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl" style={{ width: 38, height: 38, background: p.bg, border: `1px solid ${p.border}` }}>
              <motion.span className="absolute inset-0" style={{ background: p.fill, originY: 1 }} variants={{ rest: { scaleY: 0 }, hover: { scaleY: 1 } }} transition={{ duration: reduce ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }} />
              <motion.span className="relative flex" variants={{ rest: { color: p.text }, hover: { color: p.onFill } }} transition={{ duration: 0.2 }}>
                <Glyph n={l.network} />
              </motion.span>
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[14px] font-semibold">
                {l.handle || l.label || LABELS[l.network]}
              </span>
              {l.handle && l.label ? (
                <span className="truncate text-[12.5px]" style={{ color: p.muted }}>
                  {l.label}
                </span>
              ) : null}
            </span>
            {l.followers && <span className="shrink-0 text-[12.5px] tabular-nums" style={{ color: p.muted }}>{l.followers}</span>}
            <motion.svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={p.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" variants={{ rest: { x: 0, y: 0 }, hover: { x: reduce ? 0 : 2, y: reduce ? 0 : -2 } }}>
              <path d="M7 17 17 7M8 7h9v9" />
            </motion.svg>
          </motion.a>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="Social links" className={cn("flex flex-wrap items-center", className)} style={{ gap: 8, fontFamily: "Inter, sans-serif" }}>
      {links.map((l, i) => (
        <motion.a
          key={l.network + l.href}
          href={l.href}
          target={l.network === "email" ? undefined : "_blank"}
          rel="noopener noreferrer"
          aria-label={l.label ?? LABELS[l.network]}
          className="relative flex items-center justify-center overflow-hidden rounded-full no-underline outline-none focus-visible:ring-2"
          style={{ width: 42, height: 42, background: p.bg, border: `1px solid ${p.border}`, ["--tw-ring-color"]: p.focus }}
          initial="rest"
          whileHover="hover"
          whileFocus="hover"
          whileTap={{ scale: 0.92 }}
        >
          <motion.span className="absolute inset-0 rounded-full" style={{ background: p.fill, originY: 1 }} variants={{ rest: { scaleY: 0 }, hover: { scaleY: 1 } }} transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }} />
          <motion.span className="relative flex" variants={{ rest: { color: p.text, rotate: 0 }, hover: { color: p.onFill, rotate: reduce ? 0 : i % 2 ? 8 : -8 } }} transition={{ type: "spring", stiffness: 400, damping: 18 }}>
            <Glyph n={l.network} />
          </motion.span>
        </motion.a>
      ))}
    </nav>
  );
}

export default SocialLinks;
