"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Check,
  Tv,
  Radio,
  Megaphone,
  Smartphone,
  Users,
  Video,
  FileText,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function SmartRateCardPage() {
  const [rateCards, setRateCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedRateCardId, setSelectedRateCardId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRateCardTitle, setNewRateCardTitle] = useState("");
  const [newRateCardDescription, setNewRateCardDescription] = useState("");
  const [mediaListings, setMediaListings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState("");
  const [selectedListingType, setSelectedListingType] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  const fetchRateCards = useCallback(async (preferId = null) => {
    try {
      const response = await fetch("/api/media-agency/rate-cards");
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load rate cards");
      }
      const cards = data.rateCards || [];
      setRateCards(cards);
      setSelectedRateCardId((current) => {
        if (preferId && cards.some((card) => card.id === preferId)) {
          return preferId;
        }
        if (current && cards.some((card) => card.id === current)) {
          return current;
        }
        return cards[0]?.id ?? null;
      });
      return cards;
    } catch (error) {
      console.error("Error fetching rate cards:", error);
      toast.error(error.message || "Failed to load rate cards");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRateCards();
    fetch("/api/media-agency/listings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMediaListings(data.listings || []);
      })
      .catch(() => {});
  }, [fetchRateCards]);

  const resetCreateForm = () => {
    setNewRateCardTitle("");
    setNewRateCardDescription("");
    setSelectedListingId("");
    setSelectedListingType("");
    setNewLocation("");
    setNewImageUrl("");
    setShowCreateForm(false);
  };

  const handleCreateRateCard = async () => {
    if (!newRateCardTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    setCreating(true);
    try {
      const selectedListing = selectedListingId
        ? mediaListings.find((l) => l.id === selectedListingId)
        : null;

      const response = await fetch("/api/media-agency/rate-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newRateCardTitle.trim(),
          description: newRateCardDescription.trim() || null,
          isPublished: false,
          listingId: selectedListingId || null,
          listingType:
            selectedListingType || selectedListing?.listingType || null,
          location: newLocation || selectedListing?.location || null,
          imageUrl: newImageUrl || selectedListing?.imageUrl || null,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create rate card");
      }

      const created = {
        ...data.rateCard,
        _count: data.rateCard._count || { sections: 0 },
      };
      setRateCards((prev) => [
        created,
        ...prev.filter((card) => card.id !== created.id),
      ]);
      setSelectedRateCardId(created.id);
      toast.success("Rate card created");
      resetCreateForm();
      // Refresh in background to stay in sync
      fetchRateCards(created.id);
    } catch (error) {
      console.error("Error creating rate card:", error);
      toast.error(error.message || "Failed to create rate card");
    } finally {
      setCreating(false);
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
      await fetchRateCards();
    } catch (error) {
      console.error("Error deleting rate card:", error);
      toast.error(error.message || "Failed to delete rate card");
    }
  };

  const handleTogglePublish = async (rateCard) => {
    try {
      const response = await fetch(`/api/media-agency/rate-cards/${rateCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !rateCard.isPublished }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update rate card");
      }
      toast.success(
        data.rateCard.isPublished ? "Published" : "Unpublished"
      );
      await fetchRateCards(rateCard.id);
    } catch (error) {
      console.error("Error updating rate card:", error);
      toast.error(error.message || "Failed to update rate card");
    }
  };

  if (loading) {
    return (
      <MediaAgencyPageShell
        eyebrow="Pricing"
        title="Smart rate cards"
        description="Build table-based rate cards for your media inventory."
      >
        <div className="flex h-48 items-center justify-center text-sm text-slate-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading…
        </div>
      </MediaAgencyPageShell>
    );
  }

  const selectedRateCard = rateCards.find((rc) => rc.id === selectedRateCardId);

  return (
    <MediaAgencyPageShell
      eyebrow="Pricing"
      title="Smart rate cards"
      description="Build table-based rate cards for your media inventory."
      actions={
        <Button
          variant="black"
          className="rounded-full"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New rate card
        </Button>
      }
    >
      {rateCards.length === 0 ? (
        <section
          className={cn(
            DASHBOARD_CARD_CLASS,
            "flex flex-col items-center px-5 py-14 text-center"
          )}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#0055ff]">
            <FileText className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-950">
            No rate cards yet
          </p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Create a rate card to publish tables buyers can book from.
          </p>
          <Button
            className="mt-4 h-9 rounded-full bg-[#0055ff] px-4 text-white hover:bg-[#0046d4]"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create rate card
          </Button>
        </section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className={cn(DASHBOARD_CARD_CLASS, "h-fit overflow-hidden")}>
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-950">
                Your cards
                <span className="ml-1.5 text-slate-400">({rateCards.length})</span>
              </p>
            </div>
            <ul className="max-h-[70vh] overflow-y-auto p-1.5">
              {rateCards.map((rateCard) => {
                const active = selectedRateCardId === rateCard.id;
                return (
                  <li key={rateCard.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedRateCardId(rateCard.id)}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition",
                        active
                          ? "bg-[#eef2ff] text-slate-950"
                          : "hover:bg-slate-50"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {rateCard.title}
                        </p>
                        <p
                          className={cn(
                            "mt-0.5 text-[11px] font-medium",
                            rateCard.isPublished
                              ? "text-emerald-600"
                              : "text-slate-400"
                          )}
                        >
                          {rateCard.isPublished ? "Published" : "Draft"}
                          {typeof rateCard._count?.sections === "number"
                            ? ` · ${rateCard._count.sections} sections`
                            : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-0.5">
                        <span
                          role="button"
                          tabIndex={0}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePublish(rateCard);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.stopPropagation();
                              handleTogglePublish(rateCard);
                            }
                          }}
                          title={rateCard.isPublished ? "Unpublish" : "Publish"}
                        >
                          {rateCard.isPublished ? (
                            <Eye className="h-3.5 w-3.5" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRateCard(rateCard.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.stopPropagation();
                              handleDeleteRateCard(rateCard.id);
                            }
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="min-w-0">
            {selectedRateCard ? (
              <SmartRateCardEditor
                rateCardId={selectedRateCard.id}
                onUpdate={() => fetchRateCards(selectedRateCard.id)}
              />
            ) : (
              <section
                className={cn(
                  DASHBOARD_CARD_CLASS,
                  "px-5 py-12 text-center text-sm text-slate-500"
                )}
              >
                Select a rate card to edit
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New rate card</DialogTitle>
            <DialogDescription>
              Add a card, then build sections and rate tables in the editor.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Title <span className="text-[#0055ff]">*</span>
              </Label>
              <Input
                value={newRateCardTitle}
                onChange={(e) => setNewRateCardTitle(e.target.value)}
                placeholder="e.g. TV Media Rate Card 2026"
                className={fieldClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Description
              </Label>
              <Textarea
                value={newRateCardDescription}
                onChange={(e) => setNewRateCardDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
                className="min-h-[72px] resize-y rounded-xl border-slate-200 bg-white shadow-none focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Link to listing
              </Label>
              <Select
                value={selectedListingId || "none"}
                onValueChange={(value) => {
                  if (value === "none") {
                    setSelectedListingId("");
                    setSelectedListingType("");
                    setNewLocation("");
                    setNewImageUrl("");
                    return;
                  }
                  setSelectedListingId(value);
                  const listing = mediaListings.find((l) => l.id === value);
                  if (listing) {
                    setSelectedListingType(listing.listingType || "");
                    setNewLocation(listing.location || "");
                    setNewImageUrl(listing.imageUrl || "");
                  }
                }}
              >
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="Optional listing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Standalone (no listing)</SelectItem>
                  {mediaListings.map((listing) => (
                    <SelectItem key={listing.id} value={listing.id}>
                      {listing.name} · {listing.listingType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!selectedListingId ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">
                    Media type
                  </Label>
                  <Select
                    value={selectedListingType || undefined}
                    onValueChange={setSelectedListingType}
                  >
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDIA_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="inline-flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5" />
                              {type.label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">
                    Location
                  </Label>
                  <Input
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Accra"
                    className={fieldClass}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-slate-200"
              onClick={resetCreateForm}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-[#0055ff] text-white hover:bg-[#0046d4]"
              disabled={creating}
              onClick={handleCreateRateCard}
            >
              {creating ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-1.5 h-4 w-4" />
              )}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MediaAgencyPageShell>
  );
}
