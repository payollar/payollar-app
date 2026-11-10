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
        "group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border/60 bg-card shadow-[0_14px_44px_-28px_rgba(15,23,42,0.4)] transition-all duration-300",
        !isComingSoon &&
          "hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_22px_56px_-30px_rgba(0,85,255,0.38)]",
        isComingSoon && "opacity-[0.92]"
      )}
    >
      <div className="relative aspect-[5/3.2] w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={type.image}
          alt=""
          className={cn(
            "h-full w-full object-cover transition-transform duration-700 ease-out",
            !isComingSoon && "group-hover:scale-[1.045]"
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5" />

        <div className="absolute left-3.5 top-3.5 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-primary shadow-sm backdrop-blur-sm">
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
          {isComingSoon ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-amber-700 shadow-sm backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5" />
              Coming soon
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur-sm">
              <BadgeCheck className="h-3.5 w-3.5 text-primary" />
              Available
            </span>
          )}
        </div>

        {!isComingSoon && listingCount > 0 ? (
          <div className="absolute bottom-3.5 right-3.5">
            <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              {listingCount} listing{listingCount === 1 ? "" : "s"}
            </span>
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
            {type.shortLabel}
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-[1.35rem]">
            {type.name}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground/90">
            {type.highlight}
          </p>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {type.description}
          </p>
        </div>

        <div className="mt-auto">
          {isComingSoon ? (
            <Button
              type="button"
              variant="outline"
              disabled
              className="h-11 w-full rounded-full border-border/60 text-sm text-muted-foreground"
            >
              Notify me later
            </Button>
          ) : (
            <Button
              asChild
              variant="marketing"
              className="h-11 w-full rounded-full text-sm font-semibold shadow-md shadow-primary/20"
            >
              <span className="inline-flex items-center justify-center gap-2">
                Browse {type.shortLabel.toLowerCase()}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Button>
          )}
        </div>
      </div>
    </article>
  );

  const wrapped = (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.07, 0.28) }}
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

  return wrapped;
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
    <div className="mt-12 space-y-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Partner listings
          </h3>
          <p className="text-sm text-muted-foreground">
            Jump into a station or inventory partner to schedule.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ type, listing }, index) => {
          const Icon = type.icon;
          return (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.25) }}
            >
              <Link
                href={`/media/schedule?type=${type.id}&listing=${listing.id}`}
                className="group block h-full"
              >
                <div className="flex h-full items-start gap-3.5 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/10">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
                    <Icon className="h-4 w-4" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/80">
                          {type.shortLabel}
                        </p>
                        <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                          {listing.name}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary/60 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    {listing.agency?.agencyName ? (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {listing.agency.agencyName}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
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
      <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:gap-6">
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
