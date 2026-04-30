"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Radio,
  Receipt,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ProductsChannelTopBar } from "@/components/products/products-channel-top-bar";
import { getHeaderImage } from "@/lib/getHeaderImage";
import { getPublishedRateCards } from "@/actions/media-agency";
import { getRateCardSchedulerSlots } from "@/actions/tv-media-airtime";
import { RADIO_AD_TYPES } from "@/lib/ad-types";

const STEPS = [
  { id: 1, label: "Station & Format" },
  { id: 2, label: "Dates" },
  { id: 3, label: "Airtimes & Spots" },
  { id: 4, label: "Frequency" },
  { id: 5, label: "Confirm" },
];

/** Same teal / warm radial wash as TV hero — reused on Scheduler card */
const TV_MEDIA_ACCENT_RADIAL_CLASS =
  "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,oklch(0.6_0.12_184.704/0.12),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_100%,oklch(0.65_0.2_41.116/0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,oklch(0.55_0.18_264.376/0.18),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_100%,oklch(0.65_0.17_162.48/0.12),transparent_50%)]";

/** Soft vertical blend — scheduler uses lighter stops so card stays readable */
const TV_MEDIA_SCHEDULER_VERTICAL_FADE_CLASS =
  "pointer-events-none absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-chart-2/[0.04] dark:from-background/15 dark:via-chart-2/[0.06] dark:to-chart-1/[0.05]";

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

