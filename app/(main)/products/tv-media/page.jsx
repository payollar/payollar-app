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
  ChevronRight,
  ChevronLeft,
  Check,
  CalendarRange,
  Clock,
  User,
  Receipt,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { getHeaderImage } from "@/lib/getHeaderImage";
import { getPublishedRateCards } from "@/actions/media-agency";
import { getRateCardSchedulerSlots } from "@/actions/tv-media-airtime";
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

/** Same teal / warm radial wash as TV hero — reused on Campaign Scheduler card */
const TV_MEDIA_ACCENT_RADIAL_CLASS =
  "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,oklch(0.6_0.12_184.704/0.12),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_100%,oklch(0.65_0.2_41.116/0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,oklch(0.55_0.18_264.376/0.18),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_100%,oklch(0.65_0.17_162.48/0.12),transparent_50%)]";

/** Soft vertical blend — scheduler uses lighter stops so card stays readable */
const TV_MEDIA_SCHEDULER_VERTICAL_FADE_CLASS =
  "pointer-events-none absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-chart-2/[0.04] dark:from-background/15 dark:via-chart-2/[0.06] dark:to-chart-1/[0.05]";

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
  /** From media agency rate card smart tables (row ids = slot ids) */
  const [airtimeSlots, setAirtimeSlots] = useState([]);
  const [airtimeSlotsLoading, setAirtimeSlotsLoading] = useState(false);
  const [airtimeSlotsError, setAirtimeSlotsError] = useState(null);
  const headerImage = getHeaderImage("/products/tv-media");

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

  const canProceedStep1 = selectedStationId && selectedAdFormatId;

  const calendarDays = useMemo(
    () => getCalendarDays(calendarMonth.year, calendarMonth.month),
    [calendarMonth.year, calendarMonth.month]
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
    const slot = airtimeSlots.find((s) => s.id === id);
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

  /** Sum of agency-entered rates for selected airtime rows (baseline 30s column) */
  const airtimeRateSubtotal = useMemo(() => {
    return selectedAirtimeSlotIds.reduce((sum, id) => {
      const slot = airtimeSlots.find((s) => s.id === id);
      return sum + (slot?.rateGhs ?? slot?.weeklyGhs ?? 0);
    }, 0);
  }, [selectedAirtimeSlotIds, airtimeSlots]);

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

  /** No spot lengths selected → baseline total; otherwise sum each selected duration’s rate */
  const spotMixRateSubtotal = useMemo(() => {
    if (selectedSpotLengthsSec.length === 0) return airtimeRateSubtotal;
    return selectedSpotLengthsSec.reduce((sum, sec) => sum + (rateSubtotalBySec[sec] ?? 0), 0);
  }, [selectedSpotLengthsSec, rateSubtotalBySec, airtimeRateSubtotal]);

  /** Subtotal = sum of rate-card amounts for selected mix × campaign days */
  const pricingSubtotal = useMemo(() => {
    return spotMixRateSubtotal * pricingDayCount;
  }, [spotMixRateSubtotal, pricingDayCount]);

  const pricingVat = pricingSubtotal * VAT_RATE;
  const pricingNhilGetfund = pricingSubtotal * NHIL_GETFUND_RATE;
  const pricingTotal = pricingSubtotal + pricingVat + pricingNhilGetfund;

  const rateCardHref =
    selectedRateCard && selectedAdFormatId
      ? `/rate-cards/${selectedRateCard.id}?adType=${selectedAdFormatId}`
      : null;

  const canProceedToRateCard = Boolean(mediaCampaignName?.trim() && rateCardHref);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-chart-2/25">
      {/* Top nav — matches app shell */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-10">
          <Link
            href="/products"
            className="group flex items-center gap-2 text-base font-medium text-muted-foreground transition-colors hover:text-chart-2"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Products
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-chart-2/10 ring-1 ring-chart-2/25 dark:bg-chart-2/15 dark:ring-chart-2/30">
              <Tv className="h-[18px] w-[18px] text-chart-2" strokeWidth={1.75} />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">TV Media</span>
          </div>
        </div>
      </nav>

      {/* Hero — inset rounded panel so background image & overlays have rounded corners */}
      <section className="relative mx-3 mt-2 min-h-[min(52vh,380px)] w-auto max-w-none overflow-hidden rounded-2xl border border-border sm:mx-6 sm:mt-3 sm:min-h-[300px] sm:rounded-3xl lg:mx-8 lg:min-h-[340px]">
        <img
          src={headerImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
        <div className={TV_MEDIA_ACCENT_RADIAL_CLASS} />
        <div className="relative mx-auto flex min-h-[min(52vh,380px)] max-w-6xl flex-col justify-center px-5 py-10 sm:min-h-[300px] sm:px-10 sm:py-12 lg:min-h-[340px]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-chart-2 sm:text-sm">
            Campaign planner
          </p>
          <div className="mt-3 flex flex-col gap-6 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8 lg:gap-12">
            <h1 className="min-w-0 max-w-xl flex-1 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl sm:leading-[1.12] lg:text-[2.5rem] lg:leading-[1.1]">
              Television advertising
            </h1>
            <div className="relative shrink-0 sm:flex sm:max-w-[min(40%,320px)] sm:flex-1 sm:justify-end lg:max-w-[min(38%,360px)]">
              <img
                src="/tvv.PNG"
                alt=""
                className="mx-auto h-[min(28vw,120px)] w-auto max-h-[140px] object-contain object-bottom drop-shadow-md dark:drop-shadow-[0_12px_40px_rgba(0,0,0,0.45)] sm:mx-0 sm:h-[min(22vw,150px)] sm:max-h-[170px] lg:h-[min(20vw,180px)] lg:max-h-[200px]"
              />
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:mt-6 sm:max-w-[min(100%,36rem)] sm:text-lg">
            Plan campaigns across Ghana TV networks—multi-slot booking, clear estimates, one flow.
          </p>
        </div>
      </section>

      {/* Campaign Scheduler */}
      <section className="px-4 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-16 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card/90 shadow-sm shadow-chart-2/5 ring-1 ring-chart-1/5 backdrop-blur-sm dark:shadow-chart-2/10 dark:ring-chart-2/10">
            <div className={TV_MEDIA_SCHEDULER_VERTICAL_FADE_CLASS} aria-hidden />
            <div className={TV_MEDIA_ACCENT_RADIAL_CLASS} aria-hidden />
            <div className="relative z-[1] p-8 sm:p-10 md:p-12">
            {/* Header */}
            <div className="mb-11 sm:mb-14">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Media Scheduler
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Select station, dates, airtime, frequency—then review. Same tax logic as rate card checkout.
              </p>
            </div>

            {/* Stepper */}
            <div className="mb-12 sm:mb-14 -mx-1 overflow-x-auto pb-1">
              <div className="flex min-w-[min(100%,620px)] items-center justify-between gap-1 px-1 sm:gap-2">
                {STEPS.map((step, idx) => (
                  <div key={step.id} className="flex min-w-0 flex-1 items-center">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(step.id)}
                      aria-current={currentStep === step.id ? "step" : undefined}
                      aria-label={`Go to step ${step.id}: ${step.label}`}
                      className={cn(
                        "group flex min-w-0 flex-1 flex-col items-center rounded-xl px-0.5 pb-1 pt-0.5 outline-none transition-colors",
                        "hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-chart-2/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-all duration-300 sm:h-11 sm:w-11 sm:text-sm",
                          "group-hover:ring-1 group-hover:ring-chart-2/25",
                          currentStep === step.id
                            ? "bg-chart-2/20 text-chart-2 shadow-sm ring-1 ring-chart-2/35 dark:bg-chart-2/25 dark:text-chart-2"
                            : currentStep > step.id
                              ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25"
                              : "border border-border bg-muted/30 text-muted-foreground"
                        )}
                      >
                        {currentStep > step.id ? (
                          <Check className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2.5} />
                        ) : (
                          step.id
                        )}
                      </div>
                      <span
                        className={cn(
                          "mt-3 max-w-[92px] text-center text-[11px] font-medium leading-snug tracking-tight sm:max-w-none sm:text-xs sm:leading-tight",
                          currentStep === step.id ? "text-chart-2" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      >
                        {step.label}
                      </span>
                    </button>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "-mt-6 mx-0.5 hidden h-px min-w-[8px] flex-1 sm:mx-1.5 sm:block",
                          currentStep > step.id ? "bg-emerald-500/35" : "bg-border"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Station & Format */}
            {currentStep === 1 && (
              <div className="space-y-12">
                <div>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-sm">
                    Choose station
                  </h3>
                  {rateCards.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-border py-10 text-center text-base text-muted-foreground">
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
                            "text-left rounded-2xl border p-5 transition-all hover:border-primary/35",
                            selectedStationId === card.id
                              ? "border-primary/45 bg-muted/60 ring-1 ring-border"
                              : "border-border bg-muted/50 hover:bg-muted/60"
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
                            "text-left rounded-2xl border p-5 transition-all hover:border-primary/35",
                            selectedAdFormatId === format.id
                              ? "border-primary/45 bg-muted/60 ring-1 ring-border"
                              : "border-border bg-muted/50 hover:bg-muted/60"
                          )}
                        >
                          <div
                            className={cn(
                              "mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl transition-colors sm:h-16 sm:w-16",
                              selectedAdFormatId === format.id
                                ? "bg-chart-2/15 ring-1 ring-chart-2/25"
                                : "bg-muted/50"
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

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    disabled={!canProceedStep1}
                    onClick={() => setCurrentStep(2)}
                    className="h-12 min-w-[10rem] rounded-full bg-[#0071e3] px-8 text-base font-medium text-white hover:bg-[#0077ed] disabled:opacity-40"
                  >
                    Next: Choose Dates
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Campaign window — calendar + summary stay in sync */}
            {currentStep === 2 && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Campaign dates</h3>
                  <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                    Tap a start date, then an end date to set your flight window. One tap counts as a single-day
                    campaign—your summary updates immediately.
                  </p>
                </div>

                <div className="grid lg:grid-cols-[1fr_min(320px,100%)] gap-6 lg:gap-8 items-start">
                  {/* Calendar */}
                  <div className="rounded-2xl border border-border border-l-4 border-l-chart-2/45 bg-muted/40 p-5 sm:p-6 dark:border-l-chart-2/55">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarMonth((m) =>
                            m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 }
                          )
                        }
                        className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                        aria-label="Previous month"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="text-base font-semibold text-foreground sm:text-lg">
                        {MONTHS[calendarMonth.month]} {calendarMonth.year}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarMonth((m) =>
                            m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 }
                          )
                        }
                        className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                        aria-label="Next month"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
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
                            "aspect-square min-h-[2.5rem] rounded-lg text-sm font-medium transition-colors sm:min-h-[2.75rem] sm:text-base",
                            !d && "invisible pointer-events-none",
                            d &&
                              isDateInCampaignRange(d, campaignStart, campaignEnd) &&
                              "bg-chart-2/15 text-foreground dark:bg-chart-2/20",
                            d &&
                              !isDateInCampaignRange(d, campaignStart, campaignEnd) &&
                              "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                            d &&
                              isRangeEndpoint(d, campaignStart, campaignEnd) &&
                              "ring-2 ring-chart-2/50 ring-offset-2 ring-offset-background z-10 dark:ring-chart-2/45"
                          )}
                        >
                          {d ? d.getDate() : ""}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Campaign window summary */}
                  <div className="space-y-5 rounded-2xl border border-border border-l-4 border-l-chart-3/45 bg-muted/40 p-5 sm:p-6 dark:border-l-chart-3/55">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarRange className="h-4 w-4 shrink-0 text-chart-3" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:text-sm">
                        Campaign window
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground sm:text-xs">Start</p>
                        <p className="text-base font-semibold text-foreground tabular-nums sm:text-lg">
                          {campaignStart ? formatCampaignDate(campaignStart) : "— Not selected"}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground sm:text-xs">End</p>
                        <p className="text-base font-semibold text-foreground tabular-nums sm:text-lg">
                          {campaignStart
                            ? campaignEnd
                              ? formatCampaignDate(campaignEnd)
                              : formatCampaignDate(campaignStart)
                            : "— Not selected"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-border">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground sm:text-xs">Total days (inclusive)</p>
                      <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl">
                        {campaignDayCount}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground sm:text-xs">Quick select</p>
                      <p className="mb-3 text-xs text-muted-foreground sm:text-sm">
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
                            className="rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-chart-1/35 hover:bg-chart-1/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chart-2/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-base dark:hover:bg-chart-1/10"
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
                    className="h-11 rounded-full border-border bg-transparent px-5 text-base text-foreground hover:bg-muted/60"
                    onClick={() => setCurrentStep(1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="h-12 rounded-full bg-[#0071e3] px-8 text-base font-medium text-white hover:bg-[#0077ed]"
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
              <div className="space-y-12">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    Airtimes &amp; spots
                  </h3>
                  <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                    Choose where your ads run and which spot lengths apply. Rates shown are illustrative; your station
                    rate card has final pricing.
                  </p>
                  {campaignStart && campaignDayCount > 0 && (
                    <p className="mt-2 text-sm text-chart-3/95 dark:text-chart-3">
                      Campaign length: {campaignDayCount} day{campaignDayCount === 1 ? "" : "s"}. Each card shows total
                      for those days (daily × days).
                    </p>
                  )}
                </div>

                {/* Airtime slots */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-chart-3" />
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground sm:text-base">
                      Select airtime slots
                    </h4>
                  </div>
                  {selectedAdFormatId && (
                    <p className="text-sm font-medium text-foreground">
                      Showing airtime for{" "}
                      <span className="text-chart-3">
                        {tvAdFormats.find((f) => f.id === selectedAdFormatId)?.label ?? selectedAdFormatId}
                      </span>
                      — only rate-card rows for this ad format are listed (see ad-type column in the agency editor).
                    </p>
                  )}
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Slots and prices come from this station&apos;s published rate card. Greyed slots are marked not
                    bookable by the media agency. Your selections stack — each chosen slot runs your campaign.
                    {!campaignStart && (
                      <span className="text-muted-foreground">
                        {" "}
                        Set campaign dates in the previous step to multiply daily rates by the number of days.
                      </span>
                    )}
                  </p>
                  {airtimeSlotsError && (
                    <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {airtimeSlotsError}
                    </p>
                  )}
                  {airtimeSlotsLoading ? (
                    <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-16 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading airtime from rate card…</span>
                    </div>
                  ) : airtimeSlots.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground sm:text-base">
                      No airtime rows for this ad format. Ensure the rate card table includes an{" "}
                      <strong className="text-foreground">ad type</strong> column (or &quot;Ad format&quot; dropdown)
                      with values matching{" "}
                      {selectedAdFormatId
                        ? tvAdFormats.find((f) => f.id === selectedAdFormatId)?.label ?? selectedAdFormatId
                        : "the selected format"}
                      , or try another format.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {airtimeSlots.map((slot) => {
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
                            </div>
                            {disabled ? (
                              <p className="mt-2 text-xs font-semibold text-muted-foreground sm:text-sm">Not available</p>
                            ) : (
                              <div className="mt-2 space-y-0.5">
                                <p className="text-sm font-semibold tabular-nums text-chart-3 sm:text-base">
                                  GH₵
                                  {slotCampaignTotalGhs(
                                    slot.rateGhs ?? slot.weeklyGhs,
                                    pricingDayCount
                                  ).toLocaleString()}
                                </p>
                                <p className="text-[10px] leading-tight text-muted-foreground tabular-nums sm:text-[11px]">
                                  {Math.round(slot.rateGhs ?? slot.weeklyGhs ?? 0).toLocaleString()} ×{" "}
                                  {pricingDayCount} day{pricingDayCount === 1 ? "" : "s"}
                                </p>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Spot lengths */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground sm:text-base">
                    Select spot lengths
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Different spot lengths can run in the same campaign — e.g. 15s teaser + 30s full spot.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {SPOT_LENGTH_OPTIONS.map(({ sec, short, subtitle }) => {
                      const selected = selectedSpotLengthsSec.includes(sec);
                      const rateSum = rateSubtotalBySec[sec] ?? 0;
                      const campaignEst = Math.round(rateSum * pricingDayCount);
                      const showEstimate = selected && selectedAirtimeSlotIds.length > 0;
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
                                {Math.round(rateSum).toLocaleString()} × {pricingDayCount} day
                                {pricingDayCount === 1 ? "" : "s"}
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-full border-border bg-transparent px-5 text-base text-foreground hover:bg-muted/60"
                    onClick={() => setCurrentStep(2)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="h-12 rounded-full bg-[#0071e3] px-8 text-base font-medium text-white hover:bg-[#0077ed]"
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
              <div className="space-y-12">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Frequency</h3>
                  <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                    Set how often spots run and which days of the week apply. This pairs with the airtime slots you chose
                    in the previous step.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground sm:text-base">
                    Broadcast frequency
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
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
                            "rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-5 sm:py-2.5 sm:text-base",
                            selected
                              ? "bg-[#0071e3] text-white ring-2 ring-chart-2/40 ring-offset-2 ring-offset-background"
                              : "border border-border bg-muted/50 text-muted-foreground hover:border-chart-2/35 hover:bg-chart-2/5",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground sm:text-base">
                    Active broadcast days
                  </h4>
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
                            "h-11 w-11 shrink-0 rounded-full text-xs font-semibold transition-colors sm:h-12 sm:w-12 sm:text-sm",
                            on
                              ? "bg-chart-2 text-white shadow-sm ring-1 ring-chart-2/25 dark:ring-white/15"
                              : "border border-border bg-muted/40 text-muted-foreground hover:border-chart-2/35 hover:bg-chart-2/5 hover:text-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                    className="h-11 rounded-full border-border bg-transparent px-5 text-base text-foreground hover:bg-muted/60"
                    onClick={() => setCurrentStep(3)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="h-12 rounded-full bg-[#0071e3] px-8 text-base font-medium text-white hover:bg-[#0077ed]"
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
              <div className="space-y-10">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    Review &amp; confirm
                  </h3>
                  <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                    Review your campaign summary and pricing estimate, then add your campaign name and billing contact.
                    Final line items and payment are completed on the station rate card (same tax treatment as rate card
                    checkout).
                  </p>
                </div>

                {/* Campaign summary */}
                <div className="space-y-4 rounded-2xl border border-border border-l-4 border-l-chart-2/45 bg-muted/30 p-5 sm:p-7 dark:border-l-chart-2/55">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-chart-2 sm:text-base">
                    Campaign summary
                  </h4>
                  <dl className="space-y-3 text-sm sm:text-base">
                    {selectedRateCard && (
                      <>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 border-b border-border pb-3">
                          <dt className="text-muted-foreground shrink-0">Station</dt>
                          <dd className="text-foreground font-medium text-right">{selectedRateCard.title}</dd>
                        </div>
                        {selectedRateCard.location && (
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 border-b border-border pb-3">
                            <dt className="text-muted-foreground shrink-0">Market / reach</dt>
                            <dd className="text-muted-foreground text-right flex items-center sm:justify-end gap-1">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              {selectedRateCard.location}
                            </dd>
                          </div>
                        )}
                      </>
                    )}
                    {selectedAdFormatId && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 border-b border-border pb-3">
                        <dt className="text-muted-foreground shrink-0">Ad format</dt>
                        <dd className="text-foreground font-medium text-right">
                          {tvAdFormats.find((t) => t.id === selectedAdFormatId)?.label}
                        </dd>
                      </div>
                    )}
                    {campaignStart && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 border-b border-border pb-3">
                        <dt className="text-muted-foreground shrink-0">Campaign window</dt>
                        <dd className="text-foreground font-medium text-right">
                          {formatCampaignDate(campaignStart)}
                          {" — "}
                          {campaignEnd ? formatCampaignDate(campaignEnd) : formatCampaignDate(campaignStart)}
                          <span className="text-muted-foreground font-normal">
                            {" "}
                            ({campaignDayCount} day{campaignDayCount === 1 ? "" : "s"})
                          </span>
                        </dd>
                      </div>
                    )}
                    {selectedAirtimeSlotIds.length > 0 && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 border-b border-border pb-3">
                        <dt className="text-muted-foreground shrink-0">Airtime slots</dt>
                        <dd className="text-foreground text-right max-w-md">
                          {selectedAirtimeSlotIds
                            .map((id) => {
                              const s = airtimeSlots.find((x) => x.id === id);
                              if (!s) return null;
                              return s.range ? `${s.label} (${s.range})` : s.label;
                            })
                            .filter(Boolean)
                            .join(", ")}
                        </dd>
                      </div>
                    )}
                    {selectedSpotLengthsSec.length > 0 && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 border-b border-border pb-3">
                        <dt className="text-muted-foreground shrink-0">Spot lengths</dt>
                        <dd className="text-foreground text-right">
                          {selectedSpotLengthsSec
                            .map(
                              (sec) => SPOT_LENGTH_OPTIONS.find((o) => o.sec === sec)?.short ?? `${sec}s`
                            )
                            .join(", ")}
                        </dd>
                      </div>
                    )}
                    {broadcastFrequencyId && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 border-b border-border pb-3">
                        <dt className="text-muted-foreground shrink-0">Broadcast frequency</dt>
                        <dd className="text-foreground font-medium text-right">
                          {BROADCAST_FREQUENCY_OPTIONS.find((f) => f.id === broadcastFrequencyId)?.label}
                        </dd>
                      </div>
                    )}
                    {activeDaysLabel && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 pb-1">
                        <dt className="text-muted-foreground shrink-0">Active broadcast days</dt>
                        <dd className="text-foreground text-right">{activeDaysLabel}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Pricing estimate + tax */}
                <div className="space-y-4 rounded-2xl border border-border border-l-4 border-l-chart-1/45 bg-muted/30 p-5 sm:p-7 dark:border-l-chart-1/55">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Receipt className="h-4 w-4 shrink-0 text-chart-1" />
                    <h4 className="text-sm font-semibold uppercase tracking-wide sm:text-base">Pricing estimate</h4>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    Amounts use <strong className="font-medium text-foreground">the same figures the media agency entered</strong>{" "}
                    on the rate card, then × your campaign days. Per-duration columns (15s/30s/45s/60s) when present;
                    otherwise 30s baseline with proportional scaling. VAT (15%) and NHIL &amp; GETFund (5%) apply as on the
                    rate card. <span className="text-muted-foreground">Authoritative pricing is on the rate card.</span>
                  </p>

                  {selectedAirtimeSlotIds.length > 0 ? (
                    <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-3 text-sm sm:text-base">
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                        Airtime (× {pricingDayCount} day{pricingDayCount === 1 ? "" : "s"})
                      </p>
                      {selectedAirtimeSlotIds.map((id) => {
                        const slot = airtimeSlots.find((s) => s.id === id);
                        if (!slot) return null;
                        const unitRate = Math.round(slot.rateGhs ?? slot.weeklyGhs ?? 0);
                        const lineTotal = slotCampaignTotalGhs(slot.rateGhs ?? slot.weeklyGhs, pricingDayCount);
                        return (
                          <div
                            key={id}
                            className="flex justify-between gap-3 text-muted-foreground border-b border-border last:border-0 last:pb-0 pb-2"
                          >
                            <span className="min-w-0">
                              <span className="text-foreground">{slot.label}</span>
                              {slot.range ? (
                                <span className="text-muted-foreground">
                                  {" "}
                                  · {slot.range}
                                </span>
                              ) : null}
                              <span className="mt-0.5 block text-[10px] text-muted-foreground/90 tabular-nums sm:text-xs">
                                {unitRate.toLocaleString()} × {pricingDayCount} day{pricingDayCount === 1 ? "" : "s"}
                              </span>
                            </span>
                            <span className="shrink-0 font-medium tabular-nums text-foreground/90">
                              ₵{lineTotal.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between pt-2 text-xs text-muted-foreground sm:text-sm">
                        <span>Airtime subtotal (slots)</span>
                        <span className="tabular-nums">
                          ₵{Math.round(airtimeRateSubtotal * pricingDayCount).toLocaleString()}
                        </span>
                      </div>
                      {selectedSpotLengthsSec.length > 0 && (
                        <div className="space-y-1 border-t border-border pt-2 text-xs text-muted-foreground sm:text-sm">
                          <p className="font-medium uppercase tracking-wide text-[10px] sm:text-xs">
                            Spot length (× {pricingDayCount} day{pricingDayCount === 1 ? "" : "s"})
                          </p>
                          {selectedSpotLengthsSec.map((sec) => {
                            const rateSum = rateSubtotalBySec[sec] ?? 0;
                            const lineTotal = Math.round(rateSum * pricingDayCount);
                            const label = SPOT_LENGTH_OPTIONS.find((o) => o.sec === sec)?.short ?? `${sec}s`;
                            return (
                              <div key={sec} className="flex flex-col gap-0.5 border-b border-border/60 pb-1.5 last:border-0 last:pb-0">
                                <div className="flex justify-between tabular-nums">
                                  <span>{label}</span>
                                  <span className="font-medium text-foreground">₵{lineTotal.toLocaleString()}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground tabular-nums">
                                  {Math.round(rateSum).toLocaleString()} × {pricingDayCount} day
                                  {pricingDayCount === 1 ? "" : "s"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground sm:text-base">
                      No airtime slots selected in the scheduler—add slots in the previous step to see an estimate, or
                      build your campaign on the rate card.
                    </p>
                  )}

                  <div className="space-y-2 border-t border-border pt-3 text-sm sm:text-base">
                    {selectedAirtimeSlotIds.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Subtotal</span>
                          <span className="tabular-nums text-foreground">
                            ₵{Math.round(pricingSubtotal).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>VAT (15%)</span>
                          <span className="tabular-nums text-foreground">₵{Math.round(pricingVat).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>NHIL &amp; GETFund (5%)</span>
                          <span className="tabular-nums text-foreground">
                            ₵{Math.round(pricingNhilGetfund).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-border pt-3 text-lg font-bold">
                          <span className="text-foreground">Total (est.)</span>
                          <span className="text-2xl font-semibold tabular-nums tracking-tight text-chart-2 sm:text-3xl">
                            ₵{Math.round(pricingTotal).toLocaleString()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="py-2 text-sm text-muted-foreground sm:text-base">
                        Tax and total will reflect your line items once you add airtime slots—or when you build the
                        campaign on the rate card.
                      </p>
                    )}
                  </div>
                </div>

                {/* Campaign name + contact — last before actions */}
                <div className="space-y-5 rounded-2xl border border-border border-l-4 border-l-chart-3/45 bg-muted/40 p-5 sm:p-7 dark:border-l-chart-3/55">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4 shrink-0 text-chart-3" />
                    <h4 className="text-sm font-semibold uppercase tracking-wide sm:text-base">Campaign &amp; contact</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tv-media-campaign-name" className="text-sm text-muted-foreground">
                        Media campaign name <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="tv-media-campaign-name"
                        value={mediaCampaignName}
                        onChange={(e) => setMediaCampaignName(e.target.value)}
                        placeholder="e.g. Q1 Product Launch, Summer Promo"
                        className="h-11 border-border bg-background text-base text-foreground placeholder:text-muted-foreground"
                        autoComplete="off"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tv-media-contact-name" className="text-xs text-muted-foreground sm:text-sm">
                          Contact name
                        </Label>
                        <Input
                          id="tv-media-contact-name"
                          value={contactFullName}
                          onChange={(e) => setContactFullName(e.target.value)}
                          placeholder="Full name"
                          className="h-11 border-border bg-background text-base text-foreground placeholder:text-muted-foreground"
                          autoComplete="name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tv-media-contact-phone" className="text-xs text-muted-foreground sm:text-sm">
                          Phone
                        </Label>
                        <Input
                          id="tv-media-contact-phone"
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="+233 …"
                          className="h-11 border-border bg-background text-base text-foreground placeholder:text-muted-foreground"
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tv-media-contact-email" className="text-xs text-muted-foreground sm:text-sm">
                        Email
                      </Label>
                      <Input
                        id="tv-media-contact-email"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="billing@company.com"
                        className="h-11 border-border bg-background text-base text-foreground placeholder:text-muted-foreground"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-full border-border bg-transparent px-5 text-base text-foreground hover:bg-muted/60"
                    onClick={() => setCurrentStep(4)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  {rateCardHref ? (
                    canProceedToRateCard ? (
                      <Button asChild className="h-12 rounded-full bg-[#0071e3] px-8 text-base font-medium text-white hover:bg-[#0077ed]">
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
                  <p className="text-center text-xs text-muted-foreground sm:text-right sm:text-sm">
                    Enter a media campaign name to continue.
                  </p>
                )}
              </div>
            )}
            </div>
          </div>

          {/* Secondary: quick links to rate cards when step 1 not active or as reference */}
          {rateCards.length > 0 && currentStep === 1 && selectedStationId && selectedAdFormatId && (
            <p className="mt-6 text-center text-xs text-muted-foreground sm:text-sm">
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

      <footer className="border-t border-border py-10 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          © {new Date().getFullYear()} Payollar. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
