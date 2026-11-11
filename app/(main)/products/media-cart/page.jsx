"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Plus,
  Radio,
  ShoppingCart,
  Trash2,
  Tv,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductsChannelTopBar } from "@/components/products/products-channel-top-bar";
import { cn } from "@/lib/utils";
import { startPlannerCartNegotiation } from "@/actions/media-negotiate";
import {
  addMediaPlannerCartItem,
  clearMediaPlannerCart,
  stashMediaPlannerPendingCheckout,
  loadMediaPlannerCart,
  patchMediaPlannerCartItem,
  removeMediaPlannerCartItem,
  saveMediaPlannerCart,
} from "@/lib/media-planner-cart";
import {
  loadMediaPlannerDrafts,
  mediaPlannerDraftContinueHref,
  removeMediaPlannerDraft,
  upsertMediaPlannerDraft,
} from "@/lib/media-planner-drafts";
import {
  buildCampaignSeedFromItem,
  groupMediaPlannerCartByCampaign,
  mediaPlannerExtendHref,
  stashMediaPlannerCampaignSeed,
} from "@/lib/media-planner-campaign-seed";
import { formatCompactCount } from "@/lib/media-planner-pricing";

function money(value) {
  return `₵${Math.round(Number(value) || 0).toLocaleString("en-GH")}`;
}

function flightLabel(item) {
  const bits = [item.rateCardTitle || item.agencyName, item.adFormatLabel]
    .filter(Boolean)
    .join(" · ");
  return bits || "Media flight";
}

function flightSchedule(item) {
  const slots = (item.slots || [])
    .map((slot) => {
      const base = slot.range ? `${slot.label} (${slot.range})` : slot.label;
      const freqId =
        slot.frequencyId || item.slotFrequencies?.[slot.id] || item.broadcastFrequencyId;
      const freqLabel = {
        once: "Once daily",
        "2x": "2x daily",
        "3x": "3x daily",
        "5x": "5x daily",
        hourly: "Hourly",
      }[freqId];
      return freqLabel ? `${base} · ${freqLabel}` : base;
    })
    .filter(Boolean)
    .join(", ");

  const extras = [
    item.dayCount ? `${item.dayCount} day${item.dayCount === 1 ? "" : "s"}` : null,
    formatCompactCount(item.estimatedImpressions)
      ? `~${formatCompactCount(item.estimatedImpressions)} impressions`
      : null,
  ].filter(Boolean);

  return [slots || `${item.slotIds?.length || 0} slots`, ...extras].join(" · ");
}

function SelectDot({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
        checked
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-300 bg-white hover:border-slate-500"
      )}
    >
      {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
    </button>
  );
}

