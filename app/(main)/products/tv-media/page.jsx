"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tv,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Play,
  Mic,
  Star,
  Box,
  Film,
  Music,
  Megaphone,
  MessageCircle,
  LayoutPanelTop,
  ChevronRight,
  ChevronLeft,
  Check,
  CalendarRange,
  Clock,
  User,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import { getHeaderImage } from "@/lib/getHeaderImage";
import { getPublishedRateCards } from "@/actions/media-agency";
import { TV_AD_TYPES } from "@/lib/ad-types";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Station & Format" },
  { id: 2, label: "Dates" },
  { id: 3, label: "Airtimes & Spots" },
  { id: 4, label: "Frequency" },
  { id: 5, label: "Confirm" },
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

const AD_FORMAT_ICONS = {
  play: Play,
  mic: Mic,
  star: Star,
  box: Box,
  film: Film,
  music: Music,
  megaphone: Megaphone,
  "message-circle": MessageCircle,
  "layout-panel-top": LayoutPanelTop,
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

const MONTHS = "January,February,March,April,May,June,July,August,September,October,November,December".split(",");
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

function getCalendarDays(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const days = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

function formatCampaignDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isDateInCampaignRange(day, start, end) {
  if (!day || !start) return false;
  const t = new Date(day);
  t.setHours(0, 0, 0, 0);
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  if (!end) return t.getTime() === s.getTime();
  const e = new Date(end);
  e.setHours(0, 0, 0, 0);
  const lo = Math.min(s.getTime(), e.getTime());
  const hi = Math.max(s.getTime(), e.getTime());
  return t.getTime() >= lo && t.getTime() <= hi;
}

function isRangeEndpoint(day, start, end) {
  if (!day || !start) return false;
  const t = new Date(day);
  t.setHours(0, 0, 0, 0);
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  if (!end) return t.getTime() === s.getTime();
  const e = new Date(end);
  e.setHours(0, 0, 0, 0);
  return t.getTime() === s.getTime() || t.getTime() === e.getTime();
}

/** Demo airtime blocks — illustrative weekly rates (`weeklyGhs` drives estimate); one slot booked */
const AIRTIME_SLOTS = [
  { id: "at-1", range: "05:00–06:00", label: "Early Morning", price: "GH₵16,800/wk", weeklyGhs: 16800, booked: false },
  { id: "at-2", range: "06:00–09:00", label: "Morning Drive", price: "GH₵22,400/wk", weeklyGhs: 22400, booked: false },
  { id: "at-3", range: "09:00–12:00", label: "Daytime", price: "GH₵18,900/wk", weeklyGhs: 18900, booked: false },
  { id: "at-4", range: "12:00–15:00", label: "Midday", price: "GH₵16,800/wk", weeklyGhs: 16800, booked: false },
  { id: "at-5", range: "15:00–18:00", label: "Afternoon", price: "GH₵20,400/wk", weeklyGhs: 20400, booked: false },
  { id: "at-6", range: "18:00–20:00", label: "Early Prime", price: "GH₵28,000/wk", weeklyGhs: 28000, booked: false },
  { id: "at-7", range: "20:00–22:00", label: "Evening", price: "", weeklyGhs: 0, booked: true },
  { id: "at-8", range: "22:00–00:00", label: "Late Night", price: "GH₵12,600/wk", weeklyGhs: 12600, booked: false },
];

const SPOT_LENGTH_OPTIONS = [
  { sec: 15, short: "15s", subtitle: "Teaser" },
  { sec: 30, short: "30s", subtitle: "Standard" },
  { sec: 45, short: "45s", subtitle: "Extended" },
  { sec: 60, short: "60s", subtitle: "Long-form" },
  { sec: 120, short: "2 min", subtitle: "Feature" },
];

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
  const [broadcastFrequencyId, setBroadcastFrequencyId] = useState(null);
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
  const [mediaCampaignName, setMediaCampaignName] = useState("");
  const [contactFullName, setContactFullName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const headerImage = getHeaderImage("/products/tv-media");

  const tvAdFormats = useMemo(() => getTvAdFormatsForGrid(), []);

  useEffect(() => {
    getPublishedRateCards("TV").then((result) => {
      if (result.success && result.rateCards?.length) {
        setRateCards(result.rateCards);
      }
    });
  }, []);

  const selectedRateCard = useMemo(
    () => rateCards.find((r) => r.id === selectedStationId),
    [rateCards, selectedStationId]
  );

  const canProceedStep1 = selectedStationId && selectedAdFormatId;

  const calendarDays = useMemo(
    () => getCalendarDays(calendarMonth.year, calendarMonth.month),
    [calendarMonth.year, calendarMonth.month]
  );

  const campaignDayCount = useMemo(
    () => getCampaignDayCount(campaignStart, campaignEnd),
    [campaignStart, campaignEnd]
  );

  const handleCampaignDayClick = (d) => {
    if (!d) return;
    if (!campaignStart || (campaignStart && campaignEnd)) {
      setCampaignStart(d);
      setCampaignEnd(null);
      return;
    }
    const s = campaignStart.getTime();
    const t = d.getTime();
    if (t < s) {
      setCampaignStart(d);
      setCampaignEnd(campaignStart);
    } else {
      setCampaignEnd(d);
    }
  };

  const quickSelectAnchor = campaignStart || new Date();

  const applyQuickSelect = (inclusiveDays) => {
    const start = new Date(quickSelectAnchor);
    start.setHours(0, 0, 0, 0);
    const end = addDays(start, inclusiveDays - 1);
    setCampaignStart(start);
    setCampaignEnd(end);
    setCalendarMonth({ year: start.getFullYear(), month: start.getMonth() });
  };

  const toggleAirtimeSlot = (id) => {
    const slot = AIRTIME_SLOTS.find((s) => s.id === id);
    if (slot?.booked) return;
    setSelectedAirtimeSlotIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSpotLength = (sec) => {
    setSelectedSpotLengthsSec((prev) =>
      prev.includes(sec) ? prev.filter((x) => x !== sec) : [...prev, sec]
    );
  };

  const toggleBroadcastDay = (index) => {
    setActiveBroadcastDays((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const activeDaysLabel = useMemo(() => {
    return WEEKDAY_SHORT.filter((_, i) => activeBroadcastDays[i]).join(", ");
  }, [activeBroadcastDays]);

  /** Weeks covered by the campaign window (ceil days/7), min 1 for estimate */
  const estimatedCampaignWeeks = useMemo(() => {
    if (!campaignStart || campaignDayCount === 0) return 1;
    return Math.max(1, Math.ceil(campaignDayCount / 7));
  }, [campaignStart, campaignDayCount]);

  const weeklyAirtimeSubtotal = useMemo(() => {
    return selectedAirtimeSlotIds.reduce((sum, id) => {
      const slot = AIRTIME_SLOTS.find((s) => s.id === id);
      return sum + (slot?.weeklyGhs ?? 0);
    }, 0);
  }, [selectedAirtimeSlotIds]);

  /** 30s baseline = 1×; blends multiple spot lengths */
  const spotLengthFactor = useMemo(() => {
    if (selectedSpotLengthsSec.length === 0) return 1;
    const avgSec =
      selectedSpotLengthsSec.reduce((a, b) => a + b, 0) / selectedSpotLengthsSec.length;
    return avgSec / 30;
  }, [selectedSpotLengthsSec]);

  const pricingSubtotal = useMemo(() => {
    return weeklyAirtimeSubtotal * estimatedCampaignWeeks * spotLengthFactor;
  }, [weeklyAirtimeSubtotal, estimatedCampaignWeeks, spotLengthFactor]);

  const pricingVat = pricingSubtotal * VAT_RATE;
  const pricingNhilGetfund = pricingSubtotal * NHIL_GETFUND_RATE;
  const pricingTotal = pricingSubtotal + pricingVat + pricingNhilGetfund;

  const rateCardHref =
    selectedRateCard && selectedAdFormatId
      ? `/rate-cards/${selectedRateCard.id}?adType=${selectedAdFormatId}`
      : null;

  const canProceedToRateCard = Boolean(mediaCampaignName?.trim() && rateCardHref);

  return (
    <div className="min-h-screen bg-black text-zinc-100 antialiased selection:bg-white/10 selection:text-white">
      {/* Top nav — minimal, glass */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-black/50">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/products"
            className="group flex items-center gap-2 text-[13px] font-medium text-zinc-500 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Products
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/[0.08]">
              <Tv className="h-4 w-4 text-zinc-300" strokeWidth={1.75} />
            </div>
            <span className="text-[13px] font-semibold tracking-tight text-white">TV Media</span>
          </div>
        </div>
      </nav>

      {/* Hero — restrained, cinematic fade */}
      <section className="relative h-44 sm:h-52 w-full overflow-hidden border-b border-white/[0.06]">
        <img
          src={headerImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[0.35]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
        <div className="relative mx-auto flex h-full max-w-5xl flex-col justify-end px-5 pb-8 sm:px-8 sm:pb-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">Campaign planner</p>
          <h1 className="mt-2 text-[1.75rem] font-semibold tracking-tight text-white sm:text-[2rem] sm:leading-tight">
            Television advertising
          </h1>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-zinc-500">
            Plan campaigns across Ghana TV networks—multi-slot booking, clear estimates, one flow.
          </p>
        </div>
      </section>

      {/* Campaign Scheduler */}
      <section className="px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[1.75rem] border border-white/[0.06] bg-white/[0.02] p-7 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-xl sm:p-9 md:p-10">
            {/* Header */}
            <div className="mb-10 sm:mb-12">
              <h2 className="text-[1.375rem] font-semibold tracking-tight text-white sm:text-2xl">
                Campaign Scheduler
              </h2>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-zinc-500">
                Select station, dates, airtime, frequency—then review. Same tax logic as rate card checkout.
              </p>
            </div>

            {/* Stepper — Apple-like: active = light pill on dark */}
            <div className="mb-11 sm:mb-12 -mx-1 overflow-x-auto pb-1">
              <div className="flex min-w-[min(100%,560px)] items-center justify-between gap-0.5 px-1 sm:gap-1">
                {STEPS.map((step, idx) => (
                  <div key={step.id} className="flex min-w-0 flex-1 items-center">
                    <div className="flex min-w-0 flex-1 flex-col items-center">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums transition-all duration-300 sm:h-9 sm:w-9 sm:text-xs",
                          currentStep === step.id
                            ? "bg-white text-black shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                            : currentStep > step.id
                              ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25"
                              : "border border-white/[0.1] bg-transparent text-zinc-600"
                        )}
                      >
                        {currentStep > step.id ? (
                          <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
                        ) : (
                          step.id
                        )}
                      </div>
                      <span
                        className={cn(
                          "mt-2.5 max-w-[76px] text-center text-[10px] font-medium leading-snug tracking-tight sm:max-w-none sm:text-[11px]",
                          currentStep === step.id ? "text-white" : "text-zinc-600"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "-mt-5 mx-0.5 hidden h-px min-w-[6px] flex-1 sm:mx-1 sm:block",
                          currentStep > step.id ? "bg-emerald-500/35" : "bg-white/[0.08]"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Station & Format */}
            {currentStep === 1 && (
              <div className="space-y-10">
                <div>
                  <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                    Choose station
                  </h3>
                  {rateCards.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-white/[0.08] py-10 text-center text-sm text-zinc-600">
                      No TV rate cards available yet. Check back soon or contact a media agency.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      {rateCards.map((card) => (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => setSelectedStationId(card.id)}
                          className={cn(
                            "text-left rounded-xl border p-4 transition-all hover:border-white/18",
                            selectedStationId === card.id
                              ? "border-white/25 bg-white/[0.06] ring-1 ring-white/12"
                              : "border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.06]"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center justify-center rounded-md bg-[#0071e3]/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
                              <Tv className="h-3 w-3 mr-0.5" />
                              TV
                            </span>
                          </div>
                          <p className="font-semibold text-white text-sm leading-snug">{card.title}</p>
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                            {card.location || "Nationwide"}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                    Ad format
                  </h3>
                  <p className="text-xs text-zinc-600 mb-4">
                    All formats: TVC, LPM, jingles, sponsorship, announcements, interviews, product placement, documentary, and billboards.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    {tvAdFormats.map((format) => {
                      const Icon = AD_FORMAT_ICONS[format.icon] || Play;
                      return (
                        <button
                          key={format.id}
                          type="button"
                          onClick={() => setSelectedAdFormatId(format.id)}
                          className={cn(
                            "text-left rounded-xl border p-4 transition-all hover:border-white/18",
                            selectedAdFormatId === format.id
                              ? "border-white/25 bg-white/[0.06] ring-1 ring-white/12"
                              : "border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.06]"
                          )}
                        >
                          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.05] text-zinc-400">
                            <Icon className="h-5 w-5" />
                          </div>
                          <p className="font-semibold text-white text-sm">{format.label}</p>
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{format.fullName}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    disabled={!canProceedStep1}
                    onClick={() => setCurrentStep(2)}
                    className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-6 disabled:opacity-40"
                  >
                    Next: Choose Dates
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Campaign window — calendar + summary stay in sync */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-white">Campaign dates</h3>
                  <p className="text-zinc-500 text-sm mt-1.5 max-w-2xl leading-relaxed">
                    Tap a start date, then an end date to set your flight window. One tap counts as a single-day
                    campaign—your summary updates immediately.
                  </p>
                </div>

                <div className="grid lg:grid-cols-[1fr_min(320px,100%)] gap-6 lg:gap-8 items-start">
                  {/* Calendar */}
                  <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarMonth((m) =>
                            m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 }
                          )
                        }
                        className="rounded-lg p-2 text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"
                        aria-label="Previous month"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="text-sm font-semibold text-white">
                        {MONTHS[calendarMonth.month]} {calendarMonth.year}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarMonth((m) =>
                            m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 }
                          )
                        }
                        className="rounded-lg p-2 text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"
                        aria-label="Next month"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-600 mb-2">
                      {WEEKDAY_LABELS.map((day) => (
                        <div key={day}>{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((d, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleCampaignDayClick(d)}
                          disabled={!d}
                          className={cn(
                            "aspect-square rounded-lg text-sm font-medium transition-colors min-h-[2.25rem]",
                            !d && "invisible pointer-events-none",
                            d &&
                              isDateInCampaignRange(d, campaignStart, campaignEnd) &&
                              "bg-white/12 text-white",
                            d &&
                              !isDateInCampaignRange(d, campaignStart, campaignEnd) &&
                              "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200",
                            d &&
                              isRangeEndpoint(d, campaignStart, campaignEnd) &&
                              "ring-2 ring-white/40 ring-offset-2 ring-offset-black z-10"
                          )}
                        >
                          {d ? d.getDate() : ""}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Campaign window summary */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5 space-y-5">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <CalendarRange className="h-4 w-4 shrink-0 text-zinc-500" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Campaign window
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-zinc-600 mb-1">Start</p>
                        <p className="text-base font-semibold text-white tabular-nums">
                          {campaignStart ? formatCampaignDate(campaignStart) : "— Not selected"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-zinc-600 mb-1">End</p>
                        <p className="text-base font-semibold text-white tabular-nums">
                          {campaignStart
                            ? campaignEnd
                              ? formatCampaignDate(campaignEnd)
                              : formatCampaignDate(campaignStart)
                            : "— Not selected"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-white/[0.08]">
                      <p className="text-[11px] uppercase tracking-wide text-zinc-600">Total days (inclusive)</p>
                      <p className="text-2xl sm:text-3xl font-semibold text-white tabular-nums tracking-tight">
                        {campaignDayCount}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-wide text-zinc-600">Quick select</p>
                      <p className="text-xs text-zinc-600 mb-4">
                        From {campaignStart ? "your start date" : "today"}—tap a preset to fill the range.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "1 week", days: 7 },
                          { label: "2 weeks", days: 14 },
                          { label: "1 month", days: 30 },
                          { label: "3 months", days: 90 },
                        ].map(({ label, days }) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => applyQuickSelect(days)}
                            className="rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-zinc-200 shadow-sm transition-colors hover:bg-white/[0.08] hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/12 bg-transparent text-zinc-200 hover:bg-white/[0.06]"
                    onClick={() => setCurrentStep(1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-6"
                    onClick={() => setCurrentStep(3)}
                  >
                    Next: Airtimes &amp; spots
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Airtimes & spots */}
            {currentStep === 3 && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-lg font-semibold text-white">Airtimes &amp; spots</h3>
                  <p className="text-zinc-500 text-sm mt-1.5 max-w-2xl leading-relaxed">
                    Choose where your ads run and which spot lengths apply. Rates shown are illustrative; your station
                    rate card has final pricing.
                  </p>
                </div>

                {/* Airtime slots */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-zinc-500" />
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                      Select airtime slots
                    </h4>
                  </div>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Greyed slots are fully booked. Your selections stack — each chosen slot runs your campaign.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {AIRTIME_SLOTS.map((slot) => {
                      const selected = selectedAirtimeSlotIds.includes(slot.id);
                      const disabled = slot.booked;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => toggleAirtimeSlot(slot.id)}
                          aria-pressed={selected}
                          aria-disabled={disabled}
                          className={cn(
                            "rounded-xl border p-3 sm:p-4 text-left transition-all min-h-[5.5rem] flex flex-col justify-between",
                            disabled &&
                              "opacity-45 cursor-not-allowed border-white/[0.06] bg-black/30 text-zinc-600",
                            !disabled &&
                              selected &&
                              "border-white/25 bg-white/[0.06] ring-1 ring-white/12 shadow-sm shadow-black/40",
                            !disabled &&
                              !selected &&
                              "border-white/[0.08] bg-white/[0.03] hover:border-white/18 hover:bg-white/[0.06]",
                            !disabled && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                          )}
                        >
                          <div>
                            <p className="text-sm font-semibold text-white tabular-nums">{slot.range}</p>
                            <p className="text-xs text-zinc-600 mt-0.5">{slot.label}</p>
                          </div>
                          {disabled ? (
                            <p className="text-xs font-semibold text-zinc-600 mt-2">Booked</p>
                          ) : (
                            <p className="mt-2 text-xs font-medium tabular-nums text-zinc-400">{slot.price}</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Spot lengths */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                    Select spot lengths
                  </h4>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Different spot lengths can run in the same campaign — e.g. 15s teaser + 30s full spot.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {SPOT_LENGTH_OPTIONS.map(({ sec, short, subtitle }) => {
                      const selected = selectedSpotLengthsSec.includes(sec);
                      return (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => toggleSpotLength(sec)}
                          aria-pressed={selected}
                          className={cn(
                            "rounded-xl border p-4 text-center transition-all min-h-[5.25rem] flex flex-col items-center justify-center gap-1",
                            selected
                              ? "border-white/25 bg-white/[0.06] ring-1 ring-white/12"
                              : "border-white/[0.08] bg-white/[0.03] hover:border-white/18 hover:bg-white/[0.06]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                          )}
                        >
                          <span className="text-lg font-bold text-white">{short}</span>
                          <span className="text-xs text-zinc-600">{subtitle}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/12 bg-transparent text-zinc-200 hover:bg-white/[0.06]"
                    onClick={() => setCurrentStep(2)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-6"
                    onClick={() => setCurrentStep(4)}
                  >
                    Next: Frequency
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Frequency */}
            {currentStep === 4 && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-lg font-semibold text-white">Frequency</h3>
                  <p className="text-zinc-500 text-sm mt-1.5 max-w-2xl leading-relaxed">
                    Set how often spots run and which days of the week apply. This pairs with the airtime slots you chose
                    in the previous step.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Broadcast frequency</h4>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    How often should each spot air within each selected time block?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {BROADCAST_FREQUENCY_OPTIONS.map(({ id, label }) => {
                      const selected = broadcastFrequencyId === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setBroadcastFrequencyId(id)}
                          aria-pressed={selected}
                          className={cn(
                            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                            selected
                              ? "bg-[#0071e3] text-white ring-2 ring-white/20"
                              : "border border-white/12 bg-white/[0.04] text-zinc-400 hover:border-white/18 hover:bg-white/[0.06]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Active broadcast days</h4>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAY_SHORT.map((label, i) => {
                      const on = activeBroadcastDays[i];
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => toggleBroadcastDay(i)}
                          aria-pressed={on}
                          className={cn(
                            "h-11 w-11 rounded-full text-xs font-semibold transition-colors shrink-0",
                            on
                              ? "bg-[#0071e3] text-white shadow-sm"
                              : "border border-white/[0.08] bg-black/35 text-zinc-600 hover:border-white/18 hover:text-zinc-500",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/12 bg-transparent text-zinc-200 hover:bg-white/[0.06]"
                    onClick={() => setCurrentStep(3)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-6"
                    onClick={() => setCurrentStep(5)}
                  >
                    Next: Review &amp; confirm
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Confirm — checkout-style review */}
            {currentStep === 5 && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-white">Review &amp; confirm</h3>
                  <p className="text-zinc-500 text-sm mt-1.5 max-w-2xl leading-relaxed">
                    Name your campaign, add billing contact details, and review the estimate. Final line items and
                    payment are completed on the station rate card (same tax treatment as rate card checkout).
                  </p>
                </div>

                {/* Campaign name + contact */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6 space-y-5">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <User className="h-4 w-4 shrink-0 text-zinc-500" />
                    <h4 className="text-sm font-semibold uppercase tracking-wide">Campaign &amp; contact</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tv-media-campaign-name" className="text-zinc-400">
                        Media campaign name <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="tv-media-campaign-name"
                        value={mediaCampaignName}
                        onChange={(e) => setMediaCampaignName(e.target.value)}
                        placeholder="e.g. Q1 Product Launch, Summer Promo"
                        className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600"
                        autoComplete="off"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tv-media-contact-name" className="text-zinc-500 text-xs">
                          Contact name
                        </Label>
                        <Input
                          id="tv-media-contact-name"
                          value={contactFullName}
                          onChange={(e) => setContactFullName(e.target.value)}
                          placeholder="Full name"
                          className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600"
                          autoComplete="name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tv-media-contact-phone" className="text-zinc-500 text-xs">
                          Phone
                        </Label>
                        <Input
                          id="tv-media-contact-phone"
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="+233 …"
                          className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600"
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tv-media-contact-email" className="text-zinc-500 text-xs">
                        Email
                      </Label>
                      <Input
                        id="tv-media-contact-email"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="billing@company.com"
                        className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                </div>

                {/* Campaign summary */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Campaign summary</h4>
                  <dl className="space-y-3 text-sm">
                    {selectedRateCard && (
                      <>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 border-b border-white/[0.08] pb-3">
                          <dt className="text-zinc-600 shrink-0">Station</dt>
                          <dd className="text-white font-medium text-right">{selectedRateCard.title}</dd>
                        </div>
                        {selectedRateCard.location && (
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 border-b border-white/[0.08] pb-3">
                            <dt className="text-zinc-600 shrink-0">Market / reach</dt>
                            <dd className="text-zinc-400 text-right flex items-center sm:justify-end gap-1">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              {selectedRateCard.location}
                            </dd>
                          </div>
                        )}
                      </>
                    )}
                    {selectedAdFormatId && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 border-b border-white/[0.08] pb-3">
                        <dt className="text-zinc-600 shrink-0">Ad format</dt>
                        <dd className="text-white font-medium text-right">
                          {tvAdFormats.find((t) => t.id === selectedAdFormatId)?.label}
                        </dd>
                      </div>
                    )}
                    {campaignStart && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 border-b border-white/[0.08] pb-3">
                        <dt className="text-zinc-600 shrink-0">Campaign window</dt>
                        <dd className="text-white font-medium text-right">
                          {formatCampaignDate(campaignStart)}
                          {" — "}
                          {campaignEnd ? formatCampaignDate(campaignEnd) : formatCampaignDate(campaignStart)}
                          <span className="text-zinc-500 font-normal">
                            {" "}
                            ({campaignDayCount} day{campaignDayCount === 1 ? "" : "s"})
                          </span>
                        </dd>
                      </div>
                    )}
                    {selectedAirtimeSlotIds.length > 0 && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 border-b border-white/[0.08] pb-3">
                        <dt className="text-zinc-600 shrink-0">Airtime slots</dt>
                        <dd className="text-white text-right max-w-md">
                          {selectedAirtimeSlotIds
                            .map((id) => AIRTIME_SLOTS.find((s) => s.id === id)?.range)
                            .filter(Boolean)
                            .join(", ")}
                        </dd>
                      </div>
                    )}
                    {selectedSpotLengthsSec.length > 0 && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 border-b border-white/[0.08] pb-3">
                        <dt className="text-zinc-600 shrink-0">Spot lengths</dt>
                        <dd className="text-white text-right">
                          {selectedSpotLengthsSec
                            .map(
                              (sec) => SPOT_LENGTH_OPTIONS.find((o) => o.sec === sec)?.short ?? `${sec}s`
                            )
                            .join(", ")}
                        </dd>
                      </div>
                    )}
                    {broadcastFrequencyId && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 border-b border-white/[0.08] pb-3">
                        <dt className="text-zinc-600 shrink-0">Broadcast frequency</dt>
                        <dd className="text-white font-medium text-right">
                          {BROADCAST_FREQUENCY_OPTIONS.find((f) => f.id === broadcastFrequencyId)?.label}
                        </dd>
                      </div>
                    )}
                    {activeDaysLabel && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 pb-1">
                        <dt className="text-zinc-600 shrink-0">Active broadcast days</dt>
                        <dd className="text-white text-right">{activeDaysLabel}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Pricing estimate + tax */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Receipt className="h-4 w-4 shrink-0 text-zinc-500" />
                    <h4 className="text-sm font-semibold uppercase tracking-wide">Pricing estimate</h4>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Illustrative weekly rates from the scheduler × campaign length × spot-length mix (30s = 1×). VAT
                    (15%) and NHIL &amp; GETFund (5%) apply to the subtotal as on the rate card.{" "}
                    <span className="text-zinc-500">Authoritative pricing is on the rate card.</span>
                  </p>

                  {selectedAirtimeSlotIds.length > 0 ? (
                    <div className="space-y-2 text-sm border border-white/[0.08] rounded-xl p-3 bg-black/35">
                      <p className="text-[11px] uppercase tracking-wide text-zinc-600 mb-2">Airtime (weekly)</p>
                      {selectedAirtimeSlotIds.map((id) => {
                        const slot = AIRTIME_SLOTS.find((s) => s.id === id);
                        if (!slot) return null;
                        return (
                          <div
                            key={id}
                            className="flex justify-between gap-3 text-zinc-400 border-b border-white/[0.06] last:border-0 last:pb-0 pb-2"
                          >
                            <span className="min-w-0">
                              {slot.range}{" "}
                              <span className="text-zinc-600">({slot.label})</span>
                            </span>
                            <span className="shrink-0 font-medium tabular-nums text-zinc-300">
                              ₵{slot.weeklyGhs.toLocaleString()}/wk
                            </span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between text-zinc-500 pt-2 text-xs">
                        <span>Weekly subtotal</span>
                        <span className="tabular-nums">₵{weeklyAirtimeSubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-zinc-500 text-xs">
                        <span>× Campaign length ({estimatedCampaignWeeks} wk)</span>
                        <span className="tabular-nums">× {estimatedCampaignWeeks}</span>
                      </div>
                      {selectedSpotLengthsSec.length > 0 && (
                        <div className="flex justify-between text-zinc-500 text-xs">
                          <span>× Spot mix vs 30s baseline</span>
                          <span className="tabular-nums">× {spotLengthFactor.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-600 rounded-xl border border-dashed border-white/[0.08] p-4">
                      No airtime slots selected in the scheduler—add slots in the previous step to see an estimate, or
                      build your campaign on the rate card.
                    </p>
                  )}

                  <div className="space-y-2 text-sm pt-2 border-t border-white/[0.08]">
                    {selectedAirtimeSlotIds.length > 0 ? (
                      <>
                        <div className="flex justify-between items-center text-zinc-500">
                          <span>Subtotal</span>
                          <span className="text-white tabular-nums">
                            ₵{Math.round(pricingSubtotal).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-zinc-500">
                          <span>VAT (15%)</span>
                          <span className="text-white tabular-nums">₵{Math.round(pricingVat).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-zinc-500">
                          <span>NHIL &amp; GETFund (5%)</span>
                          <span className="text-white tabular-nums">
                            ₵{Math.round(pricingNhilGetfund).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold pt-3 border-t border-white/[0.08]">
                          <span className="text-white">Total (est.)</span>
                          <span className="text-2xl font-semibold tabular-nums tracking-tight text-white">
                            ₵{Math.round(pricingTotal).toLocaleString()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-zinc-600 py-2">
                        Tax and total will reflect your line items once you add airtime slots—or when you build the
                        campaign on the rate card.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/12 bg-transparent text-zinc-200 hover:bg-white/[0.06]"
                    onClick={() => setCurrentStep(4)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  {rateCardHref ? (
                    canProceedToRateCard ? (
                      <Button asChild className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-6">
                        <Link
                          href={`${rateCardHref}&campaignName=${encodeURIComponent(mediaCampaignName.trim())}`}
                        >
                          Continue to rate card
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        disabled
                        className="rounded-full opacity-40 cursor-not-allowed"
                      >
                        Continue to rate card
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )
                  ) : (
                    <Button disabled className="rounded-full opacity-50">
                      Select station &amp; format first
                    </Button>
                  )}
                </div>
                {!canProceedToRateCard && rateCardHref && (
                  <p className="text-center text-xs text-zinc-500 sm:text-right">
                    Enter a media campaign name to continue.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Secondary: quick links to rate cards when step 1 not active or as reference */}
          {rateCards.length > 0 && currentStep === 1 && selectedStationId && selectedAdFormatId && (
            <p className="text-center text-xs text-zinc-600 mt-6">
              Or skip ahead:{" "}
              <Link
                href={rateCardHref}
                className="text-[#2997ff] transition-colors hover:text-[#5ac8fa]"
              >
                go directly to {selectedRateCard?.title}&apos;s rate card
              </Link>
            </p>
          )}
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-10 text-center">
        <p className="text-[11px] font-medium tracking-wide text-zinc-600">
          © {new Date().getFullYear()} Payollar. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
