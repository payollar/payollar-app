"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Radio,
  Tv,
  Megaphone,
  Smartphone,
  Users,
  Video,
  Eye,
  User,
  BadgeCheck,
  Pause,
  Play,
  Archive,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { updateMediaListingStatus } from "@/actions/admin";
import { toast } from "sonner";

const PANEL =
  "rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]";

const MEDIA_TYPE_ICONS = {
  TV: Tv,
  RADIO: Radio,
  BILLBOARD: Megaphone,
  DIGITAL: Smartphone,
  INFLUENCER_MARKETING: Users,
  VIDEO_CLIPPING: Video,
};

const STATUS_STYLES = {
  ACTIVE:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  INACTIVE:
    "border-amber-200 bg-amber-50 text-amber-800",
  DRAFT:
    "border-slate-200 bg-slate-50 text-slate-600",
  ARCHIVED:
    "border-rose-200 bg-rose-50 text-rose-700",
};

const STATUS_LABELS = {
  ACTIVE: "Live",
  INACTIVE: "Paused",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
};

function AgencyAvatar({ agency }) {
  if (agency.logoUrl) {
    return (
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <Image
          src={agency.logoUrl}
          alt={agency.agencyName}
          fill
          className="object-cover"
          sizes="48px"
          unoptimized={agency.logoUrl?.startsWith("http")}
        />
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
      <Building2 className="h-5 w-5" />
    </div>
  );
}

function InfoRow({ icon: Icon, children }) {
  if (!children) return null;
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <span className="truncate">{children}</span>
    </div>
  );
}

function listingCounts(listings = []) {
  return listings.reduce(
    (acc, listing) => {
      const status = String(listing.status || "DRAFT").toUpperCase();
      if (status === "ACTIVE") acc.live += 1;
      else if (status === "INACTIVE") acc.paused += 1;
      else if (status === "ARCHIVED") acc.archived += 1;
      else acc.draft += 1;
      return acc;
    },
    { live: 0, paused: 0, draft: 0, archived: 0 }
  );
}

function StatusBadge({ status }) {
  const key = String(status || "DRAFT").toUpperCase();
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        STATUS_STYLES[key] || STATUS_STYLES.DRAFT
      )}
    >
      {STATUS_LABELS[key] || key}
    </Badge>
  );
}

