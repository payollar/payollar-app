"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  FileText,
  Loader2,
  MapPin,
  Radio,
  Receipt,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ProductsChannelTopBar } from "@/components/products/products-channel-top-bar";
import { MediaPlannerIntro } from "@/components/products/media-planner-intro";
import { getPublishedRateCards } from "@/actions/media-agency";
import { getRateCardSchedulerSlots } from "@/actions/tv-media-airtime";
import { RADIO_AD_TYPES } from "@/lib/ad-types";
import { getSlotRateForSec as getSlotRateForSecBase } from "@/lib/tv-airtime-slots";
import {
  addMediaPlannerCartItem,
  loadMediaPlannerCart,
  mediaPlannerCartCount,
} from "@/lib/media-planner-cart";
import {
  getMediaPlannerDraft,
  removeMediaPlannerDraft,
  upsertMediaPlannerDraft,
} from "@/lib/media-planner-drafts";
import { takeMediaPlannerCampaignSeed } from "@/lib/media-planner-campaign-seed";
import {
  filterRateCardsForScheduler,
  hasStationPref,
  readStationPrefFromSearch,
  resolvePreferredRateCard,
  stationDisplayLocation,
  stationDisplayName,
} from "@/lib/media-planner-station-pref";
import {
  CampaignDatesPicker,
  createCampaignDayClickHandler,
  createQuickSelectHandler,
} from "@/components/products/campaign-dates-picker";
import { MediaSchedulerStepper } from "@/components/products/media-scheduler-stepper";
import { MediaFrequencyStep } from "@/components/products/media-frequency-step";
import { MediaSlotPrograms } from "@/components/products/media-slot-programs";
import {
  MediaConfirmPanel,
  MediaConfirmTotal,
} from "@/components/products/media-confirm-panels";
import { MediaCampaignSummary } from "@/components/products/media-campaign-summary";
import { MediaCampaignDetailsStep } from "@/components/products/media-campaign-details-step";
import {
  FREQUENCY_LABELS,
  buildMediaPlannerLineItems,
  formatCompactCount,
  sumMediaPlannerImpressions,
  sumMediaPlannerLineItems,
} from "@/lib/media-planner-pricing";
import {
  MEDIA_AUDIENCE_TYPES,
  MEDIA_CAMPAIGN_OBJECTIVES,
  MEDIA_INDUSTRY_OPTIONS,
  mediaBriefLabels,
} from "@/lib/media-campaign-brief";

const STEPS = [
  { id: 1, label: "Campaign" },
  { id: 2, label: "Station & Format" },
  { id: 3, label: "Dates" },
  { id: 4, label: "Airtimes & Spots" },
  { id: 5, label: "Frequency" },
  { id: 6, label: "Confirm" },
];

const BROADCAST_FREQUENCY_OPTIONS = [
  { id: "once", label: "Once daily" },
  { id: "2x", label: "2x daily" },
  { id: "3x", label: "3x daily" },
  { id: "5x", label: "5x daily" },
  { id: "hourly", label: "Hourly" },
];

/** Sun–Sat; default Mon–Fri on */
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Match rate card: VAT 15%, NHIL + GETFund 5% on subtotal */
const VAT_RATE = 0.15;
const NHIL_GETFUND_RATE = 0.05;

/** Icons from /public/icons — keyed by ad format id (match TV scheduler style). */
const AD_FORMAT_ICON_SRC = {
  "produced-spot": "/icons/mic2.PNG",
  "live-read": "/icons/mic3.PNG",
  lpm: "/icons/mic2.PNG",
  jingle: "/icons/musical-note.png",
  sponsorship: "/icons/trust.PNG",
};

const SPOT_LENGTH_OPTIONS = [
  { sec: 15, short: "15s", subtitle: "Teaser" },
  { sec: 30, short: "30s", subtitle: "Standard" },
  { sec: 45, short: "45s", subtitle: "Extended" },
  { sec: 60, short: "60s", subtitle: "Long-form" },
  { sec: 120, short: "2 min", subtitle: "Feature" },
];

function getDaysBetweenInclusive(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff + 1);
}

function getCampaignDayCount(start, end) {
  if (!start) return 0;
  if (!end) return 1;
  return getDaysBetweenInclusive(start, end);
}

function slotCampaignTotalGhs(rateGhs, dayCount) {
  return Math.round((rateGhs ?? 0) * Math.max(1, dayCount));
}

