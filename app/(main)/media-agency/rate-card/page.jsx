import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import {
  agencyUsesCustomPackages,
  agencyUsesFixedPackages,
  agencyUsesSmartRateCard,
  effectiveAgencyMediaType,
  isMediaAgencyAdminEmail,
} from "@/lib/media-agency-type";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Package,
  Plus,
  Tv,
  Radio,
  Megaphone,
  Smartphone,
  Building2,
  FileText,
  Users,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { RateCardForm } from "./_components/rate-card-form";
import { ListingPackagesSection } from "./_components/listing-packages-section";
import { CustomPackageDetailsSection } from "./_components/custom-package-details-section";
import { ListingCoverUpload } from "./_components/listing-cover-upload";
import { ListingCardActions } from "./_components/listing-card-actions";
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

function listingNoun(scopedMediaType, { plural = false } = {}) {
  const type = String(scopedMediaType || "").toUpperCase();
  if (type === "BILLBOARD") return plural ? "sites" : "site";
  if (type === "DIGITAL") return plural ? "publishers" : "publisher";
  if (type === "TV" || type === "RADIO") return plural ? "stations" : "station";
  return plural ? "listings" : "listing";
}

export default async function MediaAgencyRateCardPage() {
  const user = await checkUser();

  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
    include: {
      listings: {
        orderBy: { createdAt: "desc" },
        include: {
          packages: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!mediaAgency) {
    redirect("/media-agency/settings");
  }

  const isMediaAdmin =
    isMediaAgencyAdminEmail(user.email) ||
    isMediaAgencyAdminEmail(mediaAgency.email);
  const scopedMediaType = effectiveAgencyMediaType({
    email: user.email,
    agencyEmail: mediaAgency.email,
    primaryMediaType: mediaAgency.primaryMediaType,
    isMediaAdmin,
  });
  const showSmartRateCard = agencyUsesSmartRateCard(scopedMediaType, {
    isMediaAdmin,
  });
  const showCustomPackages = agencyUsesCustomPackages(scopedMediaType, {
    isMediaAdmin,
  });
  if (!showCustomPackages) {
    redirect(
      showSmartRateCard ? "/media-agency/smart-rate-card" : "/media-agency"
    );
  }
  const packageFocused =
    isMediaAdmin ||
    agencyUsesFixedPackages(scopedMediaType) ||
    (mediaAgency.listings || []).some((l) =>
      agencyUsesFixedPackages(l.listingType)
    );

  mediaAgency.listings = (mediaAgency.listings || []).map((l) => ({
    ...l,
    packages: l.packages ?? [],
  }));

  const listings = mediaAgency.listings;
  const activeCount = listings.filter((l) => l.status === "ACTIVE").length;
  const packageCount = listings.reduce((sum, listing) => {
    if (!agencyUsesFixedPackages(listing.listingType)) return sum;
    return sum + (listing.packages?.length || 0);
  }, 0);

  const noun = listingNoun(scopedMediaType);
  const nounPlural = listingNoun(scopedMediaType, { plural: true });

  const pageDescription = isMediaAdmin
    ? "Create listings for any media type. Billboard and digital sell with packages here; TV and radio rates live on Smart rate card."
    : agencyUsesFixedPackages(scopedMediaType)
      ? `Add ${nounPlural}, covers, and rate packages buyers negotiate from on the marketplace.`
      : showSmartRateCard
        ? `Manage ${nounPlural} here. Publish everyday rates on Smart rate card — use this page for listing setup and special offers later.`
        : `Manage your media ${nounPlural} and packages in one place.`;

  return (
    <MediaAgencyPageShell
      eyebrow="Packages"
      title="Custom packages"
      description={pageDescription}
      actions={
        <Button variant="black" className="rounded-full" asChild>
          <a href="#add-listing">
            <Plus className="mr-2 h-4 w-4" />
            Add {noun}
          </a>
        </Button>
      }
    >
      <div
        className={cn(
          DASHBOARD_CARD_CLASS,
          "grid overflow-hidden",
          packageFocused ? "grid-cols-3" : "grid-cols-2"
        )}
      >
        {[
          {
            label: nounPlural.charAt(0).toUpperCase() + nounPlural.slice(1),
            value: listings.length,
            icon: Building2,
          },
          { label: "Active", value: activeCount, icon: FileText },
          ...(packageFocused
            ? [{ label: "Packages", value: packageCount, icon: Package }]
            : []),
        ].map((stat, index, arr) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={cn(
                "px-4 py-4 sm:px-5",
                index < arr.length - 1 && "border-r border-slate-100"
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
              Your {nounPlural}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {packageFocused
                ? "Edit details, covers, and packages buyers can book."
                : "Station setup lives here — everyday rates are on Smart rate card."}
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
                {agencyUsesFixedPackages(scopedMediaType) ? (
                  <Package className="h-6 w-6" />
                ) : (
                  <Building2 className="h-6 w-6" />
                )}
              </span>
              <p className="mt-3 text-base font-semibold text-slate-950">
                No {nounPlural} yet
              </p>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                {agencyUsesFixedPackages(scopedMediaType)
                  ? `Create your first ${noun}, add a cover, then attach rate packages.`
                  : showSmartRateCard
                    ? `Create a ${noun} here, then open Smart rate card to publish rates.`
                    : `Create your first ${noun} below to get started.`}
              </p>
              <Button
                asChild
                className="mt-4 h-9 rounded-full bg-[#0055ff] px-4 text-white hover:bg-[#0046d4]"
              >
                <a href="#add-listing">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create {noun}
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => {
                const Icon = getMediaTypeIcon(listing.listingType);
                const usesPackages = agencyUsesFixedPackages(
                  listing.listingType
                );
                const packageLen = listing.packages?.length || 0;
                const missingMapPin =
                  listing.listingType === "BILLBOARD" &&
                  (listing.latitude == null || listing.longitude == null);

                return (
                  <article
                    key={listing.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                  >
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
                          {listing.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={listing.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-white">
                              <Icon className="h-5 w-5" />
                            </div>
                          )}
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
                            {isMediaAdmin ? (
                              <Badge
                                variant="outline"
                                className="rounded-full border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase text-slate-600"
                              >
                                {String(listing.listingType).replaceAll(
                                  "_",
                                  " "
                                )}
                              </Badge>
                            ) : null}
                          </div>
                          {listing.network ? (
                            <p className="mt-0.5 text-sm text-slate-500">
                              {listing.network}
                            </p>
                          ) : null}
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              {listing.location || "No location"}
                            </span>
                            {listing.frequency ? (
                              <span>· {listing.frequency}</span>
                            ) : null}
                          </p>
                          {missingMapPin ? (
                            <p className="mt-1.5 text-xs font-medium text-amber-700">
                              Map pin missing — edit this site so buyers can
                              find it.
                            </p>
                          ) : null}
                          {usesPackages && packageLen === 0 ? (
                            <p className="mt-1.5 text-xs font-medium text-amber-700">
                              No packages yet — add at least one so buyers can
                              negotiate.
                            </p>
                          ) : null}
                          <div className="mt-2.5">
                            <ListingCoverUpload
                              listingId={listing.id}
                              value={listing.imageUrl || ""}
                              compact
                            />
                          </div>
                        </div>
                      </div>
                      <ListingCardActions listing={listing} />
                    </div>

                    <div
                      className={cn(
                        "grid gap-px border-y border-slate-200 bg-slate-200",
                        usesPackages
                          ? "grid-cols-2 sm:grid-cols-3"
                          : "grid-cols-2"
                      )}
                    >
                      <div className="bg-[#fafbfd] px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Price range
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-950">
                          {listing.priceRange || "—"}
                        </p>
                      </div>
                      <div className="bg-[#fafbfd] px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Reach
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-950">
                          {listing.reach || "—"}
                        </p>
                      </div>
                      {usesPackages ? (
                        <div className="bg-[#fafbfd] px-4 py-3 sm:col-auto col-span-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Packages
                          </p>
                          <p className="mt-1 text-sm font-semibold tabular-nums text-slate-950">
                            {packageLen}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    {(listing.timeSlots?.length > 0 ||
                      listing.demographics?.length > 0) && (
                      <div className="space-y-3 border-b border-slate-100 px-4 py-3 sm:px-5">
                        {listing.timeSlots?.length > 0 ? (
                          <div>
                            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Time slots
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {listing.timeSlots.map((slot, index) => (
                                <Badge
                                  key={index}
                                  className="rounded-full border-0 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
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
                                  className="rounded-full border-0 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                                >
                                  {demo}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div className="bg-[#fafbfd] p-4 sm:p-5">
                      {usesPackages ? (
                        <ListingPackagesSection listing={listing} />
                      ) : (
                        <div className="flex flex-col gap-3 rounded-2xl border border-[#0055ff]/12 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                          <div className="min-w-0">
                            <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                              <FileText className="h-4 w-4 text-[#0055ff]" />
                              Everyday rates → Smart rate card
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">
                              Build ad types, dayparts, and published rates
                              there. Keep this listing for cover, status, and
                              profile details.
                            </p>
                          </div>
                          <Button
                            asChild
                            size="sm"
                            className="h-9 shrink-0 rounded-full bg-[#0055ff] px-4 text-white hover:bg-[#0046d4]"
                          >
                            <Link href="/media-agency/smart-rate-card">
                              Open Smart rate card
                              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      )}
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
            Add new {noun}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {isMediaAdmin
              ? "Pick a media type, then add packages (billboard/digital) or finish rates on Smart rate card (TV/radio)."
              : agencyUsesFixedPackages(scopedMediaType)
                ? `Add the ${noun} buyers will see, then attach packages on the card above.`
                : showSmartRateCard
                  ? `Create the ${noun}, then publish rates on Smart rate card.`
                  : `Create a ${noun} to get started.`}
          </p>
        </div>
        <div className="px-5 py-5 sm:px-6">
          <RateCardForm
            mediaAgencyId={mediaAgency.id}
            primaryMediaType={scopedMediaType}
          />
        </div>
      </section>
    </MediaAgencyPageShell>
  );
}