export function VerifiedMediaAgencies({ agencies: agenciesProp }) {
  const [agencies, setAgencies] = useState(agenciesProp || []);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [updatingListingId, setUpdatingListingId] = useState(null);

  useEffect(() => {
    setAgencies(agenciesProp || []);
  }, [agenciesProp]);

  useEffect(() => {
    if (!selectedAgency) return;
    const fresh = agencies.find((agency) => agency.id === selectedAgency.id);
    if (fresh) setSelectedAgency(fresh);
  }, [agencies, selectedAgency?.id]);

  const applyListingStatus = (agencyId, listingId, status) => {
    setAgencies((prev) =>
      prev.map((agency) => {
        if (agency.id !== agencyId) return agency;
        return {
          ...agency,
          listings: (agency.listings || []).map((listing) =>
            listing.id === listingId ? { ...listing, status } : listing
          ),
        };
      })
    );
  };

  const handleListingStatus = async (agencyId, listingId, status) => {
    if (updatingListingId) return;
    setUpdatingListingId(listingId);
    try {
      const formData = new FormData();
      formData.append("listingId", listingId);
      formData.append("status", status);
      const result = await updateMediaListingStatus(formData);
      if (!result?.success) {
        throw new Error("Could not update listing status");
      }
      applyListingStatus(agencyId, listingId, status);
      const labels = {
        ACTIVE: "Listing is live on the marketplace again",
        INACTIVE: "Listing paused — hidden from buyers",
        ARCHIVED: "Listing archived",
        DRAFT: "Listing set to draft",
      };
      toast.success(labels[status] || "Listing status updated");
    } catch (error) {
      toast.error(error?.message || "Failed to update listing status");
    } finally {
      setUpdatingListingId(null);
    }
  };

  return (
    <section className={cn(PANEL, "overflow-hidden")}>
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-end sm:justify-between md:px-5">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Verified agencies
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Pause a listing to hide it from the marketplace without deleting it.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
          <BadgeCheck className="h-4 w-4 text-emerald-600" />
          <span className="font-semibold tabular-nums text-slate-950">
            {agencies.length}
          </span>
          <span>verified</span>
        </div>
      </div>

      <div className="p-3 md:p-4">
        {agencies.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white">
              <BadgeCheck className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold text-slate-950">
              No verified agencies yet
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Approved agencies will appear here with their listings so you can
              pause or restore marketplace visibility.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {agencies.map((agency) => {
              const listings = agency.listings || [];
              const counts = listingCounts(listings);
              const bookingCount = agency._count?.bookings || 0;

              return (
                <article
                  key={agency.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50/70"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <AgencyAvatar agency={agency} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-slate-950">
                            {agency.agencyName}
                          </h3>
                          <Badge
                            variant="outline"
                            className="rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
                          >
                            Verified
                          </Badge>
                        </div>

                        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                          {agency.user ? (
                            <InfoRow icon={User}>
                              {agency.user.name || agency.user.email}
                            </InfoRow>
                          ) : null}
                          <InfoRow icon={Mail}>{agency.email}</InfoRow>
                          <InfoRow icon={Phone}>{agency.phone}</InfoRow>
                          <InfoRow icon={MapPin}>
                            {[agency.city, agency.region]
                              .filter(Boolean)
                              .join(", ")}
                          </InfoRow>
                          {agency.website ? (
                            <div className="flex min-w-0 items-center gap-2 text-sm">
                              <Globe className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                              <a
                                href={agency.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate font-medium text-slate-950 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-950"
                              >
                                {agency.website}
                              </a>
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                            Live:{" "}
                            <span className="font-semibold">{counts.live}</span>
                          </span>
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                            Paused:{" "}
                            <span className="font-semibold">
                              {counts.paused}
                            </span>
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                            Bookings:{" "}
                            <span className="font-semibold text-slate-950">
                              {bookingCount}
                            </span>
                          </span>
                        </div>

                        {listings.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {listings.slice(0, 6).map((listing) => {
                              const Icon =
                                MEDIA_TYPE_ICONS[listing.listingType] ||
                                Building2;
                              return (
                                <Badge
                                  key={listing.id}
                                  variant="outline"
                                  className={cn(
                                    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                                    STATUS_STYLES[
                                      String(listing.status || "DRAFT").toUpperCase()
                                    ] || STATUS_STYLES.DRAFT
                                  )}
                                >
                                  <Icon className="mr-1 h-3 w-3" />
                                  {listing.name}
                                  <span className="ml-1 opacity-70">
                                    ·{" "}
                                    {STATUS_LABELS[
                                      String(listing.status || "DRAFT").toUpperCase()
                                    ] || listing.status}
                                  </span>
                                </Badge>
                              );
                            })}
                            {listings.length > 6 ? (
                              <Badge
                                variant="outline"
                                className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600"
                              >
                                +{listings.length - 6} more
                              </Badge>
                            ) : null}
                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-slate-400">
                            No listings published yet.
                          </p>
                        )}

                        <p className="mt-3 text-xs text-slate-400">
                          Verified {format(new Date(agency.updatedAt), "PPp")}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAgency(agency)}
                      className="h-9 shrink-0 rounded-full border-slate-200 px-3 text-slate-700 hover:bg-slate-100"
                    >
                      <Eye className="mr-1.5 h-4 w-4" />
                      Manage listings
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={!!selectedAgency}
        onOpenChange={() => setSelectedAgency(null)}
      >
        <DialogContent className="mx-2 max-h-[90vh] max-w-3xl overflow-y-auto border-slate-200 bg-white text-slate-900 sm:mx-auto">
          {selectedAgency ? (
            <>
              <DialogHeader>
                <div className="flex flex-col items-center gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:gap-4">
                  {selectedAgency.logoUrl ? (
                    <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 sm:h-24 sm:w-24">
                      <Image
                        src={selectedAgency.logoUrl}
                        alt={selectedAgency.agencyName}
                        fill
                        className="object-cover"
                        sizes="96px"
                        unoptimized={selectedAgency.logoUrl?.startsWith("http")}
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-950 text-white sm:h-24 sm:w-24">
                      <Building2 className="h-7 w-7" />
                    </div>
                  )}
                  <div className="min-w-0 text-center sm:text-left">
                    <DialogTitle className="text-lg font-semibold text-slate-950 sm:text-2xl">
                      {selectedAgency.agencyName}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-slate-500">
                      Pause hides a listing from buyers. Unpause makes it live
                      again.
                    </DialogDescription>
                    <Badge
                      variant="outline"
                      className="mt-3 rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
                    >
                      Verified
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 py-2">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-slate-950">
                    Agency information
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        label: "Contact person",
                        value: selectedAgency.contactName,
                      },
                      { label: "Email", value: selectedAgency.email },
                      { label: "Phone", value: selectedAgency.phone },
                      {
                        label: "Location",
                        value: [
                          selectedAgency.city,
                          selectedAgency.region,
                          selectedAgency.country,
                        ]
                          .filter(Boolean)
                          .join(", "),
                      },
                    ]
                      .filter((item) => item.value)
                      .map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <p className="text-xs text-slate-500">{item.label}</p>
                          <p className="mt-1 break-words text-sm font-medium text-slate-950">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    {selectedAgency.website ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                        <p className="text-xs text-slate-500">Website</p>
                        <a
                          href={selectedAgency.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block break-all text-sm font-medium text-slate-950 underline decoration-slate-300 underline-offset-2"
                        >
                          {selectedAgency.website}
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950">
                        Media listings
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Paused listings stay in the agency dashboard but are
                        hidden from Media marketplace buyers.
                      </p>
                    </div>
                    {selectedAgency.listings?.length ? (
                      <span className="text-xs font-medium text-slate-500">
                        {selectedAgency.listings.length} total
                      </span>
                    ) : null}
                  </div>

                  {!selectedAgency.listings?.length ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                      This agency has no listings yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedAgency.listings.map((listing) => {
                        const Icon =
                          MEDIA_TYPE_ICONS[listing.listingType] || Building2;
                        const status = String(
                          listing.status || "DRAFT"
                        ).toUpperCase();
                        const busy = updatingListingId === listing.id;
                        const isLive = status === "ACTIVE";
                        const isPaused = status === "INACTIVE";

                        return (
                          <div
                            key={listing.id}
                            className="rounded-2xl border border-slate-200 bg-white p-3"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                              {listing.imageUrl ? (
                                <div className="relative h-28 w-full overflow-hidden rounded-xl border border-slate-200 sm:h-16 sm:w-16">
                                  <Image
                                    src={listing.imageUrl}
                                    alt={listing.name}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                    unoptimized={listing.imageUrl?.startsWith(
                                      "http"
                                    )}
                                  />
                                </div>
                              ) : (
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
                                  <Icon className="h-5 w-5" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <h4 className="text-sm font-semibold text-slate-950">
                                    {listing.name}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className="rounded-full border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600"
                                  >
                                    {listing.listingType}
                                  </Badge>
                                  <StatusBadge status={status} />
                                </div>
                                <div className="space-y-1 text-sm text-slate-600">
                                  {listing.network ? (
                                    <p>Network: {listing.network}</p>
                                  ) : null}
                                  {listing.location ? (
                                    <p>Location: {listing.location}</p>
                                  ) : null}
                                  {listing.reach ? (
                                    <p>Reach: {listing.reach}</p>
                                  ) : null}
                                  {listing.priceRange ? (
                                    <p>Price range: {listing.priceRange}</p>
                                  ) : null}
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  {isLive ? (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      disabled={busy}
                                      onClick={() =>
                                        handleListingStatus(
                                          selectedAgency.id,
                                          listing.id,
                                          "INACTIVE"
                                        )
                                      }
                                      className="h-8 rounded-full border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
                                    >
                                      {busy ? (
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Pause className="mr-1.5 h-3.5 w-3.5" />
                                      )}
                                      Pause listing
                                    </Button>
                                  ) : null}
                                  {isPaused ||
                                  status === "DRAFT" ||
                                  status === "ARCHIVED" ? (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      disabled={busy}
                                      onClick={() =>
                                        handleListingStatus(
                                          selectedAgency.id,
                                          listing.id,
                                          "ACTIVE"
                                        )
                                      }
                                      className="h-8 rounded-full border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                    >
                                      {busy ? (
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Play className="mr-1.5 h-3.5 w-3.5" />
                                      )}
                                      Unpause / make live
                                    </Button>
                                  ) : null}
                                  {status !== "ARCHIVED" ? (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      disabled={busy}
                                      onClick={() =>
                                        handleListingStatus(
                                          selectedAgency.id,
                                          listing.id,
                                          "ARCHIVED"
                                        )
                                      }
                                      className="h-8 rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                                    >
                                      <Archive className="mr-1.5 h-3.5 w-3.5" />
                                      Archive
                                    </Button>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
