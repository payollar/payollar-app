"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Clock, Star } from "lucide-react";
import Link from "next/link";

/**
 * Renders a media station card with station info:
 * Station info (name, network, rating, location, reach, air times, demographics)
 */
export function MediaStationCard({
  listing,
  mediaType = "TV",
  onSelectPackage,
  onCustomPackageClick,
  showCustomBuilder = false,
  onCustomPackageSubmit,
  CustomBuilderComponent,
}) {
  const timeSlots = listing.timeSlots || [];
  const demographics = listing.demographics || [];
  const packages = listing.packages || [];

  return (
    <Card className="overflow-hidden rounded-2xl bg-zinc-900/95 border-zinc-700 text-white">
      <div className="p-6">
        {/* Station Info */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-xl font-bold text-white">{listing.name}</h3>
              {listing.network && (
                <Badge variant="secondary" className="mt-1 bg-zinc-700/80 text-zinc-200 border-0">
                  {listing.network}
                </Badge>
              )}
            </div>
            {(listing.rating != null && listing.rating > 0) && (
              <div className="flex items-center space-x-1 shrink-0">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-white">{Number(listing.rating).toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="space-y-2 text-sm text-zinc-200">
            {listing.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>{listing.location}</span>
              </div>
            )}
            {listing.reach && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>{listing.reach}</span>
              </div>
            )}
            {timeSlots.length > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>{timeSlots.join(", ")}</span>
              </div>
            )}
          </div>

          {demographics.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-zinc-300">Target Demographics:</div>
              <div className="flex flex-wrap gap-1">
                {demographics.map((demo, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-zinc-800/80 text-zinc-200 border-zinc-600"
                  >
                    {demo}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {packages.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-zinc-300">Available Packages:</div>
              <div className="space-y-2">
                {packages.map((pkg) => (
                  <Button
                    key={pkg.id}
                    variant="outline"
                    size="sm"
                    className="w-full border-zinc-600 text-white hover:bg-zinc-700 justify-between"
                    onClick={() => onSelectPackage && onSelectPackage(listing.name, pkg, listing.id, listing.agencyId)}
                  >
                    <span>{pkg.name}</span>
                    <span className="font-semibold">₵{pkg.price.toLocaleString()}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <Link href={`/media/schedule?type=${listing.listingType}&listing=${listing.id}`}>
            <Button variant="outline" size="sm" className="border-zinc-600 text-white hover:bg-zinc-700 w-full">
              Schedule / Inquire
            </Button>
          </Link>
        </div>

      </div>
    </Card>
  );
}
