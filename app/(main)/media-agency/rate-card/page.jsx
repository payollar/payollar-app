import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Tv,
  Radio,
  Megaphone,
  Smartphone,
  Building2,
  Clock,
  Users,
} from "lucide-react";
import { RateCardForm } from "./_components/rate-card-form";
import { ListingPackagesSection } from "./_components/listing-packages-section";
import { ListingTimeClassesSection } from "./_components/listing-time-classes-section";
import { CustomPackageDetailsSection } from "./_components/custom-package-details-section";
import { MediaAgencyPageShell } from "../_components/media-agency-page-shell";
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

function getMediaTypeIcon(type) {
  switch (type) {
    case "TV":
      return Tv;
    case "RADIO":
      return Radio;
    case "BILLBOARD":
      return Megaphone;
    case "DIGITAL":
      return Smartphone;
    default:
      return Building2;
  }
}

export default async function MediaAgencyRateCardPage() {
  const user = await checkUser();

  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

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

  const listings = mediaAgency.listings;
  const packageCount = listings.reduce(
    (sum, listing) => sum + (listing.packages?.length || 0),
    0
  );
  const timeClassCount = listings.reduce(
    (sum, listing) => sum + (listing.timeClasses?.length || 0),
    0
  );

  return (
    <MediaAgencyPageShell
      eyebrow="Packages"
      title="Custom packages"
      description="Build package offers outside your smart rate card—defaults, listing packages, and time-class rates."
      actions={
        <Button variant="black" className="rounded-full" asChild>
          <a href="#add-listing">
            <Plus className="mr-2 h-4 w-4" />
            Add listing
          </a>
        </Button>
      }
    >
      <div
        className={cn(
          DASHBOARD_CARD_CLASS,
          "grid grid-cols-3 overflow-hidden"
        )}
      >
        {[
          { label: "Listings", value: listings.length, icon: Building2 },
          { label: "Packages", value: packageCount, icon: Package },
          { label: "Time classes", value: timeClassCount, icon: Clock },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={cn(
                "px-4 py-4 sm:px-5",
                index < 2 && "border-r border-slate-100"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {stat.label}
                </p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef2ff] text-[#0055ff]">
                  <Icon className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <CustomPackageDetailsSection mediaAgency={mediaAgency} />

      <section className={cn(DASHBOARD_CARD_CLASS, "overflow-hidden")}>
        <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Your media listings
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Packages and time-class rates for each outlet
            </p>
          </div>
          {listings.length > 0 ? (
            <a
              href="#add-listing"
              className="text-xs font-semibold text-[#0055ff] hover:underline"
            >
              + Add another
            </a>
          ) : null}
        </div>

        <div className="p-4 sm:p-5">
          {listings.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#0055ff]">
                <Package className="h-6 w-6" />
              </span>
              <p className="mt-3 text-base font-semibold text-slate-950">
                No listings yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Create your first media listing below, then add packages and time
                classes.
              </p>
              <Button
                asChild
                className="mt-4 h-9 rounded-full bg-[#0055ff] px-4 text-white hover:bg-[#0046d4]"
              >
                <a href="#add-listing">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create listing
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => {
                const Icon = getMediaTypeIcon(listing.listingType);
                return (
                  <article
                    key={listing.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-[#f7f8fc]"
                  >
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-semibold text-slate-950">
                              {listing.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-full text-[10px] font-semibold uppercase",
                                listing.status === "ACTIVE"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : listing.status === "DRAFT"
                                    ? "border-amber-200 bg-amber-50 text-amber-800"
                                    : "border-slate-200 bg-white text-slate-700"
                              )}
                            >
                              {listing.status}
                            </Badge>
                          </div>
                          {listing.network ? (
                            <p className="mt-0.5 text-sm text-slate-500">
                              {listing.network}
                            </p>
                          ) : null}
                          <p className="mt-0.5 text-sm text-slate-400">
                            {listing.location}
                            {listing.frequency ? ` · ${listing.frequency}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-full border-slate-200"
                        >
                          <Edit className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-px border-y border-slate-200 bg-slate-200 sm:grid-cols-4">
                      <div className="bg-[#f7f8fc] px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Price range
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-950">
                          {listing.priceRange || "—"}
                        </p>
                      </div>
                      <div className="bg-[#f7f8fc] px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Reach
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-950">
                          {listing.reach || "—"}
                        </p>
                      </div>
                      <div className="bg-[#f7f8fc] px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Packages
                        </p>
                        <p className="mt-1 text-sm font-semibold tabular-nums text-slate-950">
                          {listing.packages?.length || 0}
                        </p>
                      </div>
                      <div className="bg-[#f7f8fc] px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Time classes
                        </p>
                        <p className="mt-1 text-sm font-semibold tabular-nums text-slate-950">
                          {listing.timeClasses?.length || 0}
                        </p>
                      </div>
                    </div>

                    {(listing.timeSlots?.length > 0 ||
                      listing.demographics?.length > 0) && (
                      <div className="space-y-3 border-b border-slate-200 px-4 py-3 sm:px-5">
                        {listing.timeSlots?.length > 0 ? (
                          <div>
                            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Time slots
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {listing.timeSlots.map((slot, index) => (
                                <Badge
                                  key={index}
                                  className="rounded-full border-0 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                                >
                                  {slot}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        {listing.demographics?.length > 0 ? (
                          <div>
                            <p className="mb-1.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              <Users className="h-3 w-3" />
                              Demographics
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {listing.demographics.map((demo, index) => (
                                <Badge
                                  key={index}
                                  className="rounded-full border-0 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                                >
                                  {demo}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-2">
                      <ListingPackagesSection listing={listing} />
                      <ListingTimeClassesSection listing={listing} />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section
        id="add-listing"
        className={cn(DASHBOARD_CARD_CLASS, "scroll-mt-6 overflow-hidden")}
      >
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-slate-950">
            Add new media listing
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Create an outlet, then attach packages and time-class rates above.
          </p>
        </div>
        <div className="px-5 py-5 sm:px-6">
          <RateCardForm mediaAgencyId={mediaAgency.id} />
        </div>
      </section>
    </MediaAgencyPageShell>
  );
}
