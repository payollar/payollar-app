"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  MapPin,
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
    href: "/products/digital-media",
    image: "/social-media.jpg",
    description:
      "Social, search, and video ads across digital platforms and networks.",
    highlight: "Social, search & video",
    icon: Share2,
  },
  {
    id: "BILLBOARD",
    name: "Billboard Media",
    shortLabel: "Outdoor",
    buyLabel: "outdoor",
    href: null,
    image: "/billboard.jpg",
    description:
      "High-impact outdoor advertising in prime locations across cities.",
    highlight: "High-impact city placements",
    comingSoon: true,
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

function PartnerListings({ listingsByType }) {
  const rows = MEDIA_TYPES.flatMap((type) => {
    if (type.comingSoon) return [];
    const listings = (listingsByType[type.id] || []).filter(
      (listing) => !listing.name?.toLowerCase().includes("payollar")
    );
    return listings.slice(0, 3).map((listing) => ({ type, listing }));
  });

  if (rows.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      <div>
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          Partner listings
        </h3>
        <p className="text-sm text-muted-foreground">
          Jump into a station or inventory partner to schedule.
        </p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ type, listing }, index) => {
          const Icon = type.icon;
          return (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}
            >
              <Link
                href={`/media/schedule?type=${type.id}&listing=${listing.id}`}
                className="group block h-full"
              >
                <div className="flex h-full items-start gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/10">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10">
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
                          {type.shortLabel}
                        </p>
                        <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                          {listing.name}
                        </p>
                      </div>
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    {listing.agency?.agencyName ? (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {listing.agency.agencyName}
                      </p>
                    ) : null}
                    <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                      {listing.location ? (
                        <span className="inline-flex items-center gap-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {listing.location}
                        </span>
                      ) : null}
                      {listing.reach ? <span>{listing.reach}</span> : null}
                      {listing.priceRange ? <span>{listing.priceRange}</span> : null}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
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
      <PartnerListings listingsByType={listingsByType} />
    </div>
  );
}
