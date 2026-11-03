"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Tv,
  ArrowLeft,
  ArrowRight,
  MapPin,
  CalendarRange,
  ChevronRight,
  Check,
  Clock,
  Receipt,
  Loader2,
  ShoppingCart,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { BorderBeam } from "border-beam";
import { getPublishedRateCards } from "@/actions/media-agency";
import { getRateCardSchedulerSlots } from "@/actions/tv-media-airtime";
import { TV_AD_TYPES } from "@/lib/ad-types";
import { cn } from "@/lib/utils";
import { ProductsChannelTopBar } from "@/components/products/products-channel-top-bar";
import { MediaPlannerIntro } from "@/components/products/media-planner-intro";
import {
  CampaignDatesPicker,
  createCampaignDayClickHandler,
  createQuickSelectHandler,
} from "@/components/products/campaign-dates-picker";
import { MediaSchedulerStepper } from "@/components/products/media-scheduler-stepper";
import { MediaFrequencyStep } from "@/components/products/media-frequency-step";
import {
  MediaConfirmPanel,
  MediaConfirmTotal,
} from "@/components/products/media-confirm-panels";
import { MediaCampaignSummary } from "@/components/products/media-campaign-summary";
import { MediaSlotPrograms } from "@/components/products/media-slot-programs";
import { MediaCampaignDetailsStep } from "@/components/products/media-campaign-details-step";
import {
  MEDIA_AUDIENCE_TYPES,
  MEDIA_CAMPAIGN_OBJECTIVES,
  MEDIA_INDUSTRY_OPTIONS,
  mediaBriefLabels,
} from "@/lib/media-campaign-brief";
import {
  FREQUENCY_LABELS,
  buildMediaPlannerLineItems,
  formatCompactCount,
  sumMediaPlannerImpressions,
  sumMediaPlannerLineItems,
} from "@/lib/media-planner-pricing";
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

/** Icons from /public/icons — keyed by ad format id; filenames mirror the asset (tv, microphone, musical-note, billboard, product, video, …). */
const AD_FORMAT_ICON_SRC = {
  tvc: "/icons/play-record.png",
  lpm: "/icons/mic2.PNG",
  jingle: "/icons/musical-note.png",
  sponsorship: "/icons/trust.PNG",
  announcement: "/icons/bolt.PNG",
  interview: "/icons/mic3.PNG",
  "product-placement": "/icons/product.PNG",
  documentary: "/icons/video.PNG",
  billboard: "/icons/ad1.PNG",
};

/** Display order for TV campaign scheduler — all TV ad formats */
const TV_AD_FORMAT_IDS = [
  "tvc",
  "lpm",
  "jingle",
  "sponsorship",
  "announcement",
  "interview",
  "product-placement",
  "documentary",
  "billboard",
];

function getTvAdFormatsForGrid() {
  const byId = Object.fromEntries(TV_AD_TYPES.map((t) => [t.id, t]));
  return TV_AD_FORMAT_IDS.map((id) => byId[id]).filter(Boolean);
}

function getDaysBetweenInclusive(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff + 1);
}

/** Start only = one-day window; start + end = inclusive range */
function getCampaignDayCount(start, end) {
  if (!start) return 0;
  if (!end) return 1;
  return getDaysBetweenInclusive(start, end);
}

function formatCampaignDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Campaign line total: agency rate × campaign days (rate is used as entered on the rate card) */
function slotCampaignTotalGhs(rateGhs, dayCount) {
  return Math.round((rateGhs ?? 0) * Math.max(1, dayCount));
}

/** Rate for one slot at a given spot length — duration columns when present, else baseline × sec/30 */
function getSlotRateForSec(slot, sec) {
  if (!slot) return 0;
  const r = slot.ratesBySec;
  if (r && typeof r === "object") {
    const v = r[sec] ?? r[String(sec)];
    if (typeof v === "number" && !isNaN(v) && v > 0) return v;
  }
  const base = slot.rateGhs ?? slot.weeklyGhs ?? 0;
  return base * (sec / 30);
}

const SPOT_LENGTH_OPTIONS = [
  { sec: 15, short: "15s", subtitle: "Teaser" },
  { sec: 30, short: "30s", subtitle: "Standard" },
  { sec: 45, short: "45s", subtitle: "Extended" },
  { sec: 60, short: "60s", subtitle: "Long-form" },
  { sec: 120, short: "2 min", subtitle: "Feature" },
];

