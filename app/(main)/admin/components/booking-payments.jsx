"use client";

import { useMemo, useState } from "react";
import { formatDistanceToNowStrict, format } from "date-fns";
import {
  ArrowRight,
  Megaphone,
  Radio,
  Receipt,
  Search,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PANEL =
  "rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]";

const SOURCES = {
  TALENT: {
    label: "Talent",
    icon: Users,
    chip: "bg-sky-50 text-sky-700 ring-sky-100",
    iconWrap: "bg-sky-50 text-sky-700 ring-sky-100",
    bar: "bg-sky-500",
  },
  MEDIA: {
    label: "Media",
    icon: Radio,
    chip: "bg-amber-50 text-amber-800 ring-amber-100",
    iconWrap: "bg-amber-50 text-amber-700 ring-amber-100",
    bar: "bg-amber-400",
  },
  CAMPAIGN: {
    label: "Campaign",
    icon: Megaphone,
    chip: "bg-emerald-50 text-emerald-800 ring-emerald-100",
    iconWrap: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    bar: "bg-emerald-500",
  },
};

const STATUS_STYLE = {
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  CONFIRMED: "bg-sky-50 text-sky-700 ring-sky-100",
  ACCEPTED: "bg-violet-50 text-violet-700 ring-violet-100",
  PENDING: "bg-amber-50 text-amber-800 ring-amber-100",
};

function money(value, { compact = false } = {}) {
  const n = Number(value || 0);
  return `GH₵ ${n.toLocaleString("en-GH", {
    minimumFractionDigits: compact || n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function statusLabel(status) {
  if (!status) return "—";
  return String(status).replaceAll("_", " ");
}

function whenLabel(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const relative = formatDistanceToNowStrict(date, { addSuffix: true });
  const absolute = format(date, "MMM d, yyyy · h:mm a");
  return { relative, absolute };
}

export function BookingPayments({ transactions }) {
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");

  const volumeGhs = Number(transactions?.volumeGhs || 0);
  const talentsGhs = Number(transactions?.talentsGhs || 0);
  const mediaGhs = Number(transactions?.mediaGhs || 0);
  const campaignsGhs = Number(transactions?.campaignsGhs || 0);
  const recent = transactions?.recent || [];

  const share = useMemo(() => {
    const total = Math.max(volumeGhs, 0.0001);
    return {
      talent: (talentsGhs / total) * 100,
      media: (mediaGhs / total) * 100,
      campaign: (campaignsGhs / total) * 100,
    };
  }, [volumeGhs, talentsGhs, mediaGhs, campaignsGhs]);

  const sourceCards = [
    {
      id: "TALENT",
      label: "Talent invoices",
      amount: talentsGhs,
      meta: `${transactions?.talentInvoicesPaid || 0} paid`,
      icon: Users,
    },
    {
      id: "MEDIA",
      label: "Media bookings",
      amount: mediaGhs,
      meta: `${transactions?.mediaBookingsCommitted || 0} confirmed`,
      icon: Radio,
    },
    {
      id: "CAMPAIGN",
      label: "Campaign hires",
      amount: campaignsGhs,
      meta: `${transactions?.campaignHires || 0} accepted`,
      icon: Megaphone,
    },
  ];

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return recent.filter((row) => {
      if (filter !== "ALL" && row.source !== filter) return false;
      if (!needle) return true;
      const hay = [
        row.title,
        row.party,
        row.counterparty,
        row.status,
        row.source,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [filter, query, recent]);

  const filteredVolume = useMemo(
    () => rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
    [rows]
  );

  return (
    <div className="-m-3 min-h-full min-w-0 space-y-4 bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:space-y-5 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Operations
          </p>
          <h1 className="mt-1 text-lg font-semibold text-slate-950 md:text-xl">
            Booking payments
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Live volume from talent invoices, media bookings, and campaign
            hires. Marketplace sales stay out until launch.
          </p>
        </div>
        <div className={cn(PANEL, "min-w-[220px] px-4 py-3")}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white">
              <Wallet className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Total volume
              </p>
              <p className="text-xl font-semibold tabular-nums tracking-tight text-slate-950">
                {money(volumeGhs)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className={cn(PANEL, "p-4 md:p-5")}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">Volume mix</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Share of booking value by channel
            </p>
          </div>
          <p className="text-xs tabular-nums text-slate-400">
            {transactions?.count || 0} payments tracked
          </p>
        </div>

        <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="bg-sky-500 transition-all"
            style={{ width: `${share.talent}%` }}
            title={`Talent ${share.talent.toFixed(1)}%`}
          />
          <div
            className="bg-amber-400 transition-all"
            style={{ width: `${share.media}%` }}
            title={`Media ${share.media.toFixed(1)}%`}
          />
          <div
            className="bg-emerald-500 transition-all"
            style={{ width: `${share.campaign}%` }}
            title={`Campaign ${share.campaign.toFixed(1)}%`}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Talent {share.talent.toFixed(0)}%
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Media {share.media.toFixed(0)}%
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Campaign {share.campaign.toFixed(0)}%
          </span>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        {sourceCards.map((card) => {
          const Icon = card.icon;
          const active = filter === card.id;
          const meta = SOURCES[card.id];
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setFilter(active ? "ALL" : card.id)}
              className={cn(
                PANEL,
                "p-4 text-left transition",
                active
                  ? "border-slate-950 ring-1 ring-slate-950"
                  : "hover:border-slate-300 hover:bg-white"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-950">
                    {money(card.amount)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{card.meta}</p>
                </div>
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full ring-1",
                    meta.iconWrap
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-[11px] font-semibold text-slate-400">
                {active ? "Showing this channel · click to clear" : "Filter activity"}
              </p>
            </button>
          );
        })}
      </div>

      <section className={cn(PANEL, "overflow-hidden")}>
        <div className="space-y-4 border-b border-slate-100 px-4 py-4 md:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Payment activity
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {rows.length} of {recent.length} payments
                {filter !== "ALL" || query
                  ? ` · ${money(filteredVolume)} in view`
                  : ""}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title, people, status…"
                  className="h-10 rounded-full border-slate-200 bg-slate-50/80 pl-9 pr-9 text-sm"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "ALL", label: "All" },
                  { id: "TALENT", label: "Talent" },
                  { id: "MEDIA", label: "Media" },
                  { id: "CAMPAIGN", label: "Campaign" },
                ].map((item) => {
                  const active = filter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFilter(item.id)}
                      className={cn(
                        "rounded-full px-3 py-2 text-xs font-semibold transition",
                        active
                          ? "bg-slate-950 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 md:p-4">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-16 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white">
                <Receipt className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-slate-950">
                {recent.length === 0
                  ? "No booking payments yet"
                  : "No matches in this view"}
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {recent.length === 0
                  ? "Paid talent invoices, confirmed media bookings, and accepted campaign rates will show up here."
                  : "Try another channel filter or clear the search."}
              </p>
              {filter !== "ALL" || query ? (
                <button
                  type="button"
                  onClick={() => {
                    setFilter("ALL");
                    setQuery("");
                  }}
                  className="mt-4 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Reset filters
                </button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => {
                const source = SOURCES[row.source] || SOURCES.TALENT;
                const Icon = source.icon;
                const when = whenLabel(row.createdAt);
                const statusClass =
                  STATUS_STYLE[row.status] ||
                  "bg-slate-100 text-slate-600 ring-slate-200";

                return (
                  <article
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50/70"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className={cn(
                            "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-1",
                            source.iconWrap
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
                                source.chip
                              )}
                            >
                              {source.label}
                            </span>
                            <h3 className="truncate text-sm font-semibold text-slate-950">
                              {row.title}
                            </h3>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                            <span className="font-medium text-slate-700">
                              {row.party || "—"}
                            </span>
                            {row.counterparty ? (
                              <>
                                <ArrowRight className="h-3 w-3 text-slate-300" />
                                <span className="font-medium text-slate-700">
                                  {row.counterparty}
                                </span>
                              </>
                            ) : null}
                          </div>

                          <p
                            className="mt-1.5 text-xs text-slate-400"
                            title={typeof when === "object" ? when.absolute : undefined}
                          >
                            {typeof when === "object"
                              ? `${when.relative} · ${when.absolute}`
                              : when}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end lg:min-w-[140px] lg:flex-col lg:items-end">
                        <p className="text-base font-semibold tabular-nums tracking-tight text-slate-950">
                          {money(row.amount)}
                        </p>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1",
                            statusClass
                          )}
                        >
                          {statusLabel(row.status)}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
