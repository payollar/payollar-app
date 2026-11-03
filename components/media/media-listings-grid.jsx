"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight, BadgeCheck } from "lucide-react";
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

function ChannelCard({ type, filteredListings }) {
  const isComingSoon = Boolean(type.comingSoon);
  const listingCount = filteredListings.length;

  const card = (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card p-2.5 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.35)] transition-all duration-300 sm:p-3",
        !isComingSoon &&
          "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_50px_-28px_rgba(0,85,255,0.35)]",
        isComingSoon && "opacity-95"
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
        <img
          src={type.image}
          alt=""
          className={cn(
            "h-full w-full object-cover transition-transform duration-500",
            !isComingSoon && "group-hover:scale-[1.03]"
          )}
        />

        <div className="absolute left-2.5 top-2.5">
          {isComingSoon ? (
            <Badge className="gap-1 rounded-full border-0 bg-white/95 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm hover:bg-white/95">
              Coming soon
            </Badge>
          ) : (
            <Badge className="gap-1 rounded-full border-0 bg-white/95 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm hover:bg-white/95">
              <BadgeCheck className="h-3.5 w-3.5 text-primary" />
              Available
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-2.5 px-1 pb-1 pt-3.5 sm:px-1.5">
        <div className="space-y-2">
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

          {listingCount > 0 ? (
            <p className="text-sm font-semibold text-primary">
              {listingCount} partner listing{listingCount === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>

        <div className="mt-auto pt-1.5">
          {isComingSoon ? (
            <Button
              type="button"
              variant="outline"
              disabled
              className="h-10 w-full rounded-full border-border/60 text-sm text-muted-foreground"
            >
              Coming soon
            </Button>
          ) : (
            <Button
              asChild
              variant="marketing"
              className="h-10 w-full rounded-full text-sm font-semibold"
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

  return (
    <div className="space-y-3">
      {type.href && !isComingSoon ? (
        <Link href={type.href} className="block h-full">
          {card}
        </Link>
      ) : (
        card
      )}

      {filteredListings.length > 0 ? (
        <div className="space-y-2 px-0.5">
          {filteredListings.slice(0, 4).map((listing) => (
            <Link
              key={listing.id}
              href={`/media/schedule?type=${type.id}&listing=${listing.id}`}
              className="block"
            >
              <Card className="rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm transition-colors hover:border-primary/30 hover:bg-accent/40">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {listing.name}
                    </p>
                    {listing.agency?.agencyName ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {listing.agency.agencyName}
                      </p>
                    ) : null}
                    <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      {listing.location ? (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {listing.location}
                        </span>
                      ) : null}
                      {listing.reach ? <span>{listing.reach}</span> : null}
                      {listing.priceRange ? (
                        <span>{listing.priceRange}</span>
                      ) : null}
                      {listing.packages?.length > 0 ? (
                        <span className="font-medium text-primary">
                          {listing.packages.length} package
                          {listing.packages.length === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                </div>
              </Card>
            </Link>
          ))}
          {filteredListings.length > 4 && type.href ? (
            <Link
              href={type.href}
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              +{filteredListings.length - 4} more
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function MediaListingsGrid({ listingsByType }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {MEDIA_TYPES.map((type) => {
        const allListings = listingsByType[type.id] || [];
        const filteredListings = allListings.filter(
          (listing) => !listing.name?.toLowerCase().includes("payollar")
        );
        return (
          <ChannelCard
            key={type.id}
            type={type}
            filteredListings={filteredListings}
          />
        );
      })}
    </div>
  );
}
