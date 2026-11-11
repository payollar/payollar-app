"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  Check,
  Tv,
  Radio,
  Megaphone,
  Smartphone,
  Users,
  Video,
  Building2,
  Loader2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SmartRateCardEditor } from "./_components/smart-rate-card-editor";
import { MediaAgencyPageShell } from "../_components/media-agency-page-shell";
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-10 rounded-xl border-slate-200 bg-white shadow-none focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20";

const MEDIA_TYPES = [
  { value: "TV", label: "TV", icon: Tv },
  { value: "RADIO", label: "Radio", icon: Radio },
  { value: "BILLBOARD", label: "Billboard", icon: Megaphone },
  { value: "DIGITAL", label: "Digital", icon: Smartphone },
  { value: "INFLUENCER_MARKETING", label: "Influencer", icon: Users },
  { value: "VIDEO_CLIPPING", label: "Video clipping", icon: Video },
];

function TypeIcon({ type, className }) {
  const meta = MEDIA_TYPES.find((t) => t.value === type);
  const Icon = meta?.icon || Building2;
  return <Icon className={className} />;
}

export default function SmartRateCardPage() {
  const [rateCards, setRateCards] = useState([]);
  const [mediaListings, setMediaListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [selectedRateCardId, setSelectedRateCardId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListingName, setNewListingName] = useState("");
  const [selectedListingType, setSelectedListingType] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [creatingRatesForListingId, setCreatingRatesForListingId] =
    useState(null);

  const fetchListings = useCallback(async () => {
    try {
      const res = await fetch("/api/media-agency/listings");
      const data = await res.json();
      if (data.success) setMediaListings(data.listings || []);
      return data.listings || [];
    } catch {
      return [];
    }
  }, []);

  const fetchRateCards = useCallback(async () => {
    try {
      const response = await fetch("/api/media-agency/rate-cards");
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load rate cards");
      }
      const cards = data.rateCards || [];
      setRateCards(cards);
      return cards;
    } catch (error) {
      console.error("Error fetching rate cards:", error);
      toast.error(error.message || "Failed to load rate cards");
      return [];
    }
  }, []);

  const refreshAll = useCallback(
    async ({ preferListingId = null, preferRateCardId = null } = {}) => {
      const [listings, cards] = await Promise.all([
        fetchListings(),
        fetchRateCards(),
      ]);
      setLoading(false);

      const nextListingId =
        preferListingId ||
        (listings.some((l) => l.id === selectedListingId)
          ? selectedListingId
          : listings[0]?.id) ||
        null;

      setSelectedListingId(nextListingId);

      if (preferRateCardId && cards.some((c) => c.id === preferRateCardId)) {
        setSelectedRateCardId(preferRateCardId);
        return;
      }

      if (nextListingId) {
        const forListing = cards.filter((c) => c.listingId === nextListingId);
        const primary =
          forListing.find((c) => c.isPublished) || forListing[0] || null;
        setSelectedRateCardId(primary?.id ?? null);
      } else {
        setSelectedRateCardId(null);
      }
    },
    [fetchListings, fetchRateCards, selectedListingId]
  );

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One rate card per station: pick published first, else first linked card
  const primaryCardByListingId = useMemo(() => {
    const map = {};
    const extras = {};
    for (const card of rateCards) {
      if (!card.listingId) continue;
      if (!map[card.listingId]) {
        map[card.listingId] = card;
        extras[card.listingId] = [];
        continue;
      }
      const current = map[card.listingId];
      if (!current.isPublished && card.isPublished) {
        extras[card.listingId].push(current);
        map[card.listingId] = card;
      } else {
        extras[card.listingId].push(card);
      }
    }
    return { primary: map, extras };
  }, [rateCards]);

  const orphanCards = useMemo(
    () => rateCards.filter((c) => !c.listingId),
    [rateCards]
  );

  const selectedListing =
    mediaListings.find((l) => l.id === selectedListingId) || null;
  const selectedRateCard = selectedListingId
    ? primaryCardByListingId.primary[selectedListingId] || null
    : orphanCards.find((c) => c.id === selectedRateCardId) || null;
  const duplicateCards = selectedListingId
    ? primaryCardByListingId.extras[selectedListingId] || []
    : [];

  useEffect(() => {
    if (!selectedListingId) return;
    const primary = primaryCardByListingId.primary[selectedListingId];
    setSelectedRateCardId(primary?.id ?? null);
  }, [selectedListingId, primaryCardByListingId]);

  const resetCreateForm = () => {
    setNewListingName("");
    setSelectedListingType("");
    setNewLocation("");
    setShowCreateForm(false);
  };

  const createRateCardForListing = async (listing, titleOverride = null) => {
    const existing = primaryCardByListingId.primary[listing.id];
    if (existing) return existing;

    const response = await fetch("/api/media-agency/rate-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: titleOverride || `${listing.name} rates`,
        description: null,
        isPublished: false,
        listingId: listing.id,
        listingType: listing.listingType,
        location: listing.location,
        imageUrl: listing.imageUrl || null,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to create rate card");
    }
    return data.rateCard;
  };

  const handleCreateStation = async () => {
    if (!newListingName.trim()) {
      toast.error("Station name is required");
      return;
    }
    if (!selectedListingType) {
      toast.error("Choose a media type");
      return;
    }
    if (!newLocation.trim()) {
      toast.error("Location is required");
      return;
    }

    setCreating(true);
    try {
      const listingRes = await fetch("/api/media-agency/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingType: selectedListingType,
          name: newListingName.trim(),
          location: newLocation.trim(),
          status: "ACTIVE",
        }),
      });
      const listingData = await listingRes.json();
      if (!listingRes.ok || !listingData.success) {
        throw new Error(listingData.error || "Failed to create station");
      }

      const listing = listingData.listing;
      const rateCard = await createRateCardForListing(listing);

      toast.success("Station created — add rates below");
      resetCreateForm();
      await refreshAll({
        preferListingId: listing.id,
        preferRateCardId: rateCard.id,
      });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to create station");
    } finally {
      setCreating(false);
    }
  };

  const handleBuildRatesForListing = async (listing) => {
    setCreatingRatesForListingId(listing.id);
    try {
      const rateCard = await createRateCardForListing(listing);
      toast.success("Rate card ready — add ad type sections");
      await refreshAll({
        preferListingId: listing.id,
        preferRateCardId: rateCard.id,
      });
    } catch (error) {
      toast.error(error.message || "Failed to create rate card");
    } finally {
      setCreatingRatesForListingId(null);
    }
  };

  const handleDeleteRateCard = async (id) => {
    if (!confirm("Delete this rate card?")) return;
    try {
      const response = await fetch(`/api/media-agency/rate-cards/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete rate card");
      }
      toast.success("Rate card deleted");
      await refreshAll({ preferListingId: selectedListingId });
    } catch (error) {
      toast.error(error.message || "Failed to delete rate card");
    }
  };

  const handleTogglePublish = async (rateCard) => {
    try {
      const response = await fetch(
        `/api/media-agency/rate-cards/${rateCard.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: !rateCard.isPublished }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update rate card");
      }
      toast.success(
        data.rateCard.isPublished
          ? "Published — station is live on Browse"
          : "Unpublished"
      );
      await refreshAll({
        preferListingId: selectedListingId,
        preferRateCardId: rateCard.id,
      });
    } catch (error) {
      toast.error(error.message || "Failed to update rate card");
    }
  };

  const selectStation = (listingId) => {
    setSelectedListingId(listingId);
    setSelectedRateCardId(
      primaryCardByListingId.primary[listingId]?.id ?? null
    );
  };

  if (loading) {
    return (
      <MediaAgencyPageShell
        eyebrow="Pricing"
        title="Smart rate cards"
        description="Create a station, then build its rate card."
      >
        <div className="flex h-48 items-center justify-center text-sm text-slate-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading…
        </div>
      </MediaAgencyPageShell>
    );
  }

  return (
    <MediaAgencyPageShell
      eyebrow="Pricing"
      title="Smart rate cards"
      description="Create a station listing first. Open it to build and publish its rate card."
      actions={
        <Button
          variant="black"
          className="rounded-full"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New station
        </Button>
      }
    >
      {mediaListings.length === 0 && orphanCards.length === 0 ? (
        <section
          className={cn(
            DASHBOARD_CARD_CLASS,
            "flex flex-col items-center px-5 py-14 text-center"
          )}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#0055ff]">
            <Building2 className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-950">
            Start with a station
          </p>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Add Joy FM, TV3, or any channel first. Then open that station and
            build the rate card buyers book from.
          </p>
          <Button
            className="mt-4 h-9 rounded-full bg-[#0055ff] px-4 text-white hover:bg-[#0046d4]"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New station
          </Button>
        </section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className={cn(DASHBOARD_CARD_CLASS, "h-fit overflow-hidden")}>
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-950">
                Stations
                <span className="ml-1.5 text-slate-400">
                  ({mediaListings.length})
                </span>
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Select a station to edit its rates
              </p>
            </div>
            <ul className="max-h-[70vh] overflow-y-auto p-1.5">
              {mediaListings.map((listing) => {
                const primary = primaryCardByListingId.primary[listing.id];
                const active = selectedListingId === listing.id;
                return (
                  <li key={listing.id}>
                    <button
                      type="button"
                      onClick={() => selectStation(listing.id)}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition",
                        active
                          ? "bg-[#eef2ff] text-slate-950"
                          : "hover:bg-slate-50"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          active
                            ? "bg-white text-[#0055ff]"
                            : "bg-slate-100 text-slate-500"
                        )}
                      >
                        <TypeIcon
                          type={listing.listingType}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {listing.name}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          {listing.listingType}
                          {listing.location ? ` · ${listing.location}` : ""}
                        </p>
                        <p
                          className={cn(
                            "mt-1 text-[11px] font-medium",
                            primary?.isPublished
                              ? "text-emerald-600"
                              : primary
                                ? "text-slate-400"
                                : "text-amber-600"
                          )}
                        >
                          {!primary
                            ? "No rate card yet"
                            : primary.isPublished
                              ? `Published · ${primary._count?.sections ?? 0} sections`
                              : `Draft rates · ${primary._count?.sections ?? 0} sections`}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            {orphanCards.length > 0 ? (
              <div className="border-t border-slate-100 p-1.5">
                <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                  Unlinked rate cards
                </p>
                <ul>
                  {orphanCards.map((card) => (
                    <li key={card.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedListingId(null);
                          setSelectedRateCardId(card.id);
                        }}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition",
                          selectedRateCardId === card.id && !selectedListingId
                            ? "bg-amber-50"
                            : "hover:bg-slate-50"
                        )}
                      >
                        <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {card.title}
                          </p>
                          <p className="text-[11px] text-amber-700">
                            Link to a station
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>

          <div className="min-w-0 space-y-4">
            {selectedListing ? (
              <>
                {duplicateCards.length > 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-sm font-semibold text-amber-900">
                      Extra rate cards on this station
                    </p>
                    <p className="mt-1 text-xs text-amber-800/80">
                      A station should have one rate card. Keep the current one
                      and delete the duplicates.
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {duplicateCards.map((card) => (
                        <li
                          key={card.id}
                          className="flex items-center justify-between gap-2 text-sm text-amber-950"
                        >
                          <span className="truncate font-medium">
                            {card.title}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 shrink-0 rounded-full text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            onClick={() => handleDeleteRateCard(card.id)}
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {selectedRateCard ? (
                  <SmartRateCardEditor
                    rateCardId={selectedRateCard.id}
                    listings={mediaListings}
                    listingFirst
                    station={selectedListing}
                    onTogglePublish={() =>
                      handleTogglePublish(selectedRateCard)
                    }
                    onDelete={() => handleDeleteRateCard(selectedRateCard.id)}
                    onUpdate={() =>
                      refreshAll({
                        preferListingId: selectedListingId,
                        preferRateCardId: selectedRateCard.id,
                      })
                    }
                  />
                ) : (
                  <section
                    className={cn(
                      DASHBOARD_CARD_CLASS,
                      "flex flex-col items-center px-5 py-12 text-center"
                    )}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#0055ff]">
                      <FileText className="h-5 w-5" />
                    </span>
                    <p className="mt-3 text-sm font-semibold text-slate-950">
                      No rate card for {selectedListing.name} yet
                    </p>
                    <p className="mt-1 max-w-sm text-sm text-slate-500">
                      Build the pricing tables for this station. Buyers will use
                      them after they hit Buy on Browse.
                    </p>
                    <Button
                      className="mt-4 h-9 rounded-full bg-[#0055ff] px-4 text-white hover:bg-[#0046d4]"
                      disabled={creatingRatesForListingId === selectedListing.id}
                      onClick={() =>
                        handleBuildRatesForListing(selectedListing)
                      }
                    >
                      {creatingRatesForListingId === selectedListing.id ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-1.5 h-4 w-4" />
                      )}
                      Build rate card
                    </Button>
                  </section>
                )}
              </>
            ) : selectedRateCardId &&
              orphanCards.some((c) => c.id === selectedRateCardId) ? (
              <div className="space-y-2">
                <div
                  className={cn(
                    DASHBOARD_CARD_CLASS,
                    "border-amber-200 bg-amber-50 px-4 py-3"
                  )}
                >
                  <p className="text-sm font-semibold text-amber-900">
                    This rate card is not linked to a station
                  </p>
                  <p className="mt-1 text-xs text-amber-800/80">
                    Link it below so it can appear on Browse with a station
                    listing.
                  </p>
                </div>
                <SmartRateCardEditor
                  rateCardId={selectedRateCardId}
                  listings={mediaListings}
                  onUpdate={() => refreshAll()}
                />
              </div>
            ) : (
              <section
                className={cn(
                  DASHBOARD_CARD_CLASS,
                  "px-5 py-12 text-center text-sm text-slate-500"
                )}
              >
                Select a station to edit its rates
              </section>
            )}
          </div>
        </div>
      )}

      <Dialog
        open={showCreateForm}
        onOpenChange={(open) => {
          if (!open) resetCreateForm();
          else setShowCreateForm(true);
        }}
      >
        <DialogContent className="max-h-[90vh] gap-0 overflow-hidden border-slate-200 bg-white p-0 text-slate-950 shadow-2xl shadow-slate-900/10 sm:max-w-lg [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:text-slate-500 [&>button]:hover:bg-slate-100 [&>button]:hover:text-slate-900">
          <DialogHeader className="space-y-3 border-b border-slate-100 px-6 pb-5 pt-6 text-left">
            <div className="flex items-start gap-3 pr-8">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#0055ff]">
                <Building2 className="h-5 w-5" />
              </span>
              <div className="min-w-0 space-y-1">
                <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950">
                  New station
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-slate-500">
                  Step 1 of 2 — create the station buyers see on Browse. Next
                  you’ll open it and add rate sections.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 px-6 py-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="station-name"
                className="text-sm font-medium text-slate-700"
              >
                Station name <span className="text-[#0055ff]">*</span>
              </Label>
              <Input
                id="station-name"
                value={newListingName}
                onChange={(e) => setNewListingName(e.target.value)}
                placeholder="e.g. Joy FM, TV3, Accra OOH"
                className={fieldClass}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Media type <span className="text-[#0055ff]">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {MEDIA_TYPES.map((type) => {
                  const Icon = type.icon;
                  const active = selectedListingType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedListingType(type.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-center transition",
                        active
                          ? "border-[#0055ff] bg-white text-[#0055ff] shadow-sm ring-2 ring-[#0055ff]/15"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.9} />
                      <span className="text-[11px] font-semibold leading-tight">
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="station-location"
                className="text-sm font-medium text-slate-700"
              >
                Location <span className="text-[#0055ff]">*</span>
              </Label>
              <Input
                id="station-location"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g. Accra"
                className={fieldClass}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-slate-100 bg-[#fafbfd] px-6 py-4 sm:justify-between">
            <p className="hidden text-xs text-slate-400 sm:block">
              A draft rate card is created so you can add sections next.
            </p>
            <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                onClick={resetCreateForm}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-10 rounded-full bg-[#0055ff] px-5 text-white hover:bg-[#0046d4]"
                disabled={
                  creating ||
                  !newListingName.trim() ||
                  !selectedListingType ||
                  !newLocation.trim()
                }
                onClick={handleCreateStation}
              >
                {creating ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-1.5 h-4 w-4" />
                )}
                Create station
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MediaAgencyPageShell>
  );
}
