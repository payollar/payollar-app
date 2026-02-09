import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Edit, Trash2, Tv, Radio, Biohazard as Billboard, Smartphone, Users, Building2 } from "lucide-react";
import { RateCardForm } from "./_components/rate-card-form";
import { ListingPackagesSection } from "./_components/listing-packages-section";
import { ListingTimeClassesSection } from "./_components/listing-time-classes-section";

export default async function MediaAgencyRateCardPage() {
  const user = await checkUser();

  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  // Don't include packages/timeClasses to avoid Prisma errors if tables don't exist
  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
    include: {
      listings: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!mediaAgency) {
    redirect("/media-agency/settings");
  }

  mediaAgency.listings = (mediaAgency.listings || []).map((l) => ({
    ...l,
    packages: l.packages ?? [],
    timeClasses: l.timeClasses ?? [],
  }));

  const getMediaTypeIcon = (type) => {
    switch (type) {
      case "TV":
        return Tv;
      case "RADIO":
        return Radio;
      case "BILLBOARD":
        return Billboard;
      case "DIGITAL":
        return Smartphone;
      default:
        return Building2;
    }
  };

  const getMediaTypeColor = (type) => {
    switch (type) {
      case "TV":
        return "text-blue-500";
      case "RADIO":
        return "text-purple-500";
      case "BILLBOARD":
        return "text-orange-500";
      case "DIGITAL":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rate Card</h1>
          <p className="text-muted-foreground">
            Manage pricing and packages for your media listings
          </p>
        </div>
        <Button asChild>
          <a href="#add-listing">
            <Plus className="h-4 w-4 mr-2" />
            Add Listing
          </a>
        </Button>
      </div>

      {/* Add/Edit Listing Form */}
      <Card id="add-listing">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Media Listing
          </CardTitle>
          <CardDescription>
            Create a new media listing with pricing and packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RateCardForm mediaAgencyId={mediaAgency.id} />
        </CardContent>
      </Card>

      {/* Existing Listings */}
      <Card>
        <CardHeader>
          <CardTitle>Your Media Listings</CardTitle>
          <CardDescription>
            Manage your existing media listings and their pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mediaAgency.listings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No listings yet</p>
              <p className="text-sm">Create your first media listing above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mediaAgency.listings.map((listing) => {
                const Icon = getMediaTypeIcon(listing.listingType);
                const iconColor = getMediaTypeColor(listing.listingType);
                return (
                  <div
                    key={listing.id}
                    className="border rounded-lg p-6 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-muted ${iconColor}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{listing.name}</h3>
                            <Badge
                              variant={
                                listing.status === "ACTIVE" ? "default" :
                                listing.status === "DRAFT" ? "secondary" :
                                "outline"
                              }
                            >
                              {listing.status}
                            </Badge>
                          </div>
                          {listing.network && (
                            <p className="text-sm text-muted-foreground">{listing.network}</p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            {listing.location}
                            {listing.frequency && ` • ${listing.frequency}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                      {listing.priceRange && (
                        <div>
                          <p className="text-sm font-medium mb-1">Price Range</p>
                          <p className="text-lg font-semibold">{listing.priceRange}</p>
                        </div>
                      )}
                      {listing.reach && (
                        <div>
                          <p className="text-sm font-medium mb-1">Reach</p>
                          <p className="text-sm text-muted-foreground">{listing.reach}</p>
                        </div>
                      )}
                      {listing.rating && listing.rating > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Rating</p>
                          <p className="text-sm text-muted-foreground">{listing.rating.toFixed(1)} ⭐</p>
                        </div>
                      )}
                    </div>

                    {listing.timeSlots.length > 0 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Available Time Slots</p>
                        <div className="flex flex-wrap gap-2">
                          {listing.timeSlots.map((slot, index) => (
                            <Badge key={index} variant="outline">
                              {slot}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {listing.demographics.length > 0 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Target Demographics</p>
                        <div className="flex flex-wrap gap-2">
                          {listing.demographics.map((demo, index) => (
                            <Badge key={index} variant="secondary">
                              {demo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <ListingPackagesSection listing={listing} />
                    <ListingTimeClassesSection listing={listing} />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