export default function RadioMediaPage() {
  const [rateCards, setRateCards] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

  const [selectedRateCardId, setSelectedRateCardId] = useState(null);
  const [selectedAdFormatId, setSelectedAdFormatId] = useState(null);

  const [campaignStart, setCampaignStart] = useState(null);
  const [campaignEnd, setCampaignEnd] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const [airtimeSlots, setAirtimeSlots] = useState([]);
  const [airtimeSlotsLoading, setAirtimeSlotsLoading] = useState(false);
  const [airtimeSlotsError, setAirtimeSlotsError] = useState(null);
  const [selectedAirtimeSlotIds, setSelectedAirtimeSlotIds] = useState([]);

  // single-select
  const [selectedSpotLengthsSec, setSelectedSpotLengthsSec] = useState([]);
  const selectedSingleSpotSec =
    selectedSpotLengthsSec.length === 1 ? selectedSpotLengthsSec[0] : null;

  const [slotFrequencyById, setSlotFrequencyById] = useState({});
  const [activeBroadcastDays, setActiveBroadcastDays] = useState(() => [
    false,
    true,
    true,
    true,
    true,
    true,
    false,
  ]);
  const [mediaCampaignName, setMediaCampaignName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [audienceTypeIds, setAudienceTypeIds] = useState([]);
  const [objectiveIds, setObjectiveIds] = useState([]);
  const [industryIds, setIndustryIds] = useState([]);
  const [contactFullName, setContactFullName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [draftId, setDraftId] = useState(null);
  const draftHydratedRef = useRef(false);
  const pendingDraftSlotsRef = useRef(null);
  const [stationPref, setStationPref] = useState(null);
  const stationPrefAppliedRef = useRef(false);

  useEffect(() => {
    getPublishedRateCards("RADIO").then((result) => {
      if (result.success && result.rateCards?.length) setRateCards(result.rateCards);
    });
  }, []);

  useEffect(() => {
    const refreshCartCount = () => setCartCount(mediaPlannerCartCount(loadMediaPlannerCart()));
    refreshCartCount();
    window.addEventListener("media-planner-cart-change", refreshCartCount);
    window.addEventListener("storage", refreshCartCount);
    return () => {
      window.removeEventListener("media-planner-cart-change", refreshCartCount);
      window.removeEventListener("storage", refreshCartCount);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pref = readStationPrefFromSearch(window.location.search);
    setStationPref(hasStationPref(pref) ? pref : null);
  }, []);

  const stationOptions = useMemo(
    () => filterRateCardsForScheduler(rateCards, stationPref),
    [rateCards, stationPref]
  );
  const stationLocked = hasStationPref(stationPref) && stationOptions.length === 1;

  useEffect(() => {
    if (stationPrefAppliedRef.current || !rateCards.length) return;
    const options = filterRateCardsForScheduler(rateCards, stationPref);

    if (selectedRateCardId) {
      const stillVisible = options.some((card) => card.id === selectedRateCardId);
      if (!stillVisible && options[0]?.id) {
        setSelectedRateCardId(options[0].id);
      }
      stationPrefAppliedRef.current = true;
      return;
    }

    if (hasStationPref(stationPref)) {
      const match = resolvePreferredRateCard(rateCards, stationPref) || options[0];
      if (!match?.id) return;
      setSelectedRateCardId(match.id);
      stationPrefAppliedRef.current = true;
      toast.message(`Station locked: ${stationDisplayName(match)}`, {
        description: "This buy uses the rate card linked to that listing.",
      });
      return;
    }

    if (options.length === 1) {
      setSelectedRateCardId(options[0].id);
      stationPrefAppliedRef.current = true;
    }
  }, [rateCards, selectedRateCardId, stationPref]);

  useEffect(() => {
    if (draftHydratedRef.current || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);

    if (params.get("extend") === "1") {
      const seed = takeMediaPlannerCampaignSeed();
      if (!seed?.mediaCampaignName) return;
      draftHydratedRef.current = true;
      setMediaCampaignName(seed.mediaCampaignName || "");
      setBrandName(seed.brandName || "");
      setAudienceTypeIds(Array.isArray(seed.audienceTypeIds) ? seed.audienceTypeIds : []);
      setObjectiveIds(Array.isArray(seed.objectiveIds) ? seed.objectiveIds : []);
      setIndustryIds(Array.isArray(seed.industryIds) ? seed.industryIds : []);
      setContactFullName(seed.contact?.name || "");
      setContactEmail(seed.contact?.email || "");
      setContactPhone(seed.contact?.phone || "");
      setCampaignStart(seed.campaignStart ? new Date(seed.campaignStart) : null);
      setCampaignEnd(seed.campaignEnd ? new Date(seed.campaignEnd) : null);
      if (seed.campaignStart) {
        const d = new Date(seed.campaignStart);
        setCalendarMonth({ year: d.getFullYear(), month: d.getMonth() });
      }
      if (seed.rateCardId) setSelectedRateCardId(seed.rateCardId);
      setCurrentStep(2);
      toast.message(
        seed.rateCardId
          ? `Adding another radio flight to “${seed.mediaCampaignName}” — pick format & airtime`
          : `Adding another radio flight to “${seed.mediaCampaignName}” — pick station & format`
      );
      return;
    }

    const id = params.get("draft");
    if (!id) return;
    const draft = getMediaPlannerDraft(id);
    if (!draft || String(draft.channel || "").toUpperCase() !== "RADIO") return;

    draftHydratedRef.current = true;
    setDraftId(draft.id);
    setMediaCampaignName(draft.mediaCampaignName || "");
    setBrandName(draft.brandName || "");
    setAudienceTypeIds(Array.isArray(draft.audienceTypeIds) ? draft.audienceTypeIds : []);
    setObjectiveIds(Array.isArray(draft.objectiveIds) ? draft.objectiveIds : []);
    setIndustryIds(Array.isArray(draft.industryIds) ? draft.industryIds : []);
    setContactFullName(draft.contact?.name || "");
    setContactEmail(draft.contact?.email || "");
    setContactPhone(draft.contact?.phone || "");
    setSelectedAdFormatId(draft.adFormatId || null);
    setSelectedRateCardId(draft.rateCardId || null);
    setCampaignStart(draft.campaignStart ? new Date(draft.campaignStart) : null);
    setCampaignEnd(draft.campaignEnd ? new Date(draft.campaignEnd) : null);
    if (draft.campaignStart) {
      const d = new Date(draft.campaignStart);
      setCalendarMonth({ year: d.getFullYear(), month: d.getMonth() });
    }
    pendingDraftSlotsRef.current = {
      slotIds: Array.isArray(draft.slotIds) ? draft.slotIds : [],
      spotLengthsSec: Array.isArray(draft.spotLengthsSec) ? draft.spotLengthsSec : [],
      slotFrequencies:
        draft.slotFrequencies && typeof draft.slotFrequencies === "object"
          ? draft.slotFrequencies
          : {},
      activeBroadcastDays: Array.isArray(draft.activeBroadcastDays)
        ? draft.activeBroadcastDays
        : null,
    };
    setCurrentStep(6);
    toast.message("Draft loaded — review and continue editing");
  }, []);

  useEffect(() => {
    setSlotFrequencyById((prev) => {
      const next = {};
      for (const id of selectedAirtimeSlotIds) {
        next[id] = prev[id] || "once";
      }
      return next;
    });
  }, [selectedAirtimeSlotIds]);

  const selectedRateCard = useMemo(
    () => rateCards.find((r) => r.id === selectedRateCardId) || null,
    [rateCards, selectedRateCardId]
  );

  const radioAdFormats = useMemo(() => {
    const order = ["produced-spot", "live-read", "lpm", "jingle", "sponsorship"];
    const byId = Object.fromEntries(RADIO_AD_TYPES.map((t) => [t.id, t]));
    return order.map((id) => byId[id]).filter(Boolean);
  }, []);

  useEffect(() => {
    if (!selectedRateCardId) return;
    setAirtimeSlots([]);
    setSelectedAirtimeSlotIds([]);
    setAirtimeSlotsError(null);
    setAirtimeSlotsLoading(true);
    getRateCardSchedulerSlots(selectedRateCardId, selectedAdFormatId)
      .then((res) => {
        if (!res?.success) {
          setAirtimeSlotsError(res?.error || "Could not load airtime slots");
          setAirtimeSlots([]);
          return;
        }
        setAirtimeSlots(res.slots || []);
      })
      .catch((e) => {
        setAirtimeSlotsError(e?.message || "Could not load airtime slots");
        setAirtimeSlots([]);
      })
      .finally(() => setAirtimeSlotsLoading(false));
  }, [selectedRateCardId, selectedAdFormatId]);

  useEffect(() => {
    const pending = pendingDraftSlotsRef.current;
    if (!pending || !selectedRateCardId || airtimeSlotsLoading) return;

    setSelectedAirtimeSlotIds(pending.slotIds || []);
    setSelectedSpotLengthsSec(pending.spotLengthsSec || []);
    if (pending.slotFrequencies && Object.keys(pending.slotFrequencies).length > 0) {
      setSlotFrequencyById(pending.slotFrequencies);
    }
    if (pending.activeBroadcastDays?.length === 7) {
      setActiveBroadcastDays(pending.activeBroadcastDays);
    }
    pendingDraftSlotsRef.current = null;
  }, [selectedRateCardId, selectedAdFormatId, airtimeSlotsLoading, airtimeSlots]);

  const toggleAirtimeSlot = (id) => {
    const slot = airtimeSlots.find((s) => s.id === id);
    if (slot?.booked) return;
    setSelectedAirtimeSlotIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSpotLength = (sec) => {
    setSelectedSpotLengthsSec((prev) => (prev[0] === sec ? [] : [sec]));
  };

  const toggleBroadcastDay = (index) => {
    setActiveBroadcastDays((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const setSlotFrequency = (slotId, frequencyId) => {
    setSlotFrequencyById((prev) => ({ ...prev, [slotId]: frequencyId }));
  };

  const applyFrequencyToAllSlots = (frequencyId) => {
    setSlotFrequencyById((prev) => {
      const next = { ...prev };
      for (const id of selectedAirtimeSlotIds) {
        next[id] = frequencyId;
      }
      return next;
    });
  };

  const selectedFrequencySlots = useMemo(
    () =>
      selectedAirtimeSlotIds
        .map((id) => {
          const slot = airtimeSlots.find((s) => s.id === id);
          if (!slot) return null;
          return {
            id: slot.id,
            label: slot.label,
            range: slot.range || "",
            impressionsPerAiring: slot.impressionsPerAiring ?? null,
            impressionsSource: slot.impressionsSource || "demo",
          };
        })
        .filter(Boolean),
    [selectedAirtimeSlotIds, airtimeSlots]
  );

  const allSlotsHaveFrequency = useMemo(
    () =>
      selectedAirtimeSlotIds.length > 0 &&
      selectedAirtimeSlotIds.every((id) => Boolean(slotFrequencyById[id])),
    [selectedAirtimeSlotIds, slotFrequencyById]
  );

  const campaignDayCount = useMemo(
    () => getCampaignDayCount(campaignStart, campaignEnd),
    [campaignStart, campaignEnd]
  );

  /** Inclusive campaign days for pricing; min 1 so estimates work before dates are set */
  const pricingDayCount = useMemo(() => {
    if (!campaignStart) return 1;
    return Math.max(1, campaignDayCount);
  }, [campaignStart, campaignDayCount]);

  const handleCampaignDayClick = createCampaignDayClickHandler(
    campaignStart,
    campaignEnd,
    setCampaignStart,
    setCampaignEnd
  );

  const applyQuickSelect = createQuickSelectHandler(
    campaignStart,
    setCampaignStart,
    setCampaignEnd,
    setCalendarMonth
  );

  const getSlotRateForSec = (slot, sec) =>
    getSlotRateForSecBase(slot, sec, activeBroadcastDays);

  /** Sum of rate-card amounts per spot length across selected rows */
  const rateSubtotalBySec = useMemo(() => {
    const m = Object.fromEntries(SPOT_LENGTH_OPTIONS.map(({ sec }) => [sec, 0]));
    for (const id of selectedAirtimeSlotIds) {
      const slot = airtimeSlots.find((s) => s.id === id);
      for (const { sec } of SPOT_LENGTH_OPTIONS) {
        m[sec] += getSlotRateForSec(slot, sec);
      }
    }
    return m;
  }, [selectedAirtimeSlotIds, airtimeSlots, activeBroadcastDays]);

  const pricingLineItems = useMemo(
    () =>
      selectedSingleSpotSec
        ? buildMediaPlannerLineItems({
            slotIds: selectedAirtimeSlotIds,
            slots: airtimeSlots,
            spotSec: selectedSingleSpotSec,
            frequencyBySlotId: slotFrequencyById,
            dayCount: pricingDayCount,
            getSlotRateForSec,
          })
        : [],
    [
      selectedSingleSpotSec,
      selectedAirtimeSlotIds,
      airtimeSlots,
      slotFrequencyById,
      pricingDayCount,
      activeBroadcastDays,
    ]
  );

  const pricingSubtotal = useMemo(
    () => sumMediaPlannerLineItems(pricingLineItems),
    [pricingLineItems]
  );

  const pricingImpressions = useMemo(
    () => sumMediaPlannerImpressions(pricingLineItems),
    [pricingLineItems]
  );

  const pricingVat = pricingSubtotal * VAT_RATE;
  const pricingNhilGetfund = pricingSubtotal * NHIL_GETFUND_RATE;
  const pricingTotal = pricingSubtotal + pricingVat + pricingNhilGetfund;

  const canProceedStep1 = Boolean(mediaCampaignName.trim() && audienceTypeIds.length > 0);
  const canProceedStep2 = Boolean(canProceedStep1 && selectedRateCardId && selectedAdFormatId);
  const canProceedStep3 = Boolean(canProceedStep2 && campaignStart);
  const canProceedStep4 = Boolean(
    canProceedStep3 && selectedAirtimeSlotIds.length > 0 && selectedSingleSpotSec
  );
  const canProceedStep5 = Boolean(
    canProceedStep4 && allSlotsHaveFrequency && activeBroadcastDays.some(Boolean)
  );
  const canAddToCart = Boolean(
    canProceedStep5 &&
      mediaCampaignName.trim() &&
      audienceTypeIds.length > 0 &&
      selectedRateCard &&
      pricingTotal > 0
  );

  const canSaveDraft = Boolean(mediaCampaignName?.trim());

  const buildPlannerItem = () => {
    const adFormat = radioAdFormats.find((t) => t.id === selectedAdFormatId);
    const selectedSlots = selectedAirtimeSlotIds
      .map((id) => {
        const slot = airtimeSlots.find((s) => s.id === id);
        if (!slot) return null;
        const line = pricingLineItems.find((l) => l.id === id);
        return {
          id: slot.id,
          label: slot.label,
          range: slot.range || "",
          rateGhs: slot.rateGhs ?? slot.weeklyGhs ?? 0,
          ratesBySec: slot.ratesBySec || {},
          impressionsPerAiring: slot.impressionsPerAiring ?? null,
          impressionsSource: slot.impressionsSource || "demo",
          lineImpressions: line?.lineImpressions ?? null,
          frequencyId: slotFrequencyById[id] || "once",
          frequencyMultiplier: line?.frequencyMultiplier || 1,
          lineTotal: line?.lineTotal || 0,
        };
      })
      .filter(Boolean);

    return {
      channel: "RADIO",
      rateCardId: selectedRateCard?.id || selectedRateCardId || null,
      rateCardTitle: selectedRateCard?.title || "",
      agencyName: selectedRateCard?.agency?.agencyName || "",
      adFormatId: selectedAdFormatId,
      adFormatLabel: adFormat?.label || adFormat?.fullName || selectedAdFormatId,
      campaignStart: campaignStart ? new Date(campaignStart).toISOString() : null,
      campaignEnd: campaignEnd
        ? new Date(campaignEnd).toISOString()
        : campaignStart
          ? new Date(campaignStart).toISOString()
          : null,
      dayCount: pricingDayCount,
      slotIds: selectedAirtimeSlotIds,
      slots: selectedSlots,
      spotLengthsSec: selectedSpotLengthsSec,
      slotFrequencies: slotFrequencyById,
      broadcastFrequencyId: selectedSlots[0]?.frequencyId || null,
      activeBroadcastDays,
      mediaCampaignName: mediaCampaignName.trim(),
      brandName: brandName.trim() || null,
      audienceTypeIds,
      audienceLabels: mediaBriefLabels(MEDIA_AUDIENCE_TYPES, audienceTypeIds),
      objectiveIds,
      objectiveLabels: mediaBriefLabels(MEDIA_CAMPAIGN_OBJECTIVES, objectiveIds),
      industryIds,
      industryLabels: mediaBriefLabels(MEDIA_INDUSTRY_OPTIONS, industryIds),
      contact: {
        name: contactFullName.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim(),
      },
      estimatedImpressions: pricingImpressions || null,
      subtotal: Math.round(pricingSubtotal),
      vat: Math.round(pricingVat),
      nhilGetfund: Math.round(pricingNhilGetfund),
      total: Math.round(pricingTotal),
      currentStep,
    };
  };

  const handleSaveDraft = () => {
    if (!canSaveDraft) {
      toast.error("Enter a campaign name to save a draft");
      setCurrentStep(1);
      return;
    }

    const saved = upsertMediaPlannerDraft({
      ...buildPlannerItem(),
      id: draftId || undefined,
    });
    setDraftId(saved.id);
    toast.success(draftId ? "Draft updated" : "Saved as draft", {
      action: {
        label: "View drafts",
        onClick: () => {
          window.location.href = "/products/media-cart#drafts";
        },
      },
    });
  };

  const handleAddToCart = () => {
    if (!canAddToCart) {
      if (!mediaCampaignName.trim()) {
        toast.error("Enter a media campaign name");
        return;
      }
      toast.error("Complete the planner before adding to cart");
      return;
    }

    const result = addMediaPlannerCartItem(buildPlannerItem());
    if (draftId) {
      removeMediaPlannerDraft(draftId);
      setDraftId(null);
    }

    setCartCount(mediaPlannerCartCount(result?.items || loadMediaPlannerCart()));
    toast.success(
      result?.updated ? "Updated in media cart" : "Added to media cart",
      {
        description: result?.updated
          ? "That campaign flight was already in your cart, so we refreshed it."
          : undefined,
        action: {
          label: "View cart",
          onClick: () => {
            window.location.href = "/products/media-cart";
          },
        },
      }
    );
  };

  return (
    <div className="min-h-[calc(100dvh-5.25rem)] bg-white text-slate-900 antialiased selection:bg-primary/20 md:min-h-[calc(100dvh-7rem)]">
      <ProductsChannelTopBar title="Radio Media" icon={Radio} variant="light" showChannelLabel={false} />

      <div className="relative mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <MediaPlannerIntro
          className="pt-2 sm:pt-3"
          title="Radio advertising"
          description="Build a radio flight in one place—campaign brief, stations, dates, airtime, and estimate."
          cartCount={cartCount}
        />

        <section className="relative pb-20 pt-6 sm:pb-28 sm:pt-8">
              <MediaSchedulerStepper
                steps={STEPS}
                currentStep={currentStep}
                onStepChange={setCurrentStep}
              />

              {/* Step 1: Campaign details */}
              {currentStep === 1 && (
                <MediaCampaignDetailsStep
                  campaignName={mediaCampaignName}
                  onCampaignNameChange={setMediaCampaignName}
                  brandName={brandName}
                  onBrandNameChange={setBrandName}
                  objectiveIds={objectiveIds}
                  onObjectiveIdsChange={setObjectiveIds}
                  audienceTypeIds={audienceTypeIds}
                  onAudienceTypeIdsChange={setAudienceTypeIds}
                  industryIds={industryIds}
                  onIndustryIdsChange={setIndustryIds}
                  contactName={contactFullName}
                  onContactNameChange={setContactFullName}
                  contactPhone={contactPhone}
                  onContactPhoneChange={setContactPhone}
                  contactEmail={contactEmail}
                  onContactEmailChange={setContactEmail}
                  campaignNameId="radio-media-campaign-name"
                  brandNameId="radio-media-brand-name"
                  contactNameId="radio-media-contact-name"
                  contactPhoneId="radio-media-contact-phone"
                  contactEmailId="radio-media-contact-email"
                  continueDisabled={!canProceedStep1}
                  continueLabel="Continue to station"
                  onContinue={() => setCurrentStep(2)}
                />
              )}

              {/* Step 2: Station & format */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <Card className="rounded-2xl border-border/70">
              <CardHeader>
                <CardTitle className="text-xl">Station &amp; format</CardTitle>
                <CardDescription>Select a radio station rate card and the ad format.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      {stationLocked ? "Station" : "Select station"}
                    </div>
                    {stationLocked ? (
                      <p className="text-xs text-muted-foreground">
                        Locked from the listing you selected
                      </p>
                    ) : null}
                  </div>
                  {stationOptions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                      {hasStationPref(stationPref)
                        ? "No published rate card is linked to this listing yet."
                        : "No station rate cards available yet. Link a published rate card to a listing."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {stationOptions.map((rc) => {
                        const selected = selectedRateCardId === rc.id;
                        return (
                          <button
                            key={rc.id}
                            type="button"
                            disabled={stationLocked && !selected}
                            onClick={() => {
                              if (stationLocked) return;
                              setSelectedRateCardId(rc.id);
                            }}
                            className={cn(
                              "rounded-2xl border p-4 text-left transition-all",
                              selected
                                ? "border-primary/35 bg-primary/8 ring-1 ring-primary/15"
                                : "border-border/60 bg-card/70 hover:border-primary/25 hover:bg-muted/40",
                              stationLocked && selected && "cursor-default"
                            )}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="text-sm font-semibold text-foreground">
                                  {stationDisplayName(rc)}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {stationDisplayLocation(rc)}
                                  {rc.agency?.agencyName ? ` · ${rc.agency.agencyName}` : ""}
                                </div>
                                {rc.location ? (
                                  <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-[11px] text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {rc.location}
                                  </div>
                                ) : null}
                              </div>
                              {selected ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground">
                                  <Check className="h-3.5 w-3.5" />
                                  Selected
                                </span>
                              ) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Radio className="h-4 w-4 text-primary" />
                    Select ad format
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {radioAdFormats.map((format) => {
                      const selected = selectedAdFormatId === format.id;
                      const iconSrc = AD_FORMAT_ICON_SRC[format.id];
                      return (
                        <button
                          key={format.id}
                          type="button"
                          onClick={() => setSelectedAdFormatId(format.id)}
                          className={cn(
                            "rounded-2xl border p-5 text-left transition-all",
                            selected
                              ? "border-chart-2/35 bg-chart-2/10 ring-1 ring-chart-2/20"
                              : "border-border/60 bg-card/70 hover:border-chart-2/25 hover:bg-muted/40"
                          )}
                        >
                          <div
                            className={cn(
                              "mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl transition-colors sm:h-16 sm:w-16",
                              selected ? "bg-chart-2/15 ring-1 ring-chart-2/25" : "bg-muted/50"
                            )}
                          >
                            {iconSrc ? (
                              <img
                                src={iconSrc}
                                alt=""
                                className="h-10 w-10 object-contain dark:opacity-95 sm:h-11 sm:w-11"
                              />
                            ) : (
                              <Radio className="h-8 w-8 text-muted-foreground sm:h-9 sm:w-9" strokeWidth={1.75} />
                            )}
                          </div>
                          <p className="text-base font-semibold text-foreground">{format.label}</p>
                          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{format.fullName}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-full border-slate-200 bg-white px-5 text-base text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                    onClick={() => setCurrentStep(1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="h-12 rounded-full bg-slate-900 px-8 text-base font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={!canProceedStep2}
                    onClick={() => setCurrentStep(3)}
                  >
                    Next: Dates
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Dates */}
        {currentStep === 3 && (
          <div className="space-y-8 sm:space-y-10">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">Campaign dates</h3>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">
                Tap a start date, then an end date. One tap is a single-day campaign.
              </p>
            </div>

            <CampaignDatesPicker
              calendarMonth={calendarMonth}
              onCalendarMonthChange={setCalendarMonth}
              campaignStart={campaignStart}
              campaignEnd={campaignEnd}
              onDayClick={handleCampaignDayClick}
              onQuickSelect={applyQuickSelect}
            />

            <div className="flex justify-between pt-1">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                className="h-12 rounded-full bg-slate-900 px-8 text-base font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!canProceedStep3}
                onClick={() => setCurrentStep(4)}
              >
                Next: Airtimes &amp; spots
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 4 && (
          <div className="space-y-10">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Airtimes &amp; spots</h3>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Select airtime slots from the station’s rate card. Prices stay hidden until you pick a spot length.
              </p>
            </div>

            <Card className="rounded-2xl border-border/70">
              <CardHeader>
                <CardTitle className="text-lg">Select airtime slots</CardTitle>
                <CardDescription>
                  Showing slots for:{" "}
                  <span className="font-semibold text-foreground">
                    {RADIO_AD_TYPES.find((t) => t.id === selectedAdFormatId)?.label ?? selectedAdFormatId}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {airtimeSlotsError ? (
                  <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {airtimeSlotsError}
                  </p>
                ) : null}
                {airtimeSlotsLoading ? (
                  <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-16 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading airtime from rate card…</span>
                  </div>
                ) : airtimeSlots.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground sm:text-base">
                    No airtime rows found for this ad format.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {airtimeSlots.map((slot) => {
                      const selected = selectedAirtimeSlotIds.includes(slot.id);
                      const disabled = slot.booked;
                      const displayedDailyRate =
                        selectedSingleSpotSec != null
                          ? getSlotRateForSec(slot, selectedSingleSpotSec)
                          : null;
                      const impressionsLabel = formatCompactCount(slot.impressionsPerAiring);
                      const isDemoImpressions = slot.impressionsSource !== "agency";
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => toggleAirtimeSlot(slot.id)}
                          aria-pressed={selected}
                          aria-disabled={disabled}
                          className={cn(
                            "flex min-h-[5.5rem] flex-col justify-between rounded-xl border p-4 text-left transition-all sm:min-h-[6rem] sm:p-4",
                            disabled &&
                              "opacity-45 cursor-not-allowed border-border bg-muted/30 text-muted-foreground",
                            !disabled &&
                              selected &&
                              "border-chart-3/40 bg-chart-3/8 ring-1 ring-chart-3/25 shadow-sm dark:bg-chart-3/12",
                            !disabled &&
                              !selected &&
                              "border-border bg-muted/40 hover:border-chart-3/30 hover:bg-muted/60",
                            !disabled &&
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          )}
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground sm:text-base">{slot.label}</p>
                            {slot.range ? (
                              <p className="mt-0.5 text-xs text-muted-foreground tabular-nums sm:text-sm">{slot.range}</p>
                            ) : null}
                            {!disabled ? (
                              <MediaSlotPrograms
                                programs={slot.programs}
                                programsSource={slot.programsSource}
                                className="text-muted-foreground"
                                max={2}
                              />
                            ) : null}
                            {impressionsLabel && !disabled ? (
                              <p className="mt-1 text-[11px] font-medium tabular-nums text-muted-foreground">
                                ~{impressionsLabel}
                                <span className="font-normal">
                                  {" "}
                                  / airing
                                  {isDemoImpressions ? " · demo" : ""}
                                </span>
                              </p>
                            ) : null}
                          </div>
                          {disabled ? (
                            <p className="mt-2 text-xs font-semibold text-muted-foreground sm:text-sm">Not available</p>
                          ) : (
                            <div className="mt-2 space-y-0.5">
                              {selectedSingleSpotSec == null ? (
                                <p className="text-xs font-semibold text-muted-foreground sm:text-sm">
                                  Select a spot length to see pricing
                                </p>
                              ) : (
                                <>
                                  <p className="text-sm font-semibold tabular-nums text-chart-3 sm:text-base">
                                    GH₵
                                    {slotCampaignTotalGhs(displayedDailyRate, pricingDayCount).toLocaleString()}
                                  </p>
                                  <p className="text-[10px] leading-tight text-muted-foreground tabular-nums sm:text-[11px]">
                                    {Math.round(displayedDailyRate ?? 0).toLocaleString()} ×{" "}
                                    {Math.max(1, pricingDayCount)} day{pricingDayCount === 1 ? "" : "s"} •{" "}
                                    {selectedSingleSpotSec}s
                                  </p>
                                </>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70">
              <CardHeader>
                <CardTitle className="text-lg">Select spot length</CardTitle>
                <CardDescription>Pick one duration. Airtime pricing updates to match your selection.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {SPOT_LENGTH_OPTIONS.map(({ sec, short, subtitle }) => {
                    const selected = selectedSpotLengthsSec.includes(sec);
                    const rateSum = rateSubtotalBySec[sec] ?? 0;
                    const showEstimate = selected && selectedAirtimeSlotIds.length > 0;
                    const campaignEst = Math.round(rateSum * Math.max(1, pricingDayCount));
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => toggleSpotLength(sec)}
                        aria-pressed={selected}
                        className={cn(
                          "flex min-h-[5.75rem] flex-col items-center justify-center gap-1 rounded-xl border p-4 text-center transition-all sm:min-h-[6.25rem] sm:p-5",
                          selected
                            ? "border-chart-4/40 bg-chart-4/8 ring-1 ring-chart-4/25 dark:bg-chart-4/12"
                            : "border-border bg-muted/40 hover:border-chart-4/30 hover:bg-muted/60",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        )}
                      >
                        <span className="text-lg font-bold text-foreground sm:text-xl">{short}</span>
                        <span className="text-xs text-muted-foreground sm:text-sm">{subtitle}</span>
                        {selected && selectedAirtimeSlotIds.length === 0 && (
                          <span className="text-[10px] text-amber-700/90 dark:text-amber-400/90">
                            Select airtime slots
                          </span>
                        )}
                        {showEstimate && (
                          <>
                            <span className="mt-0.5 text-xs font-semibold tabular-nums text-chart-1 sm:text-sm">
                              GH₵{campaignEst.toLocaleString()}
                            </span>
                            <span className="text-[10px] leading-tight text-muted-foreground tabular-nums">
                              {Math.round(rateSum).toLocaleString()} × {Math.max(1, pricingDayCount)} day
                              {pricingDayCount === 1 ? "" : "s"}
                            </span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setCurrentStep(3)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                className="h-12 rounded-full bg-slate-900 px-8 text-base font-medium text-white hover:bg-slate-800"
                disabled={!canProceedStep4}
                onClick={() => setCurrentStep(5)}
              >
                Next: Frequency
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {currentStep === 5 && (
          <div className="space-y-8 sm:space-y-10">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">Frequency</h3>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">
                Choose a frequency for each airtime slot, then pick which days of the week apply.
              </p>
            </div>

            <MediaFrequencyStep
              slots={selectedFrequencySlots}
              frequencyOptions={BROADCAST_FREQUENCY_OPTIONS}
              frequencyBySlotId={slotFrequencyById}
              onFrequencyChange={setSlotFrequency}
              onApplyFrequencyToAll={applyFrequencyToAllSlots}
              weekdays={WEEKDAY_SHORT}
              activeDays={activeBroadcastDays}
              onToggleDay={toggleBroadcastDay}
              onSetDays={setActiveBroadcastDays}
              dayCount={pricingDayCount}
            />

            <div className="flex justify-between pt-1">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full border-slate-200 bg-white px-5 text-base text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                onClick={() => setCurrentStep(4)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                className="h-12 rounded-full bg-slate-900 px-8 text-base font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!canProceedStep5}
                onClick={() => setCurrentStep(6)}
              >
                Next: Confirm
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Confirm */}
        {currentStep === 6 && (
          <div className="space-y-8 sm:space-y-10">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                Review &amp; confirm
              </h3>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">
                Review the plan and estimate, then add it to your media cart.
              </p>
            </div>

            <div className="grid items-start gap-5 xl:grid-cols-2 xl:gap-6">
              <MediaCampaignSummary
                campaignName={mediaCampaignName.trim() || null}
                brandName={brandName.trim() || null}
                audienceLabels={mediaBriefLabels(MEDIA_AUDIENCE_TYPES, audienceTypeIds)}
                objectiveLabels={mediaBriefLabels(MEDIA_CAMPAIGN_OBJECTIVES, objectiveIds)}
                industryLabels={mediaBriefLabels(MEDIA_INDUSTRY_OPTIONS, industryIds)}
                contactName={contactFullName.trim() || null}
                contactEmail={contactEmail.trim() || null}
                contactPhone={contactPhone.trim() || null}
                stationTitle={selectedRateCard?.title}
                agencyName={selectedRateCard?.agency?.agencyName}
                location={selectedRateCard?.location}
                adFormatLabel={
                  RADIO_AD_TYPES.find((t) => t.id === selectedAdFormatId)?.label ||
                  RADIO_AD_TYPES.find((t) => t.id === selectedAdFormatId)?.fullName
                }
                spotLengthLabel={selectedSingleSpotSec ? `${selectedSingleSpotSec}s` : null}
                windowStartLabel={
                  campaignStart
                    ? new Date(campaignStart).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : null
                }
                windowEndLabel={
                  campaignStart
                    ? new Date(campaignEnd || campaignStart).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : null
                }
                dayCount={campaignDayCount}
                slots={selectedFrequencySlots.map((slot) => {
                  const line = pricingLineItems.find((l) => l.id === slot.id);
                  return {
                    ...slot,
                    lineImpressions: line?.lineImpressions ?? null,
                    frequencyLabel:
                      FREQUENCY_LABELS[slotFrequencyById[slot.id] || "once"] ||
                      BROADCAST_FREQUENCY_OPTIONS.find(
                        (f) => f.id === (slotFrequencyById[slot.id] || "once")
                      )?.label,
                  };
                })}
                activeDays={activeBroadcastDays}
                weekdays={WEEKDAY_SHORT}
              />

              <MediaConfirmPanel
                title="Pricing estimate"
                icon={Receipt}
                footer={
                  <div className="space-y-3">
                    <div className="space-y-2 text-sm text-slate-500">
                      <div className="flex items-center justify-between gap-3">
                        <span>Subtotal</span>
                        <span className="tabular-nums text-slate-800">
                          ₵{Math.round(pricingSubtotal).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>VAT (15%)</span>
                        <span className="tabular-nums text-slate-800">
                          ₵{Math.round(pricingVat).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>NHIL &amp; GETFund (5%)</span>
                        <span className="tabular-nums text-slate-800">
                          ₵{Math.round(pricingNhilGetfund).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <MediaConfirmTotal
                      amount={pricingTotal}
                      impressions={pricingImpressions}
                      impressionsDemo={selectedFrequencySlots.some(
                        (slot) => slot.impressionsSource !== "agency"
                      )}
                    />
                  </div>
                }
              >
                <p className="mb-4 text-sm leading-relaxed text-slate-500">
                  Each slot uses its rate-card amount × campaign days × how many times it airs per day.
                  Impressions use the same multipliers when the rate card includes avg audience per airing.
                  Taxes included below.
                </p>
                {pricingLineItems.length > 0 ? (
                  <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Slots
                      {selectedSingleSpotSec != null ? ` · ${selectedSingleSpotSec}s` : ""}
                    </p>
                    {pricingLineItems.map((line) => {
                      const impressionsLabel = formatCompactCount(line.lineImpressions);
                      return (
                        <div
                          key={line.id}
                          className="flex justify-between gap-3 border-b border-slate-200/70 pb-2.5 last:border-0 last:pb-0"
                        >
                          <span className="min-w-0">
                            <span className="text-sm font-semibold text-slate-900">{line.label}</span>
                            {line.range ? (
                              <span className="text-sm text-slate-400"> · {line.range}</span>
                            ) : null}
                            <span className="mt-0.5 block text-xs tabular-nums text-slate-400">
                              {Math.round(line.unitRate).toLocaleString()} × {line.days} day
                              {line.days === 1 ? "" : "s"} × {line.frequencyLabel}
                            </span>
                            {impressionsLabel ? (
                              <span className="mt-0.5 block text-xs font-medium tabular-nums text-slate-500">
                                Est. {impressionsLabel} impressions
                              </span>
                            ) : null}
                          </span>
                          <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                            ₵{line.lineTotal.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                    Select airtime and spot length to see a priced breakdown.
                  </p>
                )}
              </MediaConfirmPanel>
            </div>

            <div className="flex flex-col gap-4 rounded-[28px] border border-slate-100 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-full border-slate-200 bg-white px-5 text-base text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                  onClick={() => setCurrentStep(5)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <p className="px-1 text-sm text-slate-500 sm:px-2">
                  Estimate{" "}
                  <span className="font-semibold tabular-nums text-slate-900">
                    ₵{Math.round(pricingTotal).toLocaleString()}
                  </span>
                  {formatCompactCount(pricingImpressions) ? (
                    <>
                      <span className="text-slate-300"> · </span>
                      <span className="font-semibold tabular-nums text-slate-700">
                        ~{formatCompactCount(pricingImpressions)} impressions
                      </span>
                    </>
                  ) : null}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button asChild variant="outline" className="h-11 rounded-full border-slate-200 px-5">
                  <Link href="/products/media-cart">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    View cart{cartCount > 0 ? ` (${cartCount})` : ""}
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={!canSaveDraft}
                  className="h-11 rounded-full border-slate-200 bg-white px-5 text-base text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {draftId ? "Update draft" : "Save draft"}
                </Button>
                <Button
                  type="button"
                  className="h-12 rounded-full bg-slate-900 px-8 text-base font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!canAddToCart}
                  onClick={handleAddToCart}
                >
                  Add to cart
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            {!canAddToCart ? (
              <p className="-mt-4 text-center text-xs text-slate-400 sm:text-right sm:text-sm">
                {!mediaCampaignName?.trim() || audienceTypeIds.length === 0
                  ? "Go back to Campaign and add a campaign name plus audience type."
                  : "Complete the earlier steps before adding to cart."}
                {canSaveDraft ? " You can still save a draft with what you have." : ""}
              </p>
            ) : null}
          </div>
        )}
        </section>
      </div>

      <footer className="border-t border-slate-200/80 bg-white py-10 text-center">
        <p className="text-sm font-medium text-slate-500">
          © {new Date().getFullYear()} Payollar. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
