import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Edit, Trash2, Tv, Radio, Biohazard as Billboard, Smartphone, Users, Building2 } from "lucide-react";
import { RateCardForm } from "./_components/rate-card-form";
import { ListingPackagesSection } from "./_components/listing-packages-section";
import { ListingTimeClassesSection } from "./_components/listing-time-classes-section";
import { CustomPackageDetailsSection } from "./_components/custom-package-details-section";
import { MediaAgencyPageShell } from "../_components/media-agency-page-shell";
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-theme";

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

  return (
    <MediaAgencyPageShell
      eyebrow="Listings"
      title="Custom packages"
      description="Configure custom package options and manage packages for your media listings."
      actions={
        <Button variant="black" className="rounded-full" asChild>
          <a href="#add-listing">
            <Plus className="mr-2 h-4 w-4" />
            Add listing
          </a>
        </Button>
      }
    >
      {/* Custom Package Settings */}
      <CustomPackageDetailsSection mediaAgency={mediaAgency} />

      {/* Add/Edit Listing Form */}
      <Card id="add-listing" className={DASHBOARD_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Media Listing
          </CardTitle>
          <CardDescription>
            Create a new media listing with custom package options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RateCardForm mediaAgencyId={mediaAgency.id} />
        </CardContent>
      </Card>

      {/* Existing Listings */}
      <Card className={DASHBOARD_CARD_CLASS}>
        <CardHeader>
          <CardTitle>Your Media Listings</CardTitle>
          <CardDescription>
            Manage your existing media listings and their custom package options
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mediaAgency.listings.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p className="text-lg font-semibold text-slate-950">No listings yet</p>
              <p className="mt-1 text-sm text-slate-500">Create your first media listing above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mediaAgency.listings.map((listing) => {
                const Icon = getMediaTypeIcon(listing.listingType);
                return (
                  <div
                    key={listing.id}
                    className="space-y-4 rounded-2xl border border-slate-100 bg-[#f7f8fc] p-5 sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-950">{listing.name}</h3>
                            <Badge
                              variant="outline"
                              className={
                                listing.status === "ACTIVE"
                                  ? "rounded-full border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : listing.status === "DRAFT"
                                    ? "rounded-full border-amber-200 bg-amber-50 text-amber-800"
                                    : "rounded-full border-slate-200 bg-white text-slate-700"
                              }
                            >
                              {listing.status}
                            </Badge>
                          </div>
                          {listing.network ? (
                            <p className="text-sm text-slate-500">{listing.network}</p>
                          ) : null}
                          <p className="mt-1 text-sm text-slate-400">
                            {listing.location}
                            {listing.frequency ? ` · ${listing.frequency}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-full border-slate-200">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 border-t border-slate-200/70 pt-4 md:grid-cols-3">
                      {listing.priceRange ? (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Price range
                          </p>
                          <p className="mt-1 text-lg font-semibold text-slate-950">{listing.priceRange}</p>
                        </div>
                      ) : null}
                      {listing.reach ? (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Reach
                          </p>
                          <p className="mt-1 text-sm text-slate-600">{listing.reach}</p>
                        </div>
                      ) : null}
                      {listing.rating && listing.rating > 0 ? (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Rating
                          </p>
                          <p className="mt-1 text-sm text-slate-600">{listing.rating.toFixed(1)} ⭐</p>
                        </div>
                      ) : null}
                    </div>

                    {listing.timeSlots.length > 0 ? (
                      <div className="border-t border-slate-200/70 pt-4">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                          Available time slots
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {listing.timeSlots.map((slot, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="rounded-full border-slate-200 bg-white text-slate-700"
                            >
                              {slot}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {listing.demographics.length > 0 ? (
                      <div className="border-t border-slate-200/70 pt-4">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                          Target demographics
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {listing.demographics.map((demo, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="rounded-full border-slate-200 bg-white text-slate-700"
                            >
                              {demo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <ListingPackagesSection listing={listing} />
                    <ListingTimeClassesSection listing={listing} />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </MediaAgencyPageShell>
  );
}
