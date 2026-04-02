"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MEDIA_TYPES = [
  {
    id: "TV",
    name: "TV Media",
    href: "/products/tv-media",
    image: "/tv-media.jpg",
    description: "Reach millions with television advertising across local and national networks.",
  },
  {
    id: "RADIO",
    name: "Radio Media",
    href: "/products/radio-media",
    image: "/radio-media.jpg",
    description: "Connect with audiences through AM/FM radio stations nationwide.",
  },
  {
    id: "BILLBOARD",
    name: "Billboard Media",
    href: "/products/billboard-media",
    image: "/billboard.jpg",
    description: "High-impact outdoor advertising in prime locations across cities.",
  },
  {
    id: "DIGITAL",
    name: "Digital Media",
    href: "/products/digital-media",
    image: "/social-media2.jpg",
    description: "Social media, streaming, and online advertising platforms.",
  },
  {
    id: "INFLUENCER_MARKETING",
    name: "Influencer Marketing",
    href: "/products/influencer-marketing",
    image: "/radio.jpeg",
    description: "Partner with top influencers to reach engaged audiences authentically.",
  },
  {
    id: "VIDEO_CLIPPING",
    name: "Video Clipping",
    href: "/products/video-clipping",
    image: "/clipping.jpg",
    description: "Professional video editing and clipping services for all platforms.",
  },
];

export function MediaListingsGrid({ listingsByType }) {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {MEDIA_TYPES.map((type) => {
        const allListings = listingsByType[type.id] || [];
        const filteredListings = allListings.filter(
          (listing) => !listing.name?.toLowerCase().includes("payollar")
        );
        return (
          <div key={type.id} className="space-y-4">
            <Link href={type.href} className="block">
              <Card
                className={cn(
                  "group h-full overflow-hidden rounded-xl border border-foreground/10 bg-cardbox shadow-lg transition-all duration-500",
                  "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 lg:rounded-2xl"
                )}
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={type.image}
                    alt={type.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-bold text-white drop-shadow-sm md:text-xl">{type.name}</h3>
                  </div>
                </div>
                <CardContent className="space-y-3 border-t border-border/40 pt-4">
                  <p className="line-clamp-2 text-sm text-muted-foreground">{type.description}</p>
                  <div className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-primary/35 bg-transparent text-sm font-medium text-foreground transition-colors group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:text-primary">
                    Buy {type.name}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            {filteredListings.length > 0 && (
              <div className="space-y-2 pl-0.5">
                {filteredListings.slice(0, 4).map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/media/schedule?type=${type.id}&listing=${listing.id}`}
                    className="block"
                  >
                    <Card className="rounded-xl border border-foreground/10 bg-cardbox/90 p-3 transition-colors hover:border-primary/30 hover:bg-cardbox">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{listing.name}</p>
                          {listing.agency?.agencyName && (
                            <p className="truncate text-xs text-muted-foreground">{listing.agency.agencyName}</p>
                          )}
                          <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                            {listing.location && (
                              <span className="flex items-center gap-0.5">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {listing.location}
                              </span>
                            )}
                            {listing.reach && <span>{listing.reach}</span>}
                            {listing.priceRange && <span>{listing.priceRange}</span>}
                          </div>
                        </div>
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                      </div>
                    </Card>
                  </Link>
                ))}
                {filteredListings.length > 4 && (
                  <Link href={type.href} className="text-sm font-medium text-primary hover:underline">
                    +{filteredListings.length - 4} more
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
