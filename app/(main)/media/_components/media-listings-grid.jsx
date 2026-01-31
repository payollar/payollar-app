"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tv,
  Radio,
  Biohazard as Billboard,
  Smartphone,
  Users,
  Video,
  MapPin,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

const MEDIA_TYPES = [
  { id: "TV", name: "TV Media", icon: Tv, href: "/products/tv-media", image: "/tv-media.jpg", description: "Reach millions with television advertising across local and national networks." },
  { id: "RADIO", name: "Radio Media", icon: Radio, href: "/products/radio-media", image: "/radio-media.jpg", description: "Connect with audiences through AM/FM radio stations nationwide." },
  { id: "BILLBOARD", name: "Billboard Media", icon: Billboard, href: "/products/billboard-media", image: "/billboard.jpg", description: "High-impact outdoor advertising in prime locations across cities." },
  { id: "DIGITAL", name: "Digital Media", icon: Smartphone, href: "/products/digital-media", image: "/social-media2.jpg", description: "Social media, streaming, and online advertising platforms." },
  { id: "INFLUENCER_MARKETING", name: "Influencer Marketing", icon: Users, href: "/products/influencer-marketing", image: "/radio.jpeg", description: "Partner with top influencers to reach engaged audiences authentically." },
  { id: "VIDEO_CLIPPING", name: "Video Clipping", icon: Video, href: "/products/video-clipping", image: "/clipping.jpg", description: "Professional video editing and clipping services for all platforms." },
]

export function MediaListingsGrid({ listingsByType }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {MEDIA_TYPES.map((type) => {
        const listings = listingsByType[type.id] || []
        const Icon = type.icon
        return (
          <div key={type.id} className="space-y-4">
            <Link href={type.href}>
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer group overflow-hidden border-2 hover:border-primary/30">
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={type.image}
                    alt={type.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center justify-between w-[calc(100%-24px)]">
                    <h3 className="text-white text-xl font-bold">{type.name}</h3>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {listings.length} listing{listings.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
                <CardContent className="space-y-3 pt-4">
                  <p className="text-muted-foreground text-sm line-clamp-2">{type.description}</p>
                  <Button className="w-full bg-transparent" variant="outline" size="sm">
                    View {type.name.replace(" Media", "")} Listings
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
            {/* Registered listings for this type */}
            {listings.length > 0 ? (
              <div className="space-y-2 pl-1">
                {listings.slice(0, 4).map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/media/schedule?type=${type.id}&listing=${listing.id}`}
                    className="block"
                  >
                    <Card className="p-3 hover:bg-muted/50 transition-colors border">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{listing.name}</p>
                          {listing.agency?.agencyName && (
                            <p className="text-xs text-muted-foreground truncate">{listing.agency.agencyName}</p>
                          )}
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                            {listing.location && (
                              <span className="flex items-center gap-0.5">
                                <MapPin className="h-3 w-3" />
                                {listing.location}
                              </span>
                            )}
                            {listing.reach && <span>{listing.reach}</span>}
                            {listing.priceRange && <span>{listing.priceRange}</span>}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      </div>
                    </Card>
                  </Link>
                ))}
                {listings.length > 4 && (
                  <Link href={type.href} className="text-sm text-primary hover:underline">
                    +{listings.length - 4} more
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground pl-1">No registered listings yet.</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
