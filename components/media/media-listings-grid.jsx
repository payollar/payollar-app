"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  MonitorPlay,
  Radio,
  Share2,
  PanelTop,
} from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const MEDIA_TYPES = [
  {
    id: "TV",
    name: "TV Media",
    shortLabel: "Television",
    buyLabel: "TV",
    href: "/products?type=TV",
    image: "/tv-media.jpg",
    description:
      "Reach millions with television advertising across local and national networks.",
    highlight: "Prime time & nationwide reach",
    icon: MonitorPlay,
  },
  {
    id: "RADIO",
    name: "Radio Media",
    shortLabel: "Radio",
    buyLabel: "radio",
    href: "/products?type=RADIO",
    image: "/radio-media.jpg",
    description:
      "Connect with audiences through AM/FM radio stations nationwide.",
    highlight: "Local stations & spot buys",
    icon: Radio,
  },
  {
    id: "DIGITAL",
    name: "Digital Media",
    shortLabel: "Digital",
    buyLabel: "digital",
    href: "/products?type=DIGITAL",
    image: "/digital-media.jpg",
    description:
      "Book digital platform shows and series distributed on social channels.",
    highlight: "Shows on social platforms",
    icon: Share2,
  },
  {
    id: "BILLBOARD",
    name: "Billboard Media",
    shortLabel: "Outdoor",
    buyLabel: "outdoor",
    href: "/products?type=BILLBOARD",
    image: "/billboard-media.jpg",
    description:
      "High-impact outdoor advertising in prime locations across cities.",
    highlight: "High-impact city placements",
    icon: PanelTop,
  },
];

function ChannelCard({ type, listingCount, index }) {
  const isComingSoon = Boolean(type.comingSoon);
  const Icon = type.icon;

  const inner = (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_10px_32px_-24px_rgba(15,23,42,0.35)] transition-all duration-300",
        !isComingSoon &&
          "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_40px_-28px_rgba(0,85,255,0.35)]",
        isComingSoon && "opacity-[0.92]"
      )}
    >
      <div className="relative aspect-[5/3.4] w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={type.image}
          alt=""
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 ease-out",
            !isComingSoon && "group-hover:scale-[1.03]"
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        <div className="absolute left-2 top-2 flex items-center gap-1">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/95 text-primary shadow-sm backdrop-blur-sm">
            <Icon className="h-3 w-3" strokeWidth={2} />
          </span>
          {isComingSoon ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 shadow-sm">
              <Clock className="h-2.5 w-2.5" />
              Soon
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-semibold text-foreground shadow-sm">
              <BadgeCheck className="h-2.5 w-2.5 text-primary" />
              Available
            </span>
          )}
        </div>

        {!isComingSoon && listingCount > 0 ? (
          <div className="absolute right-2 top-2">
            <span className="rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
              {listingCount}
            </span>
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2 pt-6">
          <h3 className="text-sm font-semibold tracking-tight text-white">
            {type.name}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-2.5 pb-2.5 pt-2.5">
        <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
          {type.highlight}
        </p>

        <div className="mt-auto">
          {isComingSoon ? (
            <Button
              type="button"
              variant="outline"
              disabled
              className="h-8 w-full rounded-full border-border/60 text-[11px] text-muted-foreground"
            >
              Soon
            </Button>
          ) : (
            <Button
              asChild
              variant="marketing"
              className="h-8 w-full rounded-full text-[11px] font-semibold shadow-sm shadow-primary/15"
            >
              <span className="inline-flex items-center justify-center gap-1">
                Buy {type.buyLabel}
                <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Button>
          )}
        </div>
      </div>
    </article>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.24) }}
      className="h-full"
    >
      {type.href && !isComingSoon ? (
        <Link href={type.href} className="block h-full">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </motion.div>
  );
}

export function MediaListingsGrid({ listingsByType }) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-2 items-stretch gap-3 md:grid-cols-4 md:gap-3.5">
        {MEDIA_TYPES.map((type, index) => {
          const listingCount = (listingsByType[type.id] || []).filter(
            (listing) => !listing.name?.toLowerCase().includes("payollar")
          ).length;
          return (
            <ChannelCard
              key={type.id}
              type={type}
              listingCount={listingCount}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}
