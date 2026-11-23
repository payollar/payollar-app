"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  BadgeCheck,
  Pause,
  Play,
  Archive,
  Loader2,
  Search,
  SlidersHorizontal,
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
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  INACTIVE: "border-amber-200 bg-amber-50 text-amber-800",
  DRAFT: "border-slate-200 bg-slate-50 text-slate-600",
  ARCHIVED: "border-rose-200 bg-rose-50 text-rose-700",
};

const STATUS_LABELS = {
  ACTIVE: "Live",
  INACTIVE: "Paused",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
};

function normalizeStatus(status) {
  return String(status || "DRAFT").toUpperCase();
}

function listingCounts(listings = []) {
  return listings.reduce(
    (acc, listing) => {
      const status = normalizeStatus(listing.status);
      if (status === "ACTIVE") acc.live += 1;
      else if (status === "INACTIVE") acc.paused += 1;
      else if (status === "ARCHIVED") acc.archived += 1;
      else acc.draft += 1;
      return acc;
    },
    { live: 0, paused: 0, draft: 0, archived: 0 }
  );
}

function AgencyAvatar({ agency, size = "md" }) {
  const box =
    size === "lg"
      ? "h-14 w-14 rounded-2xl"
      : "h-10 w-10 rounded-xl";
  if (agency.logoUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden border border-slate-200 bg-slate-100",
          box
        )}
      >
        <Image
          src={agency.logoUrl}
          alt={agency.agencyName}
          fill
          className="object-cover"
          sizes={size === "lg" ? "56px" : "40px"}
          unoptimized={agency.logoUrl?.startsWith("http")}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-slate-950 text-white",
        box
      )}
    >
      <Building2 className={size === "lg" ? "h-6 w-6" : "h-4 w-4"} />
    </div>
  );
}

function StatusBadge({ status }) {
  const key = normalizeStatus(status);
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        STATUS_STYLES[key] || STATUS_STYLES.DRAFT
      )}
    >
      {STATUS_LABELS[key] || key}
    </Badge>
  );
}

function CountPill({ label, value, tone = "slate" }) {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-600",
    live: "border-emerald-200/80 bg-emerald-50 text-emerald-800",
    paused: "border-amber-200/80 bg-amber-50 text-amber-900",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tones[tone] || tones.slate
      )}
    >
      {label}
      <span className="font-semibold tabular-nums text-inherit">{value}</span>
    </span>
  );
}

