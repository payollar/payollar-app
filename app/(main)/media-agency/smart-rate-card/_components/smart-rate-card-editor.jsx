"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  GripVertical,
  Edit,
  X,
  Check,
  Save,
  Eye,
  EyeOff,
  ExternalLink,
  MapPin,
  Radio,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SmartTableEditor } from "./smart-table-editor";
import Link from "next/link";
import {
  SMART_RATE_CARD_TEMPLATES,
  getAdTypeTimeClassTemplateKey,
  TV_AD_TYPE_IDS,
  RADIO_AD_TYPE_IDS,
} from "@/lib/rate-card-templates";
import { getAdTypesForMediaType } from "@/lib/ad-types";

const COLUMN_DATA_TYPES = [
  { value: "TEXT", label: "Text" },
  { value: "NUMBER", label: "Number" },
  { value: "CURRENCY", label: "Currency" },
  { value: "DROPDOWN", label: "Dropdown" },
  { value: "BOOLEAN", label: "Boolean" },
  { value: "NOTES", label: "Notes" },
];

export function SmartRateCardEditor({
  rateCardId,
  onUpdate,
  listings = [],
  listingFirst = false,
  station = null,
  onTogglePublish = null,
  onDelete = null,
}) {
  const [rateCard, setRateCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingInfo, setEditingInfo] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [stationName, setStationName] = useState("");
  const [stationLocation, setStationLocation] = useState("");
  const [stationReach, setStationReach] = useState("");
  const [stationDemographics, setStationDemographics] = useState([]);
  const [stationDemographicInput, setStationDemographicInput] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionTemplateKey, setNewSectionTemplateKey] = useState("");
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const [linkingListing, setLinkingListing] = useState(false);

  useEffect(() => {
    fetchRateCard();
  }, [rateCardId]);

  const syncRateForm = (card) => {
    setNewTitle(card.title || "");
    setNewDescription(card.description || "");
  };

  const syncStationForm = (listing) => {
    setStationName(listing?.name || "");
    setStationLocation(listing?.location || "");
    setStationReach(listing?.reach || "");
    setStationDemographics(
      Array.isArray(listing?.demographics) ? listing.demographics : []
    );
    setStationDemographicInput("");
  };

  const fetchRateCard = async () => {
    try {
      const response = await fetch(`/api/media-agency/rate-cards/${rateCardId}`);
      const data = await response.json();
      if (data.success) {
        setRateCard(data.rateCard);
        syncRateForm(data.rateCard);
        syncStationForm(data.rateCard.listing || station);
      }
    } catch (error) {
      console.error("Error fetching rate card:", error);
      toast.error("Failed to load rate card");
    } finally {
      setLoading(false);
    }
  };

  const startEditingInfo = () => {
    if (!rateCard) return;
    syncRateForm(rateCard);
    syncStationForm(rateCard.listing || station);
    setEditingInfo(true);
  };

  const cancelEditingInfo = () => {
    if (rateCard) {
      syncRateForm(rateCard);
      syncStationForm(rateCard.listing || station);
    }
    setEditingInfo(false);
  };

  const addStationDemographic = () => {
    const val = stationDemographicInput.trim();
    if (val && !stationDemographics.includes(val)) {
      setStationDemographics([...stationDemographics, val]);
      setStationDemographicInput("");
    }
  };

  const removeStationDemographic = (index) => {
    setStationDemographics(stationDemographics.filter((_, i) => i !== index));
  };

  const handleSaveInfo = async () => {
    if (!newTitle.trim()) {
      toast.error("Rate card title is required");
      return;
    }

    const listing = rateCard.listing || station;
    if (listing) {
      if (!stationName.trim()) {
        toast.error("Station name is required");
        return;
      }
      if (!stationLocation.trim()) {
        toast.error("Station location is required");
        return;
      }
    }

    setSavingInfo(true);
    try {
      const rateRes = await fetch(`/api/media-agency/rate-cards/${rateCardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || null,
        }),
      });
      const rateData = await rateRes.json();
      if (!rateRes.ok || !rateData.success) {
        throw new Error(rateData.error || "Failed to update rate card");
      }

      let nextListing = rateData.rateCard.listing ?? rateCard.listing ?? station;
      if (listing?.id) {
        const listingRes = await fetch(
          `/api/media-agency/listings/${listing.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: stationName.trim(),
              location: stationLocation.trim(),
              reach: stationReach.trim() || null,
              demographics: stationDemographics,
            }),
          }
        );
        const listingData = await listingRes.json();
        if (!listingRes.ok || !listingData.success) {
          throw new Error(listingData.error || "Failed to update station");
        }
        nextListing = listingData.listing;
      }

      setRateCard({
        ...rateCard,
        ...rateData.rateCard,
        listing: nextListing || null,
        location: nextListing?.location || rateData.rateCard.location,
        reach: nextListing?.reach || rateData.rateCard.reach,
      });
      syncRateForm(rateData.rateCard);
      syncStationForm(nextListing);
      setEditingInfo(false);
      toast.success("Saved");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error saving info:", error);
      toast.error(error.message || "Failed to save");
    } finally {
      setSavingInfo(false);
    }
  };

  const handleLinkListing = async (listingId) => {
    if (!listingId) return;
    setLinkingListing(true);
    try {
      const response = await fetch(`/api/media-agency/rate-cards/${rateCardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to link listing");
      }
      setRateCard({
        ...rateCard,
        ...data.rateCard,
        listing: data.rateCard.listing || null,
      });
      toast.success("Linked to station listing");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error linking listing:", error);
      toast.error(error.message || "Failed to link listing");
    } finally {
      setLinkingListing(false);
    }
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) {
      toast.error("Section title is required");
      return;
    }

    try {
      const response = await fetch(
        `/api/media-agency/rate-cards/${rateCardId}/sections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newSectionTitle,
            templateKey: newSectionTemplateKey || undefined,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Section added");
        setNewSectionTitle("");
        setNewSectionTemplateKey("");
        setShowAddSection(false);
        await fetchRateCard();
        if (onUpdate) onUpdate();
      } else {
        toast.error(data.error || "Failed to add section");
      }
    } catch (error) {
      console.error("Error adding section:", error);
      toast.error("Failed to add section");
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm("Are you sure you want to delete this section? All tables and data will be lost.")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/media-agency/rate-cards/${rateCardId}/sections/${sectionId}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Section deleted");
        await fetchRateCard();
        if (onUpdate) onUpdate();
      } else {
        toast.error(data.error || "Failed to delete section");
      }
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error("Failed to delete section");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading rate card...
        </CardContent>
      </Card>
    );
  }

  if (!rateCard) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Rate card not found
        </CardContent>
      </Card>
    );
  }

  const linkedListing = rateCard.listing || station || null;
  const mediaTypeLabel =
    linkedListing?.listingType || rateCard.listingType || null;
  const unlinkedListings = listings.filter(
    (l) => !rateCard.listingId || l.id !== rateCard.listingId
  );
  const displayLocation =
    linkedListing?.location || rateCard.location || null;
  const displayReach = linkedListing?.reach || rateCard.reach || null;
  const displayDemographics = Array.isArray(linkedListing?.demographics)
    ? linkedListing.demographics
    : Array.isArray(rateCard.demographics)
      ? rateCard.demographics
      : [];

  return (
    <div className="space-y-4">
      {/* Orphan link UI only */}
      {!listingFirst && !linkedListing ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                Not linked to a station
              </p>
              <p className="mt-1 text-sm text-amber-900/80">
                Link a station so this rate card can appear on Browse.
              </p>
            </div>
            {listings.length > 0 ? (
              <Select
                onValueChange={handleLinkListing}
                disabled={linkingListing}
              >
                <SelectTrigger className="h-10 max-w-sm rounded-xl border-amber-200 bg-white">
                  <SelectValue placeholder="Select a station" />
                </SelectTrigger>
                <SelectContent>
                  {unlinkedListings.map((listing) => (
                    <SelectItem key={listing.id} value={listing.id}>
                      {listing.name} · {listing.listingType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs text-amber-800/70">
                Create a station with “New station” first.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {/* Rate card header */}
      <Card className="overflow-hidden border-slate-200/80 shadow-sm">
        <CardHeader className="space-y-3 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#0055ff]">
                  Rate card
                </span>
                {mediaTypeLabel ? (
                  <Badge
                    variant="secondary"
                    className="rounded-full border-0 bg-slate-100 text-slate-600"
                  >
                    {String(mediaTypeLabel).replaceAll("_", " ")}
                  </Badge>
                ) : null}
                {rateCard.isPublished ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    <Eye className="h-3 w-3" />
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    <EyeOff className="h-3 w-3" />
                    Draft
                  </span>
                )}
                {!editingInfo ? (
                  <button
                    type="button"
                    onClick={startEditingInfo}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    title="Edit rate card info"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>

              {!editingInfo ? (
                <>
                  <h2 className="mt-1.5 truncate text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                    {rateCard.title}
                  </h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                    {linkedListing?.name ? (
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                        <Radio className="h-3.5 w-3.5 text-[#0055ff]" />
                        {linkedListing.name}
                      </span>
                    ) : null}
                    {displayLocation ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {displayLocation}
                      </span>
                    ) : null}
                    {displayReach ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {displayReach}
                      </span>
                    ) : null}
                    {mediaTypeLabel ? (
                      <span className="text-slate-400">
                        {String(mediaTypeLabel).replaceAll("_", " ")}
                      </span>
                    ) : null}
                  </p>
                  {rateCard.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {rateCard.description}
                    </p>
                  ) : null}
                  {displayDemographics.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {displayDemographics.map((demo, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="rounded-full text-[10px]"
                        >
                          {demo}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {editingInfo ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 rounded-full bg-[#0055ff] px-3 text-white hover:bg-[#0046d4]"
                    onClick={handleSaveInfo}
                    disabled={savingInfo}
                  >
                    {savingInfo ? (
                      <Save className="mr-1.5 h-3.5 w-3.5 animate-pulse" />
                    ) : (
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full border-slate-200"
                    onClick={cancelEditingInfo}
                    disabled={savingInfo}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  {onTogglePublish ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full border-slate-200"
                      onClick={onTogglePublish}
                    >
                      {rateCard.isPublished ? (
                        <>
                          <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Publish
                        </>
                      )}
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8 gap-1.5 rounded-full border-slate-200"
                  >
                    <Link
                      href={`/rate-cards/${rateCardId}?preview=1`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                  {onDelete ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-full text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={onDelete}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {editingInfo ? (
            <div className="space-y-4">
              <div className="space-y-3 rounded-xl border border-slate-200 bg-[#f7f8fc] p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Rate card
                </p>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">
                    Title
                  </Label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="h-10 rounded-xl border-slate-200 bg-white"
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">
                    Pricing note{" "}
                    <span className="font-normal text-slate-400">(optional)</span>
                  </Label>
                  <Textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="e.g. Valid for Q1 2026"
                    rows={2}
                    className="min-h-[52px] resize-none rounded-xl border-slate-200 bg-white"
                  />
                </div>
              </div>

              {linkedListing ? (
                <div className="space-y-3 rounded-xl border border-[#0055ff]/15 bg-[#f5f8ff] p-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0055ff]">
                    Station
                  </p>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">
                      Station name
                    </Label>
                    <Input
                      value={stationName}
                      onChange={(e) => setStationName(e.target.value)}
                      className="h-10 rounded-xl border-slate-200 bg-white"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-600">
                        Location
                      </Label>
                      <Input
                        value={stationLocation}
                        onChange={(e) => setStationLocation(e.target.value)}
                        placeholder="e.g. Accra"
                        className="h-10 rounded-xl border-slate-200 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-600">
                        Reach
                      </Label>
                      <Input
                        value={stationReach}
                        onChange={(e) => setStationReach(e.target.value)}
                        placeholder="e.g. 2M+ viewers"
                        className="h-10 rounded-xl border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">
                      Demographics
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={stationDemographicInput}
                        onChange={(e) =>
                          setStationDemographicInput(e.target.value)
                        }
                        placeholder="e.g. Adults 25-54"
                        className="h-10 rounded-xl border-slate-200 bg-white"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addStationDemographic();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-xl border-slate-200 bg-white"
                        onClick={addStationDemographic}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {stationDemographics.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {stationDemographics.map((demo, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 rounded-full"
                          >
                            {demo}
                            <button
                              type="button"
                              onClick={() => removeStationDemographic(index)}
                              className="hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </CardHeader>
      </Card>

      {/* Add Ad Type Section — one rates sheet per ad type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ad Type Sections</CardTitle>
          <p className="text-sm text-muted-foreground">
            One table per ad type. For each time class, enter Mon–Fri and
            Sat–Sun rates by spot length (60 / 45 / 30 / 15s). Buyers use these
            after Buy.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(() => {
              const listingType = rateCard.listingType || "TV";
              const adTypeIds = listingType === "RADIO" ? RADIO_AD_TYPE_IDS : TV_AD_TYPE_IDS;
              const adTypes = getAdTypesForMediaType(listingType.toLowerCase());
              const existingSectionTitles = new Set(
                rateCard.sections?.map((s) => s.title.toLowerCase()) || []
              );
              return adTypeIds.map((adTypeId) => {
                const adType = adTypes.find((a) => a.id === adTypeId);
                const label = adType?.label || adTypeId;
                const sectionTitle = label;
                const alreadyExists = existingSectionTitles.has(sectionTitle.toLowerCase());
                return (
                  <Button
                    key={adTypeId}
                    variant="outline"
                    size="sm"
                    disabled={alreadyExists}
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `/api/media-agency/rate-cards/${rateCardId}/sections`,
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              title: sectionTitle,
                              templateKey: getAdTypeTimeClassTemplateKey(adTypeId),
                            }),
                          }
                        );
                        const data = await response.json();
                        if (data.success) {
                          toast.success(`${label} section added`);
                          await fetchRateCard();
                          if (onUpdate) onUpdate();
                        } else {
                          toast.error(data.error || "Failed to add section");
                        }
                      } catch (error) {
                        console.error("Error adding ad type section:", error);
                        toast.error("Failed to add section");
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {label}
                    {alreadyExists && " ✓"}
                  </Button>
                );
              });
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      {rateCard.sections?.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              {editingSectionId === section.id ? (
                <div className="flex items-center gap-2 flex-1 mr-4">
                  <Input
                    value={editingSectionTitle}
                    onChange={(e) => setEditingSectionTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        (async () => {
                          const title = editingSectionTitle.trim() || section.title;
                          try {
                            const response = await fetch(
                              `/api/media-agency/rate-cards/${rateCardId}/sections/${section.id}`,
                              {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ title }),
                              }
                            );
                            const data = await response.json();
                            if (data.success) {
                              toast.success("Section renamed");
                              setEditingSectionId(null);
                              await fetchRateCard();
                            } else {
                              toast.error(data.error || "Failed to rename section");
                            }
                          } catch (error) {
                            toast.error("Failed to rename section");
                          }
                        })();
                      } else if (e.key === "Escape") {
                        setEditingSectionId(null);
                        setEditingSectionTitle("");
                      }
                    }}
                    className="text-xl font-semibold h-9"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={async () => {
                      const title = editingSectionTitle.trim() || section.title;
                      try {
                        const response = await fetch(
                          `/api/media-agency/rate-cards/${rateCardId}/sections/${section.id}`,
                          {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ title }),
                          }
                        );
                        const data = await response.json();
                        if (data.success) {
                          toast.success("Section renamed");
                          setEditingSectionId(null);
                          await fetchRateCard();
                        } else {
                          toast.error(data.error || "Failed to rename section");
                        }
                      } catch (error) {
                        toast.error("Failed to rename section");
                      }
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      setEditingSectionId(null);
                      setEditingSectionTitle("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <CardTitle
                  className="text-xl cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded flex items-center gap-2"
                  onClick={() => {
                    setEditingSectionId(section.id);
                    setEditingSectionTitle(section.title || "");
                  }}
                >
                  {section.title || "Untitled Section"}
                  <Edit className="h-4 w-4 opacity-50 shrink-0" />
                </CardTitle>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDeleteSection(section.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Section
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.tables?.map((table) => (
              <SmartTableEditor
                key={table.id}
                table={table}
                onUpdate={fetchRateCard}
              />
            ))}
            {(!section.tables || section.tables.length === 0) && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No rates table yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Adds Mon–Fri and Sat–Sun rows for each time class, with 60 /
                  45 / 30 / 15s rate columns.
                </p>
                <Button
                  className="mt-3 h-9 rounded-full bg-[#0055ff] px-4 text-white hover:bg-[#0046d4]"
                  onClick={async () => {
                    const title = String(section.title || "").trim();
                    const titleKey = title.toLowerCase();
                    const titleSlug = titleKey.replace(/\s+/g, "-");
                    const listingType = rateCard.listingType || "TV";
                    const adTypes = getAdTypesForMediaType(
                      listingType.toLowerCase()
                    );
                    const matched = adTypes.find(
                      (a) =>
                        a.id === titleSlug ||
                        a.id === titleKey ||
                        String(a.label || "").toLowerCase() === titleKey
                    );
                    const adTypeId =
                      matched?.id ||
                      TV_AD_TYPE_IDS.find((id) => id === titleSlug) ||
                      RADIO_AD_TYPE_IDS.find((id) => id === titleSlug) ||
                      (listingType === "RADIO"
                        ? RADIO_AD_TYPE_IDS[0] || "jingle"
                        : "tvc");
                    try {
                      const response = await fetch(
                        `/api/media-agency/rate-cards/${rateCardId}/sections/${section.id}/tables`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            title: "Rates",
                            templateKey:
                              getAdTypeTimeClassTemplateKey(adTypeId),
                          }),
                        }
                      );
                      const data = await response.json();
                      if (data.success) {
                        toast.success("Rates table added");
                        await fetchRateCard();
                      } else {
                        toast.error(data.error || "Failed to add rates table");
                      }
                    } catch (error) {
                      console.error(error);
                      toast.error("Failed to add rates table");
                    }
                  }}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add rates table
                </Button>
              </div>
            )}
            {section.tables?.length > 1 ? (
              <p className="text-xs text-amber-700">
                Tip: keep one rates table per ad type. Delete extras so buyers
                and the planner aren’t confused.
              </p>
            ) : null}
            {section.tables?.length === 1 &&
            !section.tables[0].columns?.some(
              (c) => c.config?.role === "day_band"
            ) ? (
              <p className="text-xs text-slate-500">
                This table has no Mon–Fri / Sat–Sun Days column. Delete it and
                use “Add rates table” for the new layout, or add a Days dropdown
                yourself if you prefer.
              </p>
            ) : null}
          </CardContent>
        </Card>
      ))}

      {/* Add Section */}
      {showAddSection ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label>Section Title</Label>
                <Input
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="e.g., TV Rates, Radio Packages"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddSection();
                    } else if (e.key === "Escape") {
                      setShowAddSection(false);
                      setNewSectionTitle("");
                    }
                  }}
                  autoFocus
                />
              </div>
              <div>
                <Label>Template (optional)</Label>
                <Select
                  value={newSectionTemplateKey || "none"}
                  onValueChange={(v) =>
                    setNewSectionTemplateKey(v === "none" ? "" : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No template</SelectItem>
                    {SMART_RATE_CARD_TEMPLATES.filter((t) =>
                      t.key.startsWith("ad_type_")
                    ).map((t) => (
                      <SelectItem key={t.key} value={t.key}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Prefer the Ad Type buttons above. Optional: seed Mon–Fri /
                  Sat–Sun × duration rates.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddSection}>
                  <Check className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddSection(false);
                    setNewSectionTitle("");
                    setNewSectionTemplateKey("");
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setShowAddSection(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      )}
    </div>
  );
}