/** Traveling rainbow border from libraries.dev/beam — soft on light cards */
function PlannerBorderBeam({ children, className, borderRadius = 14 }) {
  return (
    <BorderBeam
      className={cn("h-full w-full", className)}
      size="md"
      theme="light"
      colorVariant="colorful"
      strength={0.55}
      brightness={1.15}
      saturation={0.85}
      glowSize={0.85}
      borderRadius={borderRadius}
      duration={5.5}
      css={`
[data-beam="{id}"][data-active]::after,
[data-beam="{id}"][data-fading]::after {
  --beam-stroke-opacity: 2.1;
}
[data-beam="{id}"][data-active]::before,
[data-beam="{id}"][data-fading]::before {
  --beam-inner-opacity: 1.15;
}
[data-beam="{id}"][data-active] [data-beam-bloom],
[data-beam="{id}"][data-fading] [data-beam-bloom] {
  --beam-bloom-opacity: 0.9;
}
`}
    >
      {children}
    </BorderBeam>
  );
}

export default function TVMediaPage() {
  const [rateCards, setRateCards] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [selectedAdFormatId, setSelectedAdFormatId] = useState(null);
  const [campaignStart, setCampaignStart] = useState(null);
  const [campaignEnd, setCampaignEnd] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedAirtimeSlotIds, setSelectedAirtimeSlotIds] = useState([]);
  const [selectedSpotLengthsSec, setSelectedSpotLengthsSec] = useState([]);
  /** Per selected airtime slot: frequency option id */
  const [slotFrequencyById, setSlotFrequencyById] = useState({});
  /** index 0 = Sun … 6 = Sat */
  const [activeBroadcastDays, setActiveBroadcastDays] = useState(() => [
    false,
    true,
    true,
    true,
    true,
    true,
    false,
  ]);

  /** When exactly one spot length is selected, show airtime prices for that duration. */
  const selectedSingleSpotSec =
    selectedSpotLengthsSec.length === 1 ? selectedSpotLengthsSec[0] : null;
  const [mediaCampaignName, setMediaCampaignName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [audienceTypeIds, setAudienceTypeIds] = useState([]);
  const [objectiveIds, setObjectiveIds] = useState([]);
  const [industryIds, setIndustryIds] = useState([]);
  const [contactFullName, setContactFullName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  /** From media agency rate card smart tables (row ids = slot ids) */
  const [airtimeSlots, setAirtimeSlots] = useState([]);
  const [airtimeSlotsLoading, setAirtimeSlotsLoading] = useState(false);
  const [airtimeSlotsError, setAirtimeSlotsError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [draftId, setDraftId] = useState(null);
  const draftHydratedRef = useRef(false);
  const pendingDraftSlotsRef = useRef(null);

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
      if (seed.rateCardId) setSelectedStationId(seed.rateCardId);
      setCurrentStep(2);
      toast.message(
        seed.rateCardId
          ? `Adding another TV flight to “${seed.mediaCampaignName}” — pick format & airtime`
          : `Adding another TV flight to “${seed.mediaCampaignName}” — pick station & format`
      );
      return;
    }

    const id = params.get("draft");
    if (!id) return;
    const draft = getMediaPlannerDraft(id);
    if (!draft || String(draft.channel || "TV").toUpperCase() !== "TV") return;

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
    setSelectedStationId(draft.rateCardId || null);
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
    const pending = pendingDraftSlotsRef.current;
    if (!pending || !selectedStationId || airtimeSlotsLoading) return;

    setSelectedAirtimeSlotIds(pending.slotIds || []);
    setSelectedSpotLengthsSec(pending.spotLengthsSec || []);
    if (pending.slotFrequencies && Object.keys(pending.slotFrequencies).length > 0) {
      setSlotFrequencyById(pending.slotFrequencies);
    }
    if (pending.activeBroadcastDays?.length === 7) {
      setActiveBroadcastDays(pending.activeBroadcastDays);
    }
    pendingDraftSlotsRef.current = null;
  }, [selectedStationId, selectedAdFormatId, airtimeSlotsLoading, airtimeSlots]);

  useEffect(() => {
    setSlotFrequencyById((prev) => {
      const next = {};
      for (const id of selectedAirtimeSlotIds) {
        next[id] = prev[id] || "once";
      }
      return next;
    });
  }, [selectedAirtimeSlotIds]);

  const tvAdFormats = useMemo(() => getTvAdFormatsForGrid(), []);

  useEffect(() => {
    getPublishedRateCards("TV").then((result) => {
      if (result.success && result.rateCards?.length) {
        setRateCards(result.rateCards);
      }
    });
  }, []);

  useEffect(() => {
    setSelectedAirtimeSlotIds([]);
  }, [selectedStationId, selectedAdFormatId]);

  useEffect(() => {
    if (!selectedStationId) {
      setAirtimeSlots([]);
      setAirtimeSlotsError(null);
      return;
    }
    let cancelled = false;
    setAirtimeSlotsLoading(true);
    setAirtimeSlotsError(null);
    getRateCardSchedulerSlots(selectedStationId, selectedAdFormatId)
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          setAirtimeSlots(res.slots || []);
        } else {
          setAirtimeSlots([]);
          setAirtimeSlotsError(res.error || "Could not load airtime slots");
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setAirtimeSlots([]);
          setAirtimeSlotsError(e.message || "Could not load airtime slots");
        }
      })
      .finally(() => {
        if (!cancelled) setAirtimeSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedStationId, selectedAdFormatId]);

  const selectedRateCard = useMemo(
    () => rateCards.find((r) => r.id === selectedStationId),
    [rateCards, selectedStationId]
  );

  const canProceedCampaign = Boolean(mediaCampaignName?.trim() && audienceTypeIds.length > 0);
  const canProceedStation = Boolean(selectedStationId && selectedAdFormatId);

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

  /** Sum of rate-card amounts per spot length across selected rows (15s/30s/… columns when set) */
  const rateSubtotalBySec = useMemo(() => {
    const m = Object.fromEntries(SPOT_LENGTH_OPTIONS.map(({ sec }) => [sec, 0]));
    for (const id of selectedAirtimeSlotIds) {
      const slot = airtimeSlots.find((s) => s.id === id);
      for (const { sec } of SPOT_LENGTH_OPTIONS) {
        m[sec] += getSlotRateForSec(slot, sec);
      }
    }
    return m;
  }, [selectedAirtimeSlotIds, airtimeSlots]);

  /** Per-slot lines: rate × days × frequency */
  const pricingLineItems = useMemo(
    () =>
      buildMediaPlannerLineItems({
        slotIds: selectedAirtimeSlotIds,
        slots: airtimeSlots,
        spotSec: selectedSingleSpotSec,
        frequencyBySlotId: slotFrequencyById,
        dayCount: pricingDayCount,
        getSlotRateForSec,
      }),
    [
      selectedAirtimeSlotIds,
      airtimeSlots,
      selectedSingleSpotSec,
      slotFrequencyById,
      pricingDayCount,
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

  const canAddToCart = Boolean(
    mediaCampaignName?.trim() &&
      audienceTypeIds.length > 0 &&
      selectedRateCard &&
      selectedAdFormatId &&
      campaignStart &&
      selectedAirtimeSlotIds.length > 0 &&
      pricingTotal > 0
  );

  const canSaveDraft = Boolean(mediaCampaignName?.trim());

  const buildPlannerItem = () => {
    const adFormat = tvAdFormats.find((t) => t.id === selectedAdFormatId);
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
      channel: "TV",
      rateCardId: selectedRateCard?.id || selectedStationId || null,
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
      if (!mediaCampaignName?.trim()) {
        toast.error("Enter a media campaign name");
        return;
      }
      if (selectedAirtimeSlotIds.length === 0) {
        toast.error("Select airtime slots before adding to cart");
        return;
      }
      if (!campaignStart) {
        toast.error("Pick campaign dates before adding to cart");
        return;
      }
      toast.error("Complete the planner before adding to cart");
      return;
    }

    addMediaPlannerCartItem(buildPlannerItem());
    if (draftId) {
      removeMediaPlannerDraft(draftId);
      setDraftId(null);
    }

    setCartCount(mediaPlannerCartCount(loadMediaPlannerCart()));
    toast.success("Added to media cart", {
      action: {
        label: "View cart",
        onClick: () => {
          window.location.href = "/products/media-cart";
        },
      },
    });
  };

  return (
    <div className="min-h-[calc(100dvh-5.25rem)] bg-white text-slate-900 antialiased selection:bg-primary/20 md:min-h-[calc(100dvh-7rem)]">
      <ProductsChannelTopBar title="TV Media" icon={Tv} variant="light" showChannelLabel={false} />

      <div className="relative mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <MediaPlannerIntro
          className="pt-2 sm:pt-3"
          title="Television advertising"
          description="Build a TV flight in one place—campaign brief, stations, dates, airtime, and estimate."
          cartCount={cartCount}
        />

        {/* Campaign Scheduler */}
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
                campaignNameId="tv-media-campaign-name"
                brandNameId="tv-media-brand-name"
                contactNameId="tv-media-contact-name"
                contactPhoneId="tv-media-contact-phone"
                contactEmailId="tv-media-contact-email"
                continueDisabled={!canProceedCampaign}
                continueLabel="Continue to station"
                onContinue={() => setCurrentStep(2)}
              />
            )}

            {/* Step 2: Station & Format */}
            {currentStep === 2 && (
              <div className="space-y-12">
                <div>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-sm">
                    Choose station
                  </h3>
                  {rateCards.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-base text-slate-500">
                      No TV rate cards available yet. Check back soon or contact a media agency.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
                      {rateCards.map((card) => (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => setSelectedStationId(card.id)}
                          className={cn(
                            "text-left rounded-2xl border p-5 transition-all hover:border-primary/40 hover:shadow-sm",
                            selectedStationId === card.id
                              ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-sm"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center justify-center rounded-md bg-[#0071e3]/90 px-2 py-0.5 text-[11px] font-bold text-white sm:text-xs">
                              <Tv className="h-3 w-3 mr-0.5" />
                              TV
                            </span>
                          </div>
                          <p className="text-base font-semibold leading-snug text-foreground">{card.title}</p>
                          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                            {card.location || "Nationwide"}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-sm">
                    Ad format
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground sm:text-base">
                    All formats: TVC, LPM, jingles, sponsorship, announcements, interviews, product placement, documentary, and billboards.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
                    {tvAdFormats.map((format) => {
                      const iconSrc = AD_FORMAT_ICON_SRC[format.id];
                      return (
                        <button
                          key={format.id}
                          type="button"
                          onClick={() => setSelectedAdFormatId(format.id)}
                          className={cn(
                            "text-left rounded-2xl border p-5 transition-all hover:border-primary/40 hover:shadow-sm",
                            selectedAdFormatId === format.id
                              ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-sm"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          )}
                        >
                          <div
                            className={cn(
                              "mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl transition-colors sm:h-16 sm:w-16",
                              selectedAdFormatId === format.id
                                ? "bg-primary/10 ring-1 ring-primary/20"
                                : "bg-slate-50"
                            )}
                          >
                            {iconSrc ? (
                              <img
                                src={iconSrc}
                                alt=""
                                className="h-10 w-10 object-contain dark:opacity-95 sm:h-11 sm:w-11"
                              />
                            ) : (
                              <Tv className="h-8 w-8 text-muted-foreground sm:h-9 sm:w-9" strokeWidth={1.75} />
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
                    disabled={!canProceedStation}
                    onClick={() => setCurrentStep(3)}
                    className="h-12 min-w-[10rem] rounded-full bg-slate-900 px-8 text-base font-medium text-white hover:bg-slate-800 disabled:opacity-40"
                  >
                    Next: Dates
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Campaign window — calendar + summary stay in sync */}
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
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-full border-slate-200 bg-white px-5 text-base text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                    onClick={() => setCurrentStep(2)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="h-12 rounded-full bg-slate-900 px-8 text-base font-medium text-white hover:bg-slate-800"
                    onClick={() => setCurrentStep(4)}
                  >
                    Next: Airtimes &amp; spots
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Airtimes & spots */}
            {currentStep === 4 && (
              <div className="space-y-8 sm:space-y-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                      Airtimes &amp; spots
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
                      Pick a spot length, then stack the dayparts you want. Estimates follow this station&apos;s rate card.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedAdFormatId ? (
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                        {tvAdFormats.find((f) => f.id === selectedAdFormatId)?.label ?? selectedAdFormatId}
                      </span>
                    ) : null}
                    {campaignStart && campaignDayCount > 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        <CalendarRange className="h-3.5 w-3.5" />
                        {campaignDayCount} day{campaignDayCount === 1 ? "" : "s"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200/80">
                        Dates not set — showing daily rates
                      </span>
                    )}
                  </div>
                </div>

                {/* Spot length first so airtime cards can show price */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                          1
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900 sm:text-base">
                          Spot length
                        </h4>
                      </div>
                      <p className="mt-1.5 text-sm text-slate-500">
                        Choose one duration. Airtime prices update to match.
                      </p>
                    </div>
                    {selectedSingleSpotSec != null ? (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/70">
                        {SPOT_LENGTH_OPTIONS.find((o) => o.sec === selectedSingleSpotSec)?.short} selected
                      </span>
                    ) : null}
                  </div>

                  <div
                    role="radiogroup"
                    aria-label="Spot length"
                    className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
                  >
                    {SPOT_LENGTH_OPTIONS.map(({ sec, short, subtitle }) => {
                      const selected = selectedSpotLengthsSec.includes(sec);
                      const rateSum = rateSubtotalBySec[sec] ?? 0;
                      const campaignEst = Math.round(rateSum * pricingDayCount);
                      const showEstimate = selected && selectedAirtimeSlotIds.length > 0;
                      const card = (
                        <button
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => toggleSpotLength(sec)}
                          className={cn(
                            "group relative flex min-h-[5.75rem] w-full flex-col items-center justify-center gap-0.5 rounded-2xl bg-white px-3 py-4 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all",
                            !selected &&
                              "ring-1 ring-slate-200/90 hover:-translate-y-0.5 hover:shadow-md",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2"
                          )}
                        >
                          {selected ? (
                            <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                          ) : null}
                          <span className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                            {short}
                          </span>
                          <span className="text-xs font-medium text-slate-500">{subtitle}</span>
                          {showEstimate ? (
                            <span className="mt-1 text-[11px] font-semibold tabular-nums text-slate-700">
                              GH₵{campaignEst.toLocaleString()}
                            </span>
                          ) : null}
                        </button>
                      );
                      return selected ? (
                        <PlannerBorderBeam key={sec} borderRadius={16}>
                          {card}
                        </PlannerBorderBeam>
                      ) : (
                        <div key={sec}>{card}</div>
                      );
                    })}
                  </div>
                </div>

                {/* Airtime slots */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                          2
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900 sm:text-base">
                          Airtime slots
                        </h4>
                      </div>
                      <p className="mt-1.5 max-w-lg text-sm text-slate-500">
                        Select every daypart you want. Unavailable slots stay greyed out.
                        {selectedSingleSpotSec == null
                          ? " Pick a spot length above to unlock pricing."
                          : null}
                      </p>
                    </div>
                    {selectedAirtimeSlotIds.length > 0 ? (
                      <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        <Clock className="h-3.5 w-3.5" />
                        {selectedAirtimeSlotIds.length} slot
                        {selectedAirtimeSlotIds.length === 1 ? "" : "s"} selected
                      </span>
                    ) : null}
                  </div>

                  {airtimeSlotsError && (
                    <p className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {airtimeSlotsError}
                    </p>
                  )}

                  {airtimeSlotsLoading ? (
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-14 text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
                      <span className="text-sm">Loading airtime from rate card…</span>
                    </div>
                  ) : airtimeSlots.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-10 text-center text-sm text-slate-500">
                      No airtime rows for this ad format. Check the rate card&apos;s ad type column, or try another format.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {airtimeSlots.map((slot) => {
                        const selected = selectedAirtimeSlotIds.includes(slot.id);
                        const disabled = slot.booked;
                        const displayedDailyRate =
                          selectedSingleSpotSec != null
                            ? getSlotRateForSec(slot, selectedSingleSpotSec)
                            : null;
                        const campaignTotal =
                          displayedDailyRate != null
                            ? slotCampaignTotalGhs(displayedDailyRate, pricingDayCount)
                            : null;
                        const impressionsLabel = formatCompactCount(slot.impressionsPerAiring);
                        const isDemoImpressions = slot.impressionsSource !== "agency";
                        const card = (
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => toggleAirtimeSlot(slot.id)}
                            aria-pressed={selected}
                            aria-disabled={disabled}
                            className={cn(
                              "group relative flex min-h-[7.5rem] w-full flex-col justify-between rounded-2xl bg-white p-4 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all sm:p-5",
                              disabled && "cursor-not-allowed opacity-50",
                              !disabled &&
                                !selected &&
                                "ring-1 ring-slate-200/90 hover:-translate-y-0.5 hover:shadow-md",
                              !disabled &&
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2"
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p
                                  className={cn(
                                    "truncate text-base font-semibold tracking-tight",
                                    disabled ? "text-slate-400" : "text-slate-900"
                                  )}
                                >
                                  {slot.label}
                                </p>
                                {slot.range ? (
                                  <p
                                    className={cn(
                                      "mt-1 inline-flex items-center gap-1.5 text-sm tabular-nums",
                                      disabled ? "text-slate-400" : "text-slate-500"
                                    )}
                                  >
                                    <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                    {slot.range}
                                  </p>
                                ) : null}
                                {!disabled ? (
                                  <MediaSlotPrograms
                                    programs={slot.programs}
                                    programsSource={slot.programsSource}
                                    className="text-slate-500"
                                  />
                                ) : null}
                                {impressionsLabel && !disabled ? (
                                  <p className="mt-1.5 text-xs font-medium tabular-nums text-slate-500">
                                    ~{impressionsLabel}
                                    <span className="font-normal text-slate-400">
                                      {" "}
                                      / airing
                                      {isDemoImpressions ? " · demo" : ""}
                                    </span>
                                  </p>
                                ) : null}
                              </div>
                              <span
                                className={cn(
                                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                                  disabled && "border-slate-200 bg-slate-100",
                                  !disabled &&
                                    selected &&
                                    "border-slate-900 bg-slate-900 text-white",
                                  !disabled &&
                                    !selected &&
                                    "border-slate-300 bg-white group-hover:border-slate-400"
                                )}
                                aria-hidden
                              >
                                {selected && !disabled ? (
                                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                ) : null}
                              </span>
                            </div>

                            <div className="mt-4 border-t border-slate-100 pt-3">
                              {disabled ? (
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Not available
                                </p>
                              ) : selectedSingleSpotSec == null ? (
                                <p className="text-xs font-medium text-slate-400">
                                  Select a spot length for pricing
                                </p>
                              ) : (
                                <div className="flex items-end justify-between gap-2">
                                  <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                      {pricingDayCount > 1 ? "Campaign total" : "Daily rate"}
                                    </p>
                                    <p className="mt-0.5 text-lg font-bold tabular-nums tracking-tight text-slate-900">
                                      GH₵{campaignTotal?.toLocaleString()}
                                    </p>
                                  </div>
                                  <p className="pb-0.5 text-right text-[11px] leading-snug text-slate-400 tabular-nums">
                                    {Math.round(displayedDailyRate ?? 0).toLocaleString()}
                                    /day
                                    {pricingDayCount > 1
                                      ? ` × ${pricingDayCount}d`
                                      : null}
                                    <br />
                                    {selectedSingleSpotSec}s spot
                                  </p>
                                </div>
                              )}
                            </div>
                          </button>
                        );

                        return selected && !disabled ? (
                          <PlannerBorderBeam key={slot.id} borderRadius={16}>
                            {card}
                          </PlannerBorderBeam>
                        ) : (
                          <div key={slot.id}>{card}</div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Selection summary */}
                {(selectedAirtimeSlotIds.length > 0 || selectedSingleSpotSec != null) && (
                  <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="text-sm text-slate-600">
                      {selectedAirtimeSlotIds.length > 0 ? (
                        <>
                          <span className="font-semibold text-slate-900">
                            {selectedAirtimeSlotIds.length} daypart
                            {selectedAirtimeSlotIds.length === 1 ? "" : "s"}
                          </span>
                          {selectedSingleSpotSec != null ? (
                            <>
                              {" "}
                              ·{" "}
                              <span className="font-semibold text-slate-900">
                                {SPOT_LENGTH_OPTIONS.find((o) => o.sec === selectedSingleSpotSec)?.short}
                              </span>{" "}
                              spots
                            </>
                          ) : (
                            <span className="text-amber-700"> · choose a spot length</span>
                          )}
                        </>
                      ) : (
                        <span className="text-amber-700">
                          Spot length set — select at least one airtime slot
                        </span>
                      )}
                    </p>
                    {selectedAirtimeSlotIds.length > 0 && selectedSingleSpotSec != null ? (
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums text-slate-900">
                          Est. GH₵
                          {Math.round(
                            (rateSubtotalBySec[selectedSingleSpotSec] ?? 0) * pricingDayCount
                          ).toLocaleString()}
                        </p>
                        {(() => {
                          const baseImpressions = selectedAirtimeSlotIds.reduce((sum, id) => {
                            const slot = airtimeSlots.find((s) => s.id === id);
                            const n = Number(slot?.impressionsPerAiring);
                            return sum + (Number.isFinite(n) && n > 0 ? n : 0);
                          }, 0);
                          const label = formatCompactCount(baseImpressions * pricingDayCount);
                          return label ? (
                            <p className="mt-0.5 text-xs font-medium tabular-nums text-slate-500">
                              Est. {label} impressions
                            </p>
                          ) : null;
                        })()}
                      </div>
                    ) : null}
                  </div>
                )}

                <div className="flex justify-between border-t border-slate-200/80 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-full border-slate-200 bg-white px-5 text-base text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                    onClick={() => setCurrentStep(3)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="h-12 rounded-full bg-slate-900 px-8 text-base font-medium text-white hover:bg-slate-800 disabled:opacity-40"
                    disabled={
                      selectedAirtimeSlotIds.length === 0 || selectedSingleSpotSec == null
                    }
                    onClick={() => setCurrentStep(5)}
                  >
                    Next: Frequency
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Frequency */}
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
                    disabled={!allSlotsHaveFrequency || !activeBroadcastDays.some(Boolean)}
                    onClick={() => setCurrentStep(6)}
                  >
                    Next: Review &amp; confirm
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Confirm — checkout-style review */}
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
                    adFormatLabel={tvAdFormats.find((t) => t.id === selectedAdFormatId)?.label}
                    spotLengthLabel={
                      selectedSingleSpotSec != null
                        ? SPOT_LENGTH_OPTIONS.find((o) => o.sec === selectedSingleSpotSec)?.short ||
                          `${selectedSingleSpotSec}s`
                        : null
                    }
                    windowStartLabel={formatCampaignDate(campaignStart)}
                    windowEndLabel={formatCampaignDate(campaignEnd || campaignStart)}
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
                      selectedAirtimeSlotIds.length > 0 ? (
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
                      ) : (
                        <p className="text-sm text-slate-500">
                          Tax and total appear once you add airtime slots in the previous step.
                        </p>
                      )
                    }
                  >
                    <p className="mb-4 text-sm leading-relaxed text-slate-500">
                      Each slot uses its rate-card amount × campaign days × how many times it airs per day.
                      Impressions use the same multipliers when the rate card includes avg audience per airing.
                      VAT (15%) and NHIL &amp; GETFund (5%) are included.
                    </p>

                    {pricingLineItems.length > 0 ? (
                      <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                          Slots
                          {selectedSingleSpotSec != null
                            ? ` · ${SPOT_LENGTH_OPTIONS.find((o) => o.sec === selectedSingleSpotSec)?.short || `${selectedSingleSpotSec}s`}`
                            : ""}
                        </p>
                        {pricingLineItems.map((line) => {
                          const impressionsLabel = formatCompactCount(line.lineImpressions);
                          return (
                            <div
                              key={line.id}
                              className="flex justify-between gap-3 border-b border-slate-200/70 pb-2.5 last:border-0 last:pb-0"
                            >
                              <span className="min-w-0">
                                <span className="text-sm font-semibold text-slate-900">
                                  {line.label}
                                </span>
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
                        No airtime slots selected—go back a step to build the estimate.
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
                    {selectedAirtimeSlotIds.length > 0 ? (
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
                    ) : null}
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
                      onClick={handleAddToCart}
                      disabled={!canAddToCart}
                      className="h-12 rounded-full bg-slate-900 px-8 text-base font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
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
                      : selectedAirtimeSlotIds.length === 0
                        ? "Select airtime slots in the previous steps to add this to your cart."
                        : !campaignStart
                          ? "Pick campaign dates before adding to cart."
                          : "Complete station, format, and pricing before adding to cart."}
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