function agencySearchBlob(agency) {
  return [
    agency.agencyName,
    agency.contactName,
    agency.email,
    agency.phone,
    agency.city,
    agency.region,
    agency.website,
    ...(agency.listings || []).map((listing) => listing.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function VerifiedMediaAgencies({
  agencies: agenciesProp,
  onAgenciesChange,
}) {
  const [agencies, setAgencies] = useState(agenciesProp || []);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [updatingListingId, setUpdatingListingId] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [listingFilter, setListingFilter] = useState("all");

  useEffect(() => {
    setAgencies(agenciesProp || []);
  }, [agenciesProp]);

  useEffect(() => {
    if (!selectedAgency) return;
    const fresh = agencies.find((agency) => agency.id === selectedAgency.id);
    if (fresh) setSelectedAgency(fresh);
  }, [agencies, selectedAgency?.id]);

  const filteredAgencies = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agencies.filter((agency) => {
      const counts = listingCounts(agency.listings);
      if (filter === "live" && counts.live === 0) return false;
      if (filter === "paused" && counts.paused === 0) return false;
      if (filter === "empty" && (agency.listings || []).length > 0) return false;
      if (q && !agencySearchBlob(agency).includes(q)) return false;
      return true;
    });
  }, [agencies, filter, query]);

  const applyListingStatus = (agencyId, listingId, status) => {
    setAgencies((prev) => {
      const next = prev.map((agency) => {
        if (agency.id !== agencyId) return agency;
        return {
          ...agency,
          listings: (agency.listings || []).map((listing) =>
            listing.id === listingId ? { ...listing, status } : listing
          ),
        };
      });
      onAgenciesChange?.(next);
      return next;
    });
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
        ACTIVE: "Listing is live again",
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

  const selectedListings = useMemo(() => {
    const listings = selectedAgency?.listings || [];
    if (listingFilter === "all") return listings;
    return listings.filter(
      (listing) => normalizeStatus(listing.status) === listingFilter.toUpperCase()
    );
  }, [selectedAgency, listingFilter]);

  const selectedCounts = listingCounts(selectedAgency?.listings);

  return (
    <section className={cn(PANEL, "overflow-hidden")}>
      <div className="border-b border-slate-100 px-4 py-4 md:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Verified agencies
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Search partners, then pause listings to hide them from the
              marketplace.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
            <BadgeCheck className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold tabular-nums text-slate-950">
              {filteredAgencies.length}
            </span>
            <span>shown</span>
            <span className="text-slate-300">·</span>
            <span className="tabular-nums">{agencies.length} total</span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search agency, contact, email, or listing…"
              className="h-10 rounded-xl border-slate-200 bg-white pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
            </span>
            {[
              { id: "all", label: "All" },
              { id: "live", label: "Has live" },
              { id: "paused", label: "Has paused" },
              { id: "empty", label: "No listings" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={cn(
                  "h-8 rounded-full border px-3 text-xs font-semibold transition",
                  filter === item.id
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-2 md:p-3">
        {filteredAgencies.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white">
              <BadgeCheck className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold text-slate-950">
              {agencies.length === 0
                ? "No verified agencies yet"
                : "No agencies match this filter"}
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {agencies.length === 0
                ? "Approved agencies will appear here with listing controls."
                : "Try another search or clear the filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:grid">
              <span>Agency</span>
              <span>Listings</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredAgencies.map((agency) => {
                const listings = agency.listings || [];
                const counts = listingCounts(listings);
                const contactBits = [
                  agency.contactName,
                  agency.email,
                  agency.phone,
                  [agency.city, agency.region].filter(Boolean).join(", "),
                ].filter(Boolean);
                const preview = listings.slice(0, 3);

                return (
                  <article
                    key={agency.id}
                    className="grid gap-3 px-3 py-3 transition-colors hover:bg-slate-50/80 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-center md:px-4"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <AgencyAvatar agency={agency} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-slate-950">
                            {agency.agencyName}
                          </h3>
                          <Badge
                            variant="outline"
                            className="rounded-full border-emerald-200 bg-emerald-50 px-2 py-0 text-[10px] font-semibold uppercase tracking-wide text-emerald-700"
                          >
                            Verified
                          </Badge>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {contactBits.join(" · ") || "No contact details"}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Verified{" "}
                          {format(new Date(agency.updatedAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        <CountPill label="Live" value={counts.live} tone="live" />
                        <CountPill
                          label="Paused"
                          value={counts.paused}
                          tone="paused"
                        />
                        <CountPill
                          label="Bookings"
                          value={agency._count?.bookings || 0}
                        />
                      </div>
                      {preview.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {preview.map((listing) => {
                            const Icon =
                              MEDIA_TYPE_ICONS[listing.listingType] || Building2;
                            return (
                              <span
                                key={listing.id}
                                className={cn(
                                  "inline-flex max-w-full items-center gap-1 truncate rounded-full border px-2 py-0.5 text-[11px] font-medium",
                                  STATUS_STYLES[
                                    normalizeStatus(listing.status)
                                  ] || STATUS_STYLES.DRAFT
                                )}
                              >
                                <Icon className="h-3 w-3 shrink-0" />
                                <span className="truncate">{listing.name}</span>
                              </span>
                            );
                          })}
                          {listings.length > 3 ? (
                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500">
                              +{listings.length - 3}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">
                          No listings published yet
                        </p>
                      )}
                    </div>

                    <div className="flex md:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setListingFilter("all");
                          setSelectedAgency(agency);
                        }}
                        className="h-9 w-full rounded-full border-slate-200 px-3.5 text-slate-700 hover:bg-white md:w-auto"
                      >
                        Manage listings
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={!!selectedAgency}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAgency(null);
            setListingFilter("all");
          }
        }}
      >
        <DialogContent className="mx-2 max-h-[92vh] max-w-3xl gap-0 overflow-hidden border-slate-200 bg-white p-0 text-slate-900 sm:mx-auto">
          {selectedAgency ? (
            <>
              <DialogHeader className="space-y-0 border-b border-slate-100 px-5 py-4 text-left">
                <div className="flex items-start gap-3 pr-8">
                  <AgencyAvatar agency={selectedAgency} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <DialogTitle className="text-lg font-semibold tracking-tight text-slate-950">
                        {selectedAgency.agencyName}
                      </DialogTitle>
                      <Badge
                        variant="outline"
                        className="rounded-full border-emerald-200 bg-emerald-50 px-2 py-0 text-[10px] font-semibold uppercase tracking-wide text-emerald-700"
                      >
                        Verified
                      </Badge>
                    </div>
                    <DialogDescription className="mt-1 text-sm text-slate-500">
                      Pause hides a listing from buyers. Unpause makes it live
                      again.
                    </DialogDescription>
                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                      {selectedAgency.contactName ? (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {selectedAgency.contactName}
                        </span>
                      ) : null}
                      {selectedAgency.email ? (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {selectedAgency.email}
                        </span>
                      ) : null}
                      {selectedAgency.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {selectedAgency.phone}
                        </span>
                      ) : null}
                      {[selectedAgency.city, selectedAgency.region]
                        .filter(Boolean)
                        .join(", ") ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {[selectedAgency.city, selectedAgency.region]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      ) : null}
                      {selectedAgency.website ? (
                        <a
                          href={selectedAgency.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-slate-700 underline decoration-slate-300 underline-offset-2"
                        >
                          <Globe className="h-3 w-3" />
                          Website
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="max-h-[calc(92vh-9rem)] overflow-y-auto px-5 py-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">
                      Media listings
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Paused listings stay in the agency dashboard but stay off
                      the marketplace.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <CountPill label="Live" value={selectedCounts.live} tone="live" />
                    <CountPill
                      label="Paused"
                      value={selectedCounts.paused}
                      tone="paused"
                    />
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap gap-1.5">
                  {[
                    { id: "all", label: "All" },
                    { id: "ACTIVE", label: "Live" },
                    { id: "INACTIVE", label: "Paused" },
                    { id: "DRAFT", label: "Draft" },
                    { id: "ARCHIVED", label: "Archived" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setListingFilter(item.id)}
                      className={cn(
                        "h-8 rounded-full border px-3 text-xs font-semibold transition",
                        listingFilter === item.id
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {!selectedAgency.listings?.length ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                    This agency has no listings yet.
                  </div>
                ) : selectedListings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                    No listings in this status.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedListings.map((listing) => {
                      const Icon =
                        MEDIA_TYPE_ICONS[listing.listingType] || Building2;
                      const status = normalizeStatus(listing.status);
                      const busy = updatingListingId === listing.id;
                      const isLive = status === "ACTIVE";
                      const canMakeLive =
                        status === "INACTIVE" ||
                        status === "DRAFT" ||
                        status === "ARCHIVED";

                      return (
                        <div
                          key={listing.id}
                          className="rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-slate-300"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                              {listing.imageUrl ? (
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200">
                                  <Image
                                    src={listing.imageUrl}
                                    alt={listing.name}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                    unoptimized={listing.imageUrl?.startsWith(
                                      "http"
                                    )}
                                  />
                                </div>
                              ) : (
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
                                  <Icon className="h-4 w-4" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="truncate text-sm font-semibold text-slate-950">
                                    {listing.name}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className="rounded-full border-slate-200 bg-slate-50 px-2 py-0 text-[10px] font-semibold uppercase tracking-wide text-slate-600"
                                  >
                                    {listing.listingType}
                                  </Badge>
                                  <StatusBadge status={status} />
                                </div>
                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {[
                                    listing.location,
                                    listing.network,
                                    listing.reach,
                                    listing.priceRange,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ") || "No extra details"}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 sm:justify-end">
                              {isLive ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={busy}
                                  onClick={() =>
                                    handleListingStatus(
                                      selectedAgency.id,
                                      listing.id,
                                      "INACTIVE"
                                    )
                                  }
                                  className="h-9 rounded-full bg-amber-500 px-3.5 text-white hover:bg-amber-600"
                                >
                                  {busy ? (
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Pause className="mr-1.5 h-3.5 w-3.5" />
                                  )}
                                  Pause
                                </Button>
                              ) : null}
                              {canMakeLive ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={busy}
                                  onClick={() =>
                                    handleListingStatus(
                                      selectedAgency.id,
                                      listing.id,
                                      "ACTIVE"
                                    )
                                  }
                                  className="h-9 rounded-full bg-emerald-600 px-3.5 text-white hover:bg-emerald-700"
                                >
                                  {busy ? (
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Play className="mr-1.5 h-3.5 w-3.5" />
                                  )}
                                  Make live
                                </Button>
                              ) : null}
                              {status !== "ARCHIVED" ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={busy}
                                  onClick={() =>
                                    handleListingStatus(
                                      selectedAgency.id,
                                      listing.id,
                                      "ARCHIVED"
                                    )
                                  }
                                  className="h-9 rounded-full border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                >
                                  <Archive className="mr-1.5 h-3.5 w-3.5" />
                                  Archive
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