export default function RadioMediaPage() {
  const headerImage = getHeaderImage("/products/radio-media");

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

  const [broadcastFrequencyId, setBroadcastFrequencyId] = useState("once");
  const [activeBroadcastDays, setActiveBroadcastDays] = useState(() => [
    false,
    true,
    true,
    true,
    true,
    true,
    false,
  ]);

  useEffect(() => {
    getPublishedRateCards("RADIO").then((result) => {
      if (result.success && result.rateCards?.length) setRateCards(result.rateCards);
    });
  }, []);

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

  const activeDaysLabel = useMemo(() => {
    return WEEKDAY_SHORT.filter((_, i) => activeBroadcastDays[i]).join(", ");
  }, [activeBroadcastDays]);

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
  }, [selectedAirtimeSlotIds, airtimeSlots]);

  const selectedDailyRateSubtotal = useMemo(() => {
    if (!selectedSingleSpotSec) return 0;
    return rateSubtotalBySec[selectedSingleSpotSec] ?? 0;
  }, [selectedSingleSpotSec, rateSubtotalBySec]);

  const pricingSubtotal = useMemo(() => {
    if (!selectedSingleSpotSec) return 0;
    return selectedDailyRateSubtotal * Math.max(1, pricingDayCount);
  }, [selectedDailyRateSubtotal, pricingDayCount, selectedSingleSpotSec]);

  const pricingVat = pricingSubtotal * VAT_RATE;
  const pricingNhilGetfund = pricingSubtotal * NHIL_GETFUND_RATE;
  const pricingTotal = pricingSubtotal + pricingVat + pricingNhilGetfund;

  const canProceedStep1 = Boolean(selectedRateCardId && selectedAdFormatId);
  const canProceedStep2 = Boolean(canProceedStep1 && campaignStart);
  const canProceedStep3 = Boolean(canProceedStep2 && selectedAirtimeSlotIds.length > 0 && selectedSingleSpotSec);
  const canProceedStep4 = Boolean(canProceedStep3 && broadcastFrequencyId && activeBroadcastDays.some(Boolean));

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-chart-2/25">
      <ProductsChannelTopBar title="Radio Media" icon={Radio} />

      {/* Hero — inset rounded panel (match TV style) */}
      <section className="relative mx-3 mt-2 min-h-[min(52vh,360px)] w-auto max-w-none overflow-hidden rounded-2xl border border-border sm:mx-6 sm:mt-3 sm:min-h-[300px] sm:rounded-3xl lg:mx-8 lg:min-h-[340px]">
        <img
          src={headerImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
        <div className={TV_MEDIA_ACCENT_RADIAL_CLASS} aria-hidden />
        <div className="relative mx-auto flex min-h-[min(52vh,360px)] max-w-6xl flex-col justify-center px-5 py-10 sm:min-h-[300px] sm:px-10 sm:py-12 lg:min-h-[340px]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-chart-2 sm:text-sm">
            Campaign planner
          </p>
          <div className="mt-3 flex flex-col gap-6 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8 lg:gap-12">
            <h1 className="min-w-0 max-w-xl flex-1 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl sm:leading-[1.12] lg:text-[2.5rem] lg:leading-[1.1]">
              Radio advertising
            </h1>
            <div className="relative shrink-0 sm:flex sm:max-w-[min(40%,320px)] sm:flex-1 sm:justify-end lg:max-w-[min(38%,360px)]">
              <img
                src="/icons/microphone.png"
                alt=""
                className="mx-auto h-[min(28vw,120px)] w-auto max-h-[140px] object-contain object-bottom drop-shadow-md dark:drop-shadow-[0_12px_40px_rgba(0,0,0,0.45)] sm:mx-0 sm:h-[min(22vw,150px)] sm:max-h-[170px] lg:h-[min(20vw,180px)] lg:max-h-[200px]"
              />
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:mt-6 sm:max-w-[min(100%,36rem)] sm:text-lg">
            Plan campaigns across Ghana radio networks—multi-slot booking, clear estimates, one flow.
          </p>
        </div>
      </section>

      {/* Campaign Scheduler (match TV container + stepper) */}
      <section className="px-4 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-16 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card/90 shadow-sm shadow-chart-2/5 ring-1 ring-chart-1/5 backdrop-blur-sm dark:shadow-chart-2/10 dark:ring-chart-2/10">
            <div className={TV_MEDIA_SCHEDULER_VERTICAL_FADE_CLASS} aria-hidden />
            <div className={TV_MEDIA_ACCENT_RADIAL_CLASS} aria-hidden />
            <div className="relative z-[1] p-8 sm:p-10 md:p-12">
              {/* Header */}
              <div className="mb-11 sm:mb-14">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Media Scheduler</h2>
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

              {/* Step 1 */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <Card className="rounded-2xl border-border/70">
              <CardHeader>
                <CardTitle className="text-xl">Station &amp; format</CardTitle>
                <CardDescription>Select a radio station rate card and the ad format.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    Select station
                  </div>
                  {rateCards.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                      No published radio rate cards yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {rateCards.map((rc) => {
                        const selected = selectedRateCardId === rc.id;
                        return (
                          <button
                            key={rc.id}
                            type="button"
                            onClick={() => setSelectedRateCardId(rc.id)}
                            className={cn(
                              "rounded-2xl border p-4 text-left transition-all",
                              selected
                                ? "border-primary/35 bg-primary/8 ring-1 ring-primary/15"
                                : "border-border/60 bg-card/70 hover:border-primary/25 hover:bg-muted/40"
                            )}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="text-sm font-semibold text-foreground">{rc.title}</div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {rc.agency?.agencyName ? rc.agency.agencyName : "Media agency"}
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

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="marketing"
                    className="rounded-full px-8"
                    disabled={!canProceedStep1}
                    onClick={() => setCurrentStep(2)}
                  >
                    Next: Dates
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2 */}
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
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground sm:text-xs">
                    Total days (inclusive)
                  </p>
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
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                variant="marketing"
                className="rounded-full px-8"
                disabled={!canProceedStep2}
                onClick={() => setCurrentStep(3)}
              >
                Next: Airtimes &amp; spots
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
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
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                variant="marketing"
                className="rounded-full px-8"
                disabled={!canProceedStep3}
                onClick={() => setCurrentStep(4)}
              >
                Next: Frequency
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <Card className="rounded-2xl border-border/70">
              <CardHeader>
                <CardTitle className="text-xl">Frequency</CardTitle>
                <CardDescription>Set how often spots run and which days apply.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {BROADCAST_FREQUENCY_OPTIONS.map((opt) => {
                    const selected = broadcastFrequencyId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setBroadcastFrequencyId(opt.id)}
                        className={cn(
                          "rounded-2xl border p-4 text-left transition-all",
                          selected
                            ? "border-primary/35 bg-primary/8 ring-1 ring-primary/15"
                            : "border-border/60 bg-card/70 hover:border-primary/25 hover:bg-muted/40"
                        )}
                      >
                        <div className="text-sm font-semibold text-foreground">{opt.label}</div>
                        <div className="mt-1 text-xs text-muted-foreground">Frequency per day</div>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    Active days
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAY_SHORT.map((d, idx) => {
                      const on = activeBroadcastDays[idx];
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleBroadcastDay(idx)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                            on ? "border-primary/35 bg-primary/10 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"
                          )}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-sm text-muted-foreground">Selected: {activeDaysLabel || "None"}</p>
                </div>

                <div className="flex justify-between pt-2">
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => setCurrentStep(3)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="marketing"
                    className="rounded-full px-8"
                    disabled={!canProceedStep4}
                    onClick={() => setCurrentStep(5)}
                  >
                    Next: Confirm
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5 */}
        {currentStep === 5 && (
          <div className="space-y-8">
            <Card className="rounded-2xl border-border/70">
              <CardHeader>
                <CardTitle className="text-xl">Confirm</CardTitle>
                <CardDescription>Review your selection and open the rate card for checkout details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-muted/25 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      Station
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{selectedRateCard?.title || "—"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{selectedRateCard?.agency?.agencyName || ""}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/25 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <User className="h-4 w-4 text-primary" />
                      Ad format
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {RADIO_AD_TYPES.find((t) => t.id === selectedAdFormatId)?.fullName || "—"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Spot length: {selectedSingleSpotSec ? `${selectedSingleSpotSec}s` : "—"}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Receipt className="h-4 w-4 text-primary" />
                      Estimate
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold tabular-nums text-foreground">GH₵{Math.round(pricingTotal).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">VAT + NHIL/GETFund included</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="tabular-nums">GH₵{Math.round(pricingSubtotal).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>VAT (15%)</span>
                      <span className="tabular-nums">GH₵{Math.round(pricingVat).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>NHIL + GETFund (5%)</span>
                      <span className="tabular-nums">GH₵{Math.round(pricingNhilGetfund).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => setCurrentStep(4)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  {selectedRateCardId && selectedAdFormatId ? (
                    <Button asChild variant="marketing" className="rounded-full px-8">
                      <Link href={`/rate-cards/${selectedRateCardId}?adType=${selectedAdFormatId}`}>
                        Open rate card
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
