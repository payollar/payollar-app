"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BadgeCheck, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MEDIA_TYPES = [
  {
    id: "TV",
    name: "TV Media",
    href: "/products?type=TV",
    image: "/tv-media.jpg",
    description:
      "Reach millions with television advertising across local and national networks.",
    tags: ["Broadcast", "Prime time", "Nationwide"],
  },
  {
    id: "RADIO",
    name: "Radio Media",
    href: "/products?type=RADIO",
    image: "/radio-media.jpg",
    description:
      "Connect with audiences through AM/FM radio stations nationwide.",
    tags: ["AM/FM", "Local reach", "Spots"],
  },
  {
    id: "DIGITAL",
    name: "Digital Media",
    href: "/products/digital-media",
    image: "/social-media.jpg",
    description:
      "Social, search, and video ads across digital platforms and networks.",
    tags: ["Social", "Search", "Video"],
  },
  {
    id: "BILLBOARD",
    name: "Billboard Media",
    href: null,
    image: "/billboard.jpg",
    description:
      "High-impact outdoor advertising in prime locations across cities.",
    comingSoon: true,
    tags: ["Outdoor", "High impact", "Cities"],
  },
];

function ChannelCard({ type, listingCount }) {
  const isComingSoon = Boolean(type.comingSoon);

  const card = (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-border/50 bg-card p-2.5 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.35)] transition-all duration-300 sm:p-3",
        !isComingSoon &&
          "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_50px_-28px_rgba(0,85,255,0.35)]",
        isComingSoon && "opacity-95"
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.05rem] bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={type.image}
          alt=""
          className={cn(
            "h-full w-full object-cover transition-transform duration-500",
            !isComingSoon && "group-hover:scale-[1.03]"
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

        <div className="absolute left-2.5 top-2.5">
          {isComingSoon ? (
            <Badge className="gap-1 rounded-full border-0 bg-white/95 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm hover:bg-white/95">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              Coming soon
            </Badge>
          ) : (
            <Badge className="gap-1 rounded-full border-0 bg-white/95 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm hover:bg-white/95">
              <BadgeCheck className="h-3.5 w-3.5 text-primary" />
              Available
            </Badge>
          )}
        </div>

        {!isComingSoon && listingCount > 0 ? (
          <div className="absolute bottom-2.5 right-2.5">
            <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              {listingCount} listing{listingCount === 1 ? "" : "s"}
            </span>
          </div>
        ) : null}
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 px-1.5 pb-1.5 pt-4">
        <div className="space-y-2.5">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {type.name}
          </h3>

          <div className="flex flex-wrap gap-1.5">
            {type.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {type.description}
          </p>
        </div>

        <div className="mt-auto pt-1">
          {isComingSoon ? (
            <Button
              type="button"
              variant="outline"
              disabled
              className="h-11 w-full rounded-full border-border/60 text-sm text-muted-foreground"
            >
              Coming soon
            </Button>
          ) : (
            <Button
              asChild
              variant="marketing"
              className="h-11 w-full rounded-full text-sm font-semibold"
            >
              <span className="inline-flex items-center justify-center gap-2">
                Buy now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (type.href && !isComingSoon) {
    return (
      <Link href={type.href} className="block h-full">
        {card}
      </Link>
    );
  }

  return card;
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
    <div className="mt-10 space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Partner listings
          </h3>
          <p className="text-sm text-muted-foreground">
            Jump straight into a station or inventory partner to schedule.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ type, listing }) => (
          <Link
            key={listing.id}
            href={`/media/schedule?type=${type.id}&listing=${listing.id}`}
            className="group block"
          >
            <Card className="h-full rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {type.name.replace(" Media", "")}
                    </span>
                  </div>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {listing.name}
                  </p>
                  {listing.agency?.agencyName ? (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {listing.agency.agencyName}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
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
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary/70 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function MediaListingsGrid({ listingsByType }) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:gap-6">
        {MEDIA_TYPES.map((type) => {
          const listingCount = (listingsByType[type.id] || []).filter(
            (listing) => !listing.name?.toLowerCase().includes("payollar")
          ).length;
          return (
            <ChannelCard
              key={type.id}
              type={type}
              listingCount={listingCount}
            />
          );
        })}
      </div>
      <PartnerListings listingsByType={listingsByType} />
    </div>
  );
}
