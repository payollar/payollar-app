"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  Calendar,
  CalendarRange,
  Car,
  Check,
  Clock,
  FileImage,
  Loader2,
  MapPin,
  Monitor,
  RefreshCw,
  Ruler,
  Sparkles,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductsChannelTopBar } from "@/components/products/products-channel-top-bar";
import {
  BILLBOARD_CUSTOM_RATE_ID,
  billboardQuoteHref,
  billboardRatesWithCustom,
  billboardStatusClass,
  billboardWeeklyBaseRate,
  findBillboardSite,
  resolveBillboardRate,
} from "@/lib/demo-billboard-marketplace";
import { cn } from "@/lib/utils";

function money(n) {
  return `GH₵${Number(n || 0).toLocaleString("en-GH", {
    maximumFractionDigits: 0,
  })}`;
}

function formatDisplayDate(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Build a short month strip covering the open window (±1 month padding). */
function buildAvailabilityMonths(fromIso, toIso) {
  if (!fromIso || !toIso) return [];
  const from = new Date(`${fromIso}T12:00:00`);
  const to = new Date(`${toIso}T12:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return [];

  const start = new Date(from.getFullYear(), from.getMonth() - 1, 1);
  const end = new Date(to.getFullYear(), to.getMonth() + 1, 1);
  const openStart = monthKey(from);
  const openEnd = monthKey(to);
  const months = [];
  const cursor = new Date(start);

  while (cursor <= end && months.length < 8) {
    const key = monthKey(cursor);
    const inWindow = key >= openStart && key <= openEnd;
    months.push({
      key,
      label: cursor.toLocaleDateString("en-GB", { month: "short" }),
      year: cursor.getFullYear(),
      open: inWindow,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

function availabilityDurationLabel(fromIso, toIso) {
  if (!fromIso || !toIso) return null;
  const from = new Date(`${fromIso}T12:00:00`);
  const to = new Date(`${toIso}T12:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
  const days = Math.max(
    1,
    Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
  if (days >= 28) {
    const months = Math.round(days / 30);
    return `~${months} month${months === 1 ? "" : "s"} open`;
  }
  return `${days} days open`;
}

function rateHint(rate, rates) {
  if (rate?.isCustom || rate?.id === BILLBOARD_CUSTOM_RATE_ID) {
    return "Set your own duration";
  }
  const weeks = Number(rate?.weeks) || 1;
  const popular =
    rates.find((r) => !r.isCustom && r.weeks === 4)?.id ||
    rates.find((r) => !r.isCustom)?.id;
  if (rate.id === popular) return "Most booked";
  if (weeks === 1) return "Short flight";
  if (weeks >= 12) return "Best value / week";
  return `${weeks * 7}-day flight`;
}

function weeklyEffective(rate) {
  if (rate?.weeklyRate != null) return Number(rate.weeklyRate) || 0;
  const weeks = Number(rate?.weeks) || 1;
  const price = Number(rate?.price) || 0;
  return Math.round(price / weeks);
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "rates", label: "Rate Card" },
  { id: "availability", label: "Availability" },
  { id: "specs", label: "Media Specs" },
];

const SPEC_ICONS = {
  Size: Ruler,
  Type: Monitor,
  Orientation: ArrowLeftRight,
  Traffic: Car,
  Rotations: RefreshCw,
  Lighting: Sun,
  Material: Sparkles,
  Footfall: Car,
};

function AvailabilityPanel({
  site,
  status,
  statusLabel,
  availFrom,
  availTo,
  activeRate,
  quoteHref,
  onChangePackage,
}) {
  const months = buildAvailabilityMonths(
    site.availability?.from,
    site.availability?.to
  );
  const windowLength = availabilityDurationLabel(
    site.availability?.from,
    site.availability?.to
  );
  const isLimited = status === "LIMITED";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            When can you book?
          </p>
          <p className="mt-0.5 text-sm text-slate-500">
            Open inventory window for {site.name}.
          </p>
        </div>
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
            billboardStatusClass(status)
          )}
        >
          {statusLabel}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid gap-0 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="border-b border-slate-100 px-4 py-4 sm:border-b-0 sm:border-r sm:px-5 sm:py-5">
            <div className="flex items-center gap-2 text-emerald-700">
              <CalendarRange className="h-4 w-4" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                Open window
              </p>
            </div>
            <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
              {site.availability?.label || "Contact owner for dates"}
            </p>
            {availFrom && availTo ? (
              <p className="mt-1.5 text-sm tabular-nums text-slate-600">
                {availFrom}
                <span className="mx-1.5 text-slate-300">→</span>
                {availTo}
              </p>
            ) : null}
            {windowLength ? (
              <p className="mt-3 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
                {windowLength}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-1">
            <div className="border-b border-r border-slate-100 px-4 py-3.5 sm:border-r-0 sm:px-5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <Clock className="h-3 w-3" />
                Booking state
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {isLimited ? "Limited slots left" : "Accepting bookings"}
              </p>
            </div>
            <div className="border-b border-slate-100 px-4 py-3.5 sm:px-5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <FileImage className="h-3 w-3" />
                Artwork due
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                5–7 days before install
              </p>
            </div>
          </div>
        </div>

        {months.length > 0 ? (
          <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-5">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-600">
                Month overview
              </p>
              <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-emerald-500" />
                  Open
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-slate-200" />
                  Outside
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8">
              {months.map((m) => (
                <div
                  key={m.key}
                  className={cn(
                    "rounded-lg px-1.5 py-2 text-center",
                    m.open
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-white text-slate-400 ring-1 ring-slate-200/80"
                  )}
                  title={m.open ? "Open for booking" : "Outside window"}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide">
                    {m.label}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-[10px] tabular-nums",
                      m.open ? "text-white/80" : "text-slate-300"
                    )}
                  >
                    {String(m.year).slice(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {[
          {
            title: "Hold dates",
            body: "Request a quote to reserve the window with the media owner.",
          },
          {
            title: "Lock on accept",
            body: "Dates confirm when your offer is accepted — then upload creative.",
          },
          {
            title: "Live calendar",
            body: "Demo availability for now. Owner calendars sync when published.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-slate-200/90 bg-slate-50/40 px-3.5 py-3"
          >
            <p className="text-sm font-semibold text-slate-950">{item.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {item.body}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-950 px-4 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/55">
            Ready to quote
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold">
            {activeRate
              ? `${activeRate.label} · ${money(activeRate.price)}`
              : "Select a package"}
          </p>
          {availFrom && availTo ? (
            <p className="mt-0.5 text-xs text-white/60">
              Prefer {availFrom} – {availTo}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full border-white/20 bg-transparent text-sm font-semibold text-white hover:bg-white/10 hover:text-white"
            onClick={onChangePackage}
          >
            Change package
          </Button>
          <Button
            asChild
            className="h-10 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 hover:bg-slate-100"
          >
            <Link href={quoteHref}>
              Get Quote
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function BillboardSiteDetail() {
  const params = useParams();
  const siteId = String(params?.siteId || "");
  const site = useMemo(() => findBillboardSite(siteId), [siteId]);
  const [tab, setTab] = useState("overview");
  const [selectedRateId, setSelectedRateId] = useState(null);
  const [customWeeks, setCustomWeeks] = useState(6);

  if (!site) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg font-semibold text-slate-950">Site not found</p>
        <p className="mt-2 text-sm text-slate-500">
          Pick a billboard from the marketplace to view rates and availability.
        </p>
        <Button
          asChild
          className="mt-6 rounded-full bg-slate-950 hover:bg-slate-800"
        >
          <Link href="/products?type=BILLBOARD">Back to marketplace</Link>
        </Button>
      </div>
    );
  }

  const rates = billboardRatesWithCustom(site, customWeeks);
  const presetRates = site.rates || [];
  const activeRate =
    resolveBillboardRate(site, selectedRateId, customWeeks) || rates[0];
  const isCustomSelected =
    selectedRateId === BILLBOARD_CUSTOM_RATE_ID || activeRate?.isCustom;
  const status = site.status || "AVAILABLE";
  const statusLabel =
    site.statusLabel || (status === "LIMITED" ? "Limited" : "Available");
  const ownerName = site.owner?.name || site.agency?.agencyName;
  const verified =
    (site.owner?.verificationStatus || site.agency?.verificationStatus) ===
    "VERIFIED";

  const trafficShort =
    site.reach ||
    String(site.traffic || "")
      .replace(/^Est\.?\s*daily traffic\s*/i, "")
      .replace(/vehicles.*/i, "vehicles/day")
      .trim() ||
    "—";

  const highlightSpecs = [
    { label: "Size", value: site.size, icon: Ruler },
    { label: "Type", value: site.boardType, icon: Monitor },
    { label: "Orientation", value: site.orientation, icon: ArrowLeftRight },
    { label: "Daily traffic", value: trafficShort, icon: Car },
  ];

  const popularRates = presetRates.slice(0, 3);
  const quoteHref = billboardQuoteHref(site, {
    rateId: activeRate?.id,
    weeks: isCustomSelected ? customWeeks : undefined,
  });
  const weeklyBase = billboardWeeklyBaseRate(site);
  const availFrom = formatDisplayDate(site.availability?.from);
  const availTo = formatDisplayDate(site.availability?.to);

  const specs = (site.specs || []).map((spec) => ({
    ...spec,
    icon: SPEC_ICONS[spec.label] || Sparkles,
  }));

  return (
    <div className="pb-28 lg:pb-12">
      <ProductsChannelTopBar
        title="Site details"
        backHref="/products?type=BILLBOARD"
        backLabel="Billboard marketplace"
        variant="light"
        showChannelLabel={false}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Step 2 · View site & rate card
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              {site.name}
            </h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                {site.location}
              </span>
              {ownerName ? (
                <span className="inline-flex items-center gap-1">
                  <span className="text-slate-300">·</span>
                  {ownerName}
                  {verified ? (
                    <BadgeCheck className="h-3.5 w-3.5 text-sky-500" />
                  ) : null}
                </span>
              ) : null}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
              billboardStatusClass(status)
            )}
          >
            {statusLabel}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
            <div className="relative aspect-[16/10] bg-slate-100 sm:aspect-[2/1]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={site.imageUrl || "/billboard.jpg"}
                alt={site.name}
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-4 pb-3.5 pt-12">
                <span className="inline-flex rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {[site.size, site.boardType].filter(Boolean).join(" · ")}
                </span>
              </div>
            </div>

            <div
              className="flex gap-0 overflow-x-auto border-b border-slate-100 px-2 sm:px-4"
              role="tablist"
            >
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "relative shrink-0 px-3.5 py-3.5 text-sm font-semibold transition",
                    tab === item.id
                      ? "text-slate-950"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {item.label}
                  {tab === item.id ? (
                    <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-slate-950" />
                  ) : null}
                </button>
              ))}
            </div>

            <div className="px-4 py-5 sm:px-5 sm:py-6">
              {tab === "overview" ? (
                <div className="space-y-6">
                  <p className="max-w-2xl text-[15px] leading-relaxed text-slate-600">
                    {site.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    {highlightSpecs.map((row) => {
                      const Icon = row.icon;
                      return (
                        <div
                          key={row.label}
                          className="flex min-h-[4.5rem] gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-3"
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200/80">
                            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              {row.label}
                            </p>
                            <p className="mt-0.5 text-sm font-semibold leading-snug text-slate-950">
                              {row.value || "—"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {site.availability?.label ? (
                    <button
                      type="button"
                      onClick={() => setTab("availability")}
                      className="flex w-full items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/90 px-3.5 py-3 text-left transition hover:bg-emerald-50"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 ring-1 ring-emerald-100">
                        <Calendar className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-emerald-700/70">
                          Availability
                        </span>
                        <span className="block text-sm font-semibold text-emerald-950">
                          {site.availability.label}
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-emerald-700">
                        View
                      </span>
                    </button>
                  ) : null}

                  {popularRates.length > 0 ? (
                    <div>
                      <div className="mb-2.5 flex items-baseline justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-950">
                          Popular packages
                        </p>
                        <button
                          type="button"
                          onClick={() => setTab("rates")}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                        >
                          Full rate card
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {popularRates.map((rate) => {
                          const selected = activeRate?.id === rate.id;
                          const hint = rateHint(rate, rates);
                          return (
                            <button
                              key={rate.id}
                              type="button"
                              onClick={() => setSelectedRateId(rate.id)}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition",
                                selected
                                  ? "border-slate-950 bg-slate-950 text-white"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              )}
                            >
                              <span className="min-w-0 flex-1">
                                <span
                                  className={cn(
                                    "block text-sm font-semibold",
                                    selected ? "text-white" : "text-slate-950"
                                  )}
                                >
                                  {rate.label}
                                </span>
                                <span
                                  className={cn(
                                    "mt-0.5 block text-xs",
                                    selected
                                      ? "text-white/65"
                                      : "text-slate-500"
                                  )}
                                >
                                  {hint}
                                  {" · "}
                                  {money(weeklyEffective(rate))}/week
                                </span>
                              </span>
                              <span
                                className={cn(
                                  "shrink-0 text-sm font-semibold tabular-nums",
                                  selected ? "text-white" : "text-slate-950"
                                )}
                              >
                                {money(rate.price)}
                              </span>
                              {selected ? (
                                <Check className="h-4 w-4 shrink-0 text-white" />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {tab === "rates" ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Choose a duration
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Prices in GHC. Effective weekly rate shown for comparison.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {rates.map((rate) => {
                      const selected = activeRate?.id === rate.id;
                      const hint = rateHint(rate, rates);
                      return (
                        <button
                          key={rate.id}
                          type="button"
                          onClick={() => setSelectedRateId(rate.id)}
                          className={cn(
                            "flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition",
                            selected
                              ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                              selected
                                ? "border-white bg-white"
                                : "border-slate-300"
                            )}
                          >
                            {selected ? (
                              <span className="h-2.5 w-2.5 rounded-full bg-slate-950" />
                            ) : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "flex flex-wrap items-center gap-2 text-sm font-semibold",
                                selected ? "text-white" : "text-slate-950"
                              )}
                            >
                              {rate.label}
                              {hint === "Most booked" ? (
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                    selected
                                      ? "bg-white/15 text-white"
                                      : "bg-slate-100 text-slate-600"
                                  )}
                                >
                                  Popular
                                </span>
                              ) : null}
                            </span>
                            <span
                              className={cn(
                                "mt-0.5 block text-xs",
                                selected ? "text-white/65" : "text-slate-500"
                              )}
                            >
                              {hint} · {money(weeklyEffective(rate))} / week
                            </span>
                          </span>
                          <span
                            className={cn(
                              "shrink-0 text-base font-semibold tabular-nums",
                              selected ? "text-white" : "text-slate-950"
                            )}
                          >
                            {money(rate.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {site.availability?.label ? (
                    <button
                      type="button"
                      onClick={() => setTab("availability")}
                      className="flex w-full items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-left text-sm font-medium text-emerald-800 transition hover:bg-emerald-100/60"
                    >
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{site.availability.label}</span>
                      <span className="text-xs font-semibold">Dates</span>
                    </button>
                  ) : null}
                </div>
              ) : null}

              {tab === "availability" ? (
                <AvailabilityPanel
                  site={site}
                  status={status}
                  statusLabel={statusLabel}
                  availFrom={availFrom}
                  availTo={availTo}
                  activeRate={activeRate}
                  quoteHref={quoteHref}
                  onChangePackage={() => setTab("rates")}
                />
              ) : null}

              {tab === "specs" ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Technical details
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Specs for creative production and buy planning.
                    </p>
                  </div>
                  <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                    {specs.map((spec) => {
                      const Icon = spec.icon;
                      return (
                        <div
                          key={spec.label}
                          className="flex items-center gap-3 bg-white px-4 py-3.5"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200/80">
                            <Icon className="h-4 w-4" strokeWidth={1.75} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              {spec.label}
                            </p>
                            <p className="mt-0.5 text-[15px] font-semibold text-slate-950">
                              {spec.value}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab("rates")}
                    className="text-sm font-semibold text-slate-600 underline-offset-2 hover:text-slate-950 hover:underline"
                  >
                    See rate card →
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="hidden lg:sticky lg:top-24 lg:block">
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Selected package
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                  {activeRate?.label || "Choose a rate"}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
                  {activeRate ? money(activeRate.price) : "—"}
                </p>
                {activeRate ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {money(weeklyEffective(activeRate))} / week effective
                  </p>
                ) : null}
                {site.availability?.label ? (
                  <p className="mt-3 flex items-start gap-1.5 text-xs leading-snug text-slate-500">
                    <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {site.availability.label}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2.5 px-5 py-4">
                <Button
                  asChild
                  className="h-11 w-full rounded-full bg-slate-950 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Link href={quoteHref}>
                    Get Quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full rounded-full border-slate-200 text-sm font-semibold"
                  onClick={() => setTab("rates")}
                >
                  Change package
                </Button>
                <p className="pt-1 text-center text-[11px] leading-relaxed text-slate-400">
                  Next: build quote, negotiate, then book & go live.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {activeRate?.label || "Package"}
            </p>
            <p className="truncate text-base font-semibold tabular-nums text-slate-950">
              {activeRate ? money(activeRate.price) : "Select a rate"}
            </p>
          </div>
          <Button
            asChild
            className="h-11 shrink-0 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Link href={quoteHref}>
              Get Quote
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BillboardSitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading site…
        </div>
      }
    >
      <BillboardSiteDetail />
    </Suspense>
  );
}