export default function MediaPlannerCartPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [negotiatingId, setNegotiatingId] = useState(null);

  useEffect(() => {
    const refreshCart = () => {
      const next = loadMediaPlannerCart();
      setItems(next);
      setSelectedIds((prev) => {
        const ids = next.map((item) => item.id);
        if (prev.length === 0) return ids;
        const kept = prev.filter((id) => ids.includes(id));
        return kept.length > 0 ? kept : ids;
      });
    };
    const refreshDrafts = () => setDrafts(loadMediaPlannerDrafts());
    refreshCart();
    refreshDrafts();
    setHydrated(true);
    const onStorage = () => {
      refreshCart();
      refreshDrafts();
    };
    window.addEventListener("media-planner-cart-change", refreshCart);
    window.addEventListener("media-planner-drafts-change", refreshDrafts);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("media-planner-cart-change", refreshCart);
      window.removeEventListener("media-planner-drafts-change", refreshDrafts);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (window.location.hash === "#drafts") {
      document.getElementById("drafts")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hydrated, drafts.length]);

  const campaigns = useMemo(() => groupMediaPlannerCartByCampaign(items), [items]);
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  );

  const summary = useMemo(() => {
    const subtotal = selectedItems.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
    const vat = selectedItems.reduce((sum, item) => sum + (Number(item.vat) || 0), 0);
    const nhilGetfund = selectedItems.reduce(
      (sum, item) => sum + (Number(item.nhilGetfund) || 0),
      0
    );
    const total = selectedItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    return { subtotal, vat, nhilGetfund, total, count: selectedItems.length };
  }, [selectedItems]);

  const allSelected = items.length > 0 && selectedIds.length === items.length;

  const toggleItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : items.map((item) => item.id));
  };

  const removeItem = (id) => {
    setItems(removeMediaPlannerCartItem(id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    toast.success("Removed from cart");
  };

  const deleteSelected = () => {
    if (selectedIds.length === 0) {
      toast.error("Select flights to delete");
      return;
    }
    const next = items.filter((item) => !selectedIds.includes(item.id));
    saveMediaPlannerCart(next);
    setItems(next);
    setSelectedIds([]);
    toast.success(
      selectedIds.length === 1 ? "Removed 1 flight" : `Removed ${selectedIds.length} flights`
    );
  };

  const clearAll = () => {
    clearMediaPlannerCart();
    setItems([]);
    setSelectedIds([]);
    toast.success("Cart cleared");
  };

  const removeDraft = (id) => {
    setDrafts(removeMediaPlannerDraft(id));
    toast.success("Draft deleted");
  };

  const moveDraftToCart = (draft) => {
    const { status, updatedAt, createdAt, currentStep, ...payload } = draft;
    const result = addMediaPlannerCartItem(payload);
    setItems(result?.items || loadMediaPlannerCart());
    setDrafts(removeMediaPlannerDraft(draft.id));
    toast.success(
      result?.updated ? "Draft updated existing cart flight" : "Draft moved to cart"
    );
  };

  const saveDraftFromItem = (item) => {
    const { id, createdAt, ...payload } = item;
    upsertMediaPlannerDraft(payload);
    setDrafts(loadMediaPlannerDrafts());
    toast.success("Saved as draft", {
      action: {
        label: "View drafts",
        onClick: () => document.getElementById("drafts")?.scrollIntoView({ behavior: "smooth" }),
      },
    });
  };

  const addMoreToCampaign = (group) => {
    const channel =
      String(group.channel || group.flights[0]?.channel || "TV").toUpperCase() === "RADIO"
        ? "RADIO"
        : "TV";
    const seedSource =
      group.flights.find((f) => f.rateCardId) || group.flights[0];
    const seed = buildCampaignSeedFromItem(seedSource);
    if (!seed) {
      toast.error("Could not continue this campaign");
      return;
    }
    seed.sourceChannel = channel;
    stashMediaPlannerCampaignSeed(seed);
    toast.message(
      `Adding more ${channel === "RADIO" ? "radio" : "TV"} spots to “${group.mediaCampaignName}”`
    );
    router.push(mediaPlannerExtendHref(channel));
  };

  const negotiateRate = async (item) => {
    if (!item) {
      toast.error("Select a flight to negotiate");
      return;
    }
    if (!item.rateCardId) {
      toast.error("This flight has no station rate card to negotiate");
      return;
    }
    setNegotiatingId(item.id);
    try {
      // Send a slim payload — full cart objects can be large and previously
      // tied negotiation ownership to the planner contact email.
      const result = await startPlannerCartNegotiation({
        id: item.id,
        rateCardId: item.rateCardId,
        rateCardBookingId: item.rateCardBookingId || null,
        channel: item.channel || "TV",
        mediaCampaignName: item.mediaCampaignName,
        brandName: item.brandName || null,
        adFormatLabel: item.adFormatLabel || null,
        audienceLabels: item.audienceLabels || [],
        campaignStart: item.campaignStart || null,
        campaignEnd: item.campaignEnd || null,
        dayCount: item.dayCount || 1,
        slotIds: item.slotIds || [],
        slots: Array.isArray(item.slots)
          ? item.slots.slice(0, 20).map((slot) => ({
              id: slot.id,
              label: slot.label,
              range: slot.range || "",
              frequencyId: slot.frequencyId || null,
              lineTotal: slot.lineTotal ?? null,
            }))
          : [],
        estimatedImpressions: item.estimatedImpressions ?? null,
        subtotal: item.subtotal || 0,
        vat: item.vat || 0,
        nhilGetfund: item.nhilGetfund || 0,
        total: item.total,
        contact: {
          name: item.contact?.name || "",
          email: item.contact?.email || "",
          phone: item.contact?.phone || "",
        },
      });

      if (!result?.success || !result?.href) {
        const message = result?.error || "Could not open negotiation";
        if (/unauthorized|sign in|client/i.test(message)) {
          toast.error("Sign in as a client to negotiate rates");
          router.push(
            `/sign-in?redirect_url=${encodeURIComponent("/products/media-cart")}`
          );
          return;
        }
        toast.error(message);
        return;
      }

      patchMediaPlannerCartItem(item.id, {
        rateCardBookingId: result.bookingId,
        negotiationId: result.negotiationId,
        listTotal: item.listTotal != null ? item.listTotal : item.total,
      });
      toast.message("Opening rate negotiation with the station");
      router.push(result.href);
    } catch (error) {
      const message = error?.message || "Could not start negotiation";
      if (/unauthorized|sign in|client/i.test(message)) {
        toast.error("Sign in as a client to negotiate rates");
        router.push(
          `/sign-in?redirect_url=${encodeURIComponent("/products/media-cart")}`
        );
        return;
      }
      toast.error("Could not start negotiation. Please try again.");
    } finally {
      setNegotiatingId(null);
    }
  };

  const checkout = async () => {
    if (selectedItems.length === 0) {
      toast.error("Select at least one flight to check out");
      return;
    }
    setCheckingOut(true);
    try {
      const res = await fetch("/api/paystack/initialize-media-planner-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: selectedItems }),
      });
      const data = await res.json();
      if (res.status === 401) {
        toast.error("Sign in as a client to check out");
        router.push(`/sign-in?redirect_url=${encodeURIComponent("/products/media-cart")}`);
        return;
      }
      if (!res.ok) {
        toast.error(data.error || "Could not start checkout");
        return;
      }
      if (data.authorizationUrl) {
        // Keep cart intact until Paystack succeeds — abandoned checkouts restore.
        stashMediaPlannerPendingCheckout({
          itemIds: selectedIds,
          reference: data.reference || null,
        });
        window.location.href = data.authorizationUrl;
        return;
      }
      toast.error("Payment link not received");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="-mt-[5.25rem] min-h-dvh bg-[#f3f4f6] pt-[5.25rem] text-slate-900 md:-mt-28 md:pt-28">
      <ProductsChannelTopBar
        title="Media cart"
        icon={ShoppingCart}
        variant="light"
        backHref="/products"
        backLabel="All services"
      />

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-1 sm:px-6 lg:px-8">
        {!hydrated ? (
          <div className="rounded-3xl bg-white px-6 py-16 text-center text-slate-400 shadow-sm">
            Loading cart…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <p className="mt-5 text-lg font-semibold text-slate-900">Your cart is empty</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Plan a TV or radio flight, then add it here. You can stack multiple formats under one
              campaign.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              <Button asChild className="h-11 rounded-full bg-slate-950 px-5 hover:bg-slate-800">
                <Link href="/products/tv-media">
                  <Tv className="mr-2 h-4 w-4" />
                  TV planner
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-full border-slate-200 px-5">
                <Link href="/products/radio-media">
                  <Radio className="mr-2 h-4 w-4" />
                  Radio planner
                </Link>
              </Button>
            </div>

            <div id="drafts" className="mx-auto mt-12 max-w-xl scroll-mt-24 text-left">
              <DraftsBlock
                drafts={drafts}
                onContinue={mediaPlannerDraftContinueHref}
                onMove={moveDraftToCart}
                onDelete={removeDraft}
              />
            </div>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
            {/* Cart list — mobile order 1 */}
            <div className="order-1 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    Cart
                  </h1>
                  <span className="text-lg font-medium tabular-nums text-slate-400">
                    {String(items.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-white hover:text-slate-900"
                  >
                    {allSelected ? "Deselect all" : "Select all"}
                  </button>
                  <button
                    type="button"
                    onClick={selectedIds.length === items.length ? clearAll : deleteSelected}
                    className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-rose-600 hover:bg-rose-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {selectedIds.length === items.length ? "Delete all" : "Delete selected"}
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
                {campaigns.map((group, groupIndex) => (
                  <div
                    key={group.key}
                    className={cn(groupIndex > 0 && "border-t border-slate-100")}
                  >
                    <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Campaign
                        </p>
                        <p className="mt-0.5 truncate text-base font-semibold text-slate-950">
                          {group.mediaCampaignName}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {[
                            group.brandName,
                            ...(group.audienceLabels || []).slice(0, 2),
                            `${group.flights.length} flight${group.flights.length === 1 ? "" : "s"}`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {String(group.channel || "TV").toUpperCase() === "RADIO" ? (
                          <button
                            type="button"
                            onClick={() => addMoreToCampaign(group)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <Radio className="h-3.5 w-3.5" />
                            Add radio
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addMoreToCampaign(group)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <Tv className="h-3.5 w-3.5" />
                            Add TV
                          </button>
                        )}
                        <Link
                          href="/products"
                          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-transparent px-3 text-xs font-semibold text-slate-500 hover:border-slate-400 hover:bg-white hover:text-slate-800"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          New campaign
                        </Link>
                      </div>
                    </div>

                    <ul>
                      {group.flights.map((item) => {
                        const checked = selectedIds.includes(item.id);
                        const ChannelIcon =
                          String(item.channel || "").toUpperCase() === "RADIO" ? Radio : Tv;
                        return (
                          <li
                            key={item.id}
                            className={cn(
                              "border-b border-slate-100 px-4 py-5 last:border-b-0 sm:px-5",
                              checked ? "bg-white" : "bg-slate-50/40"
                            )}
                          >
                            <div className="flex gap-3 sm:gap-4">
                              <SelectDot
                                checked={checked}
                                onChange={() => toggleItem(item.id)}
                                label={`Select ${flightLabel(item)}`}
                              />

                              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 sm:h-[4.5rem] sm:w-[4.5rem]">
                                <ChannelIcon className="h-6 w-6" strokeWidth={1.75} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="min-w-0">
                                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                      {String(item.channel || "TV").toUpperCase()}
                                      {item.adFormatLabel ? ` · ${item.adFormatLabel}` : ""}
                                    </span>
                                    <p className="mt-1.5 text-sm font-semibold text-slate-950 sm:text-base">
                                      {flightLabel(item)}
                                    </p>
                                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                      {flightSchedule(item)}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600">
                                        {item.dayCount || 1} day
                                        {(item.dayCount || 1) === 1 ? "" : "s"}
                                      </span>
                                      <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600">
                                        {(item.slots || []).length || item.slotIds?.length || 0}{" "}
                                        airtime slot
                                        {((item.slots || []).length || item.slotIds?.length || 0) ===
                                        1
                                          ? ""
                                          : "s"}
                                      </span>
                                      {(item.spotLengthsSec || [])[0] ? (
                                        <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600">
                                          {(item.spotLengthsSec || [])[0]}s spot
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>

                                  <div className="flex shrink-0 items-start justify-between gap-4 sm:flex-col sm:items-end">
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                        aria-label="Remove flight"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => saveDraftFromItem(item)}
                                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                        aria-label="Save flight as draft"
                                        title="Save as draft"
                                      >
                                        <Heart className="h-4 w-4" />
                                      </button>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-base font-semibold tabular-nums text-slate-950 sm:text-lg">
                                        {money(item.total)}
                                      </p>
                                      {item.negotiatedAmount != null ? (
                                        <p className="mt-0.5 text-[11px] font-medium text-emerald-700">
                                          Negotiated
                                          {item.listTotal != null &&
                                          Number(item.listTotal) > Number(item.total)
                                            ? ` · was ${money(item.listTotal)}`
                                            : ""}
                                        </p>
                                      ) : item.negotiationId ? (
                                        <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                                          Negotiation open
                                        </p>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    disabled={negotiatingId === item.id}
                                    onClick={() => negotiateRate(item)}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                                  >
                                    {negotiatingId === item.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <MessageSquare className="h-3.5 w-3.5" />
                                    )}
                                    {item.negotiationId
                                      ? "Continue negotiation"
                                      : "Negotiate rate"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary — before drafts on mobile; sticky sidebar on desktop */}
            <aside className="order-2 lg:sticky lg:top-24 lg:row-span-2">
              <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">Summary</h2>

                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3 text-slate-500">
                    <dt>Selected flights</dt>
                    <dd className="font-medium tabular-nums text-slate-800">
                      {String(summary.count).padStart(2, "0")}{" "}
                      {summary.count === 1 ? "item" : "items"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-slate-500">
                    <dt>Subtotal</dt>
                    <dd className="font-medium tabular-nums text-slate-800">
                      {money(summary.subtotal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-slate-500">
                    <dt>VAT (15%)</dt>
                    <dd className="font-medium tabular-nums text-rose-500">
                      +{money(summary.vat)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-slate-500">
                    <dt>NHIL &amp; GETFund (5%)</dt>
                    <dd className="font-medium tabular-nums text-rose-500">
                      +{money(summary.nhilGetfund)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 border-t border-dashed border-slate-200 pt-4">
                  <div className="flex items-end justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">Total payment</p>
                    <p className="text-2xl font-semibold tabular-nums tracking-tight text-slate-950">
                      {money(summary.total)}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (selectedItems.length === 0) {
                      toast.error("Select a flight to negotiate");
                      return;
                    }
                    if (selectedItems.length > 1) {
                      toast.message("Negotiate one flight at a time", {
                        description: "Deselect the others, or use Negotiate rate on a single flight.",
                      });
                      return;
                    }
                    negotiateRate(selectedItems[0]);
                  }}
                  disabled={
                    negotiatingId != null ||
                    checkingOut ||
                    summary.count === 0
                  }
                  className="mt-6 h-11 w-full rounded-full border-slate-200 text-sm font-semibold text-slate-800"
                >
                  {negotiatingId ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Opening negotiation…
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Negotiate rate
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={checkout}
                  disabled={checkingOut || summary.count === 0}
                  className="mt-2.5 h-12 w-full rounded-full bg-slate-950 text-base font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
                >
                  {checkingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting checkout…
                    </>
                  ) : (
                    <>
                      Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="mt-2.5 h-11 w-full rounded-full border-slate-200 text-sm font-semibold text-slate-800"
                >
                  <Link href="/products">Continue planning</Link>
                </Button>

                <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
                  Negotiate with the station before checkout if you want a better rate.
                  Only selected flights are charged.
                </p>
              </div>
            </aside>

            {/* Drafts — after summary on mobile; under cart on desktop */}
            <div id="drafts" className="order-3 scroll-mt-24 lg:col-start-1">
              <DraftsBlock
                drafts={drafts}
                onContinue={mediaPlannerDraftContinueHref}
                onMove={moveDraftToCart}
                onDelete={removeDraft}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DraftsBlock({ drafts, onContinue, onMove, onDelete }) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">Drafts</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Resume later or move a saved plan into the cart.
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
            drafts.length > 0 ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600"
          )}
        >
          {String(drafts.length).padStart(2, "0")}
        </span>
      </div>

      {drafts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 px-5 py-8 text-center">
          <FileText className="mx-auto h-7 w-7 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">No drafts yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Use Save draft on the TV or radio confirm step.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {drafts.map((draft) => (
            <li key={draft.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {draft.mediaCampaignName || "Untitled draft"}
                    </p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {String(draft.channel || "TV").toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {[draft.brandName, draft.rateCardTitle, draft.adFormatLabel]
                      .filter(Boolean)
                      .join(" · ") || "In progress"}
                    {draft.updatedAt
                      ? ` · Updated ${new Date(draft.updatedAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    variant="outline"
                    className="h-9 rounded-full border-slate-200 px-3 text-xs"
                  >
                    <Link href={onContinue(draft)}>Continue</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-full border-slate-200 px-3 text-xs"
                    onClick={() => onMove(draft)}
                    disabled={!draft.rateCardId || !(draft.slotIds || []).length}
                  >
                    Move to cart
                  </Button>
                  <button
                    type="button"
                    onClick={() => onDelete(draft.id)}
                    className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
