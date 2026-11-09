"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowUpRight,
  Package,
  Search,
  Truck,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  logisticsDispositionMeta,
  logisticsEndpoints,
  logisticsProgress,
  logisticsShortId,
  logisticsStatusMeta,
  logisticsTimeline,
} from "@/lib/logistics-ui";
import { cn } from "@/lib/utils";
import { LogisticsAuditTrail } from "./logistics-detail-shared";

export function LogisticsRouteRail({
  shipment,
  perspective = "client",
  compact = false,
}) {
  const { pct, stage } = logisticsProgress(shipment);
  const { from, to } = logisticsEndpoints(shipment, perspective);
  const tone =
    stage === "done"
      ? "bg-emerald-500"
      : stage === "issue"
        ? "bg-rose-500"
        : stage === "transit"
          ? "bg-sky-500"
          : "bg-slate-950";

  return (
    <div className={cn("w-full", compact ? "py-1" : "py-2")}>
      <div className="relative h-8">
        <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className={cn("absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full", tone)}
          style={{ width: `${pct}%` }}
        />
        <span className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-slate-950 ring-2 ring-white" />
        <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-slate-300 ring-2 ring-white" />
        <span
          className={cn(
            "absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-md",
            tone
          )}
          style={{ left: `${pct}%` }}
        >
          <Truck className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-1 flex items-start justify-between gap-3 text-[11px] font-medium text-slate-500">
        <span className="max-w-[45%] truncate text-slate-700">{from}</span>
        <span className="max-w-[45%] truncate text-right text-slate-700">{to}</span>
      </div>
    </div>
  );
}

export function LogisticsShipmentCard({
  shipment,
  perspective = "client",
  selected = false,
  onSelect,
  href,
}) {
  const meta = logisticsStatusMeta(shipment.status);
  const StatusIcon = meta.icon;
  const label =
    perspective === "creator" ? meta.creatorLabel : meta.clientLabel;
  const person =
    perspective === "creator"
      ? shipment.application?.campaign?.brand || shipment.client?.name || "Brand"
      : shipment.creator?.name || "Creator";
  const initials = String(person)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Package className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">
              {shipment.title}
            </p>
            <p className="font-mono text-[11px] text-slate-400">
              {logisticsShortId(shipment.id)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge
            variant="outline"
            className={cn("rounded-full gap-1 text-[11px]", meta.className)}
          >
            <StatusIcon className="h-3 w-3" />
            {label}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "rounded-full text-[10px]",
              logisticsDispositionMeta(shipment.disposition).className
            )}
          >
            {logisticsDispositionMeta(shipment.disposition).label}
          </Badge>
        </div>
      </div>

      <LogisticsRouteRail shipment={shipment} perspective={perspective} compact />

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[10px] font-semibold text-white">
            {initials || "?"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-800">{person}</p>
            <p className="truncate text-[11px] text-slate-400">
              {shipment.courier
                ? [
                    shipment.courier,
                    shipment.riderNumber,
                    shipment.trackingRef,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : "Courier not recorded"}
            </p>
          </div>
        </div>
        <p className="shrink-0 text-[11px] text-slate-400">
          {formatDistanceToNow(new Date(shipment.updatedAt), { addSuffix: true })}
        </p>
      </div>
    </>
  );

  const className = cn(
    "block w-full rounded-2xl border bg-white p-3.5 text-left transition",
    selected
      ? "border-slate-950 shadow-[0_12px_28px_rgba(15,23,42,0.1)] ring-1 ring-slate-950"
      : "border-slate-200 hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
  );

  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(shipment)} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export function LogisticsVerticalTrack({ shipment }) {
  const timeline = logisticsTimeline(shipment);
  const stamps = {
    dispatch: shipment.dispatchedAt,
    courier: shipment.dispatchedAt,
    verify: shipment.receivedAt,
    return: shipment.returnAckedAt || shipment.returnRequestedAt,
  };

  return (
    <ol className="relative space-y-0 pl-1">
      <span className="absolute bottom-3 left-[11px] top-3 w-px bg-slate-200" />
      {timeline.map((step) => (
        <li key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
          <span
            className={cn(
              "relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white",
              step.done ? "bg-sky-500 text-white" : "bg-white ring-1 ring-slate-300"
            )}
          >
            {step.done ? (
              <span className="h-2 w-2 rounded-full bg-white" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-slate-300" />
            )}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-slate-950">{step.label}</p>
              {stamps[step.id] ? (
                <p className="text-[11px] text-slate-400">
                  {format(new Date(stamps[step.id]), "MMM d · h:mm a")}
                </p>
              ) : null}
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{step.detail}</p>
            {step.id === "courier" && shipment.courier ? (
              <p className="mt-1 text-xs text-slate-400">
                {[shipment.courier, shipment.riderNumber, shipment.trackingRef]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function LogisticsPeekPanel({
  shipment,
  perspective = "client",
  basePath,
  onClose,
}) {
  const [tab, setTab] = useState("tracking");
  const meta = logisticsStatusMeta(shipment.status);
  const StatusIcon = meta.icon;
  const label =
    perspective === "creator" ? meta.creatorLabel : meta.clientLabel;

  useEffect(() => {
    setTab("tracking");
  }, [shipment.id]);

  const tabs = [
    { id: "info", label: "Kit info" },
    { id: "tracking", label: "Tracking" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-slate-400">
            {logisticsShortId(shipment.id)}
          </p>
          <h2 className="mt-0.5 truncate text-base font-semibold text-slate-950">
            {shipment.title}
          </h2>
          <Badge
            variant="outline"
            className={cn("mt-2 rounded-full gap-1", meta.className)}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {label}
          </Badge>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={`${basePath}/${shipment.id}`}>
              Open
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-100 px-3 pt-2 sm:px-4">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-t-lg px-3 py-2 text-sm font-semibold transition",
              tab === item.id
                ? "bg-slate-950 text-white"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        {tab === "info" ? (
          <div className="space-y-4">
            <LogisticsRouteRail shipment={shipment} perspective={perspective} />
            <dl className="grid gap-3 sm:grid-cols-2">
              <PeekField
                label={perspective === "creator" ? "From" : "Creator"}
                value={
                  perspective === "creator"
                    ? shipment.application?.campaign?.brand ||
                      shipment.client?.name ||
                      "—"
                    : shipment.creator?.name || "—"
                }
              />
              <PeekField
                label={
                  shipment.appointmentId || shipment.sourceKind === "TALENT_BOOKING"
                    ? "Booking"
                    : "Campaign"
                }
                value={
                  shipment.appointmentId || shipment.sourceKind === "TALENT_BOOKING"
                    ? shipment.appointment?.creator?.specialty
                      ? `Talent · ${shipment.appointment.creator.specialty}`
                      : "Talent booking"
                    : shipment.application?.campaign?.title || "—"
                }
              />
              <PeekField
                label="Product type"
                value={logisticsDispositionMeta(shipment.disposition).label}
              />
              <PeekField label="Courier" value={shipment.courier || "Not recorded"} />
              <PeekField label="Rider number" value={shipment.riderNumber || "—"} />
              <PeekField label="Reference" value={shipment.trackingRef || "—"} />
            </dl>
            {shipment.dispatchNotes ? (
              <div className="rounded-2xl bg-slate-50 px-3.5 py-3 text-sm text-slate-700">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Notes
                </p>
                <p className="mt-1 whitespace-pre-wrap">{shipment.dispatchNotes}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === "tracking" ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Self-managed route
              </p>
              <LogisticsRouteRail shipment={shipment} perspective={perspective} />
            </div>
            <LogisticsVerticalTrack shipment={shipment} />
          </div>
        ) : null}

        {tab === "activity" ? (
          <LogisticsAuditTrail events={shipment.events} />
        ) : null}
      </div>
    </div>
  );
}

function PeekField({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-3.5 py-3">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

export function LogisticsMasterDetail({
  shipments = [],
  perspective = "client",
  basePath,
  filters,
  emptyTitle,
  emptyBody,
  listFooter,
  toolbar,
}) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(shipments[0]?.id || null);

  useEffect(() => {
    if (!shipments.length) {
      setSelectedId(null);
      return;
    }
    if (!shipments.some((row) => row.id === selectedId)) {
      setSelectedId(shipments[0].id);
    }
  }, [shipments, selectedId]);

  const counts = useMemo(() => {
    const map = { all: shipments.length };
    for (const item of filters) {
      if (item.id === "all") continue;
      map[item.id] = shipments.filter((row) =>
        item.match ? item.match(row) : row.status === item.id
      ).length;
    }
    return map;
  }, [shipments, filters]);

  const filtered = useMemo(() => {
    let rows = shipments;
    const active = filters.find((item) => item.id === filter);
    if (active && active.id !== "all") {
      rows = rows.filter((row) =>
        active.match ? active.match(row) : row.status === active.id
      );
    }
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((row) => {
        const hay = [
          row.title,
          row.courier,
          row.riderNumber,
          row.trackingRef,
          row.creator?.name,
          row.client?.name,
          row.application?.campaign?.title,
          row.application?.campaign?.brand,
          row.appointment?.creator?.specialty,
          row.sourceKind === "TALENT_BOOKING" ? "talent booking" : "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return rows;
  }, [shipments, filter, query, filters]);

  const selected =
    filtered.find((row) => row.id === selectedId) ||
    shipments.find((row) => row.id === selectedId) ||
    null;

  return (
    <div className="grid min-h-[70vh] gap-4 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)] xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
      <div className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="space-y-3 border-b border-slate-100 px-4 py-4">
          {toolbar}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search kits, creators, references…"
              className="h-10 rounded-full border-slate-200 bg-slate-50 pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.map((item) => {
              const count = counts[item.id] ?? 0;
              if (item.id !== "all" && count === 0) return null;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    filter === item.id
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {item.label}
                  <span className="ml-1.5 opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
              <Package className="mx-auto h-5 w-5 text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-900">{emptyTitle}</p>
              <p className="mt-1 text-sm text-slate-500">{emptyBody}</p>
            </div>
          ) : (
            filtered.map((shipment) => (
              <LogisticsShipmentCard
                key={shipment.id}
                shipment={shipment}
                perspective={perspective}
                selected={shipment.id === selected?.id}
                onSelect={(row) => setSelectedId(row.id)}
              />
            ))
          )}
        </div>

        {listFooter ? (
          <div className="border-t border-slate-100 p-3">{listFooter}</div>
        ) : null}
      </div>

      <div className="relative hidden min-h-[560px] overflow-hidden rounded-3xl border border-slate-200 bg-[#eef1f6] lg:block">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.08) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="pointer-events-none absolute inset-x-[12%] top-[18%] h-px bg-slate-300/70" />
        <div className="pointer-events-none absolute inset-y-[22%] left-[18%] w-px bg-slate-300/50" />
        <div className="absolute inset-3 sm:inset-4">
          {selected ? (
            <LogisticsPeekPanel
              shipment={selected}
              perspective={perspective}
              basePath={basePath}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 text-center">
              <div>
                <Package className="mx-auto h-6 w-6 text-slate-400" />
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  Select a kit
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Tracking opens here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: deep-link into full detail */}
      {selected ? (
        <div className="lg:hidden">
          <Button asChild variant="black" className="w-full rounded-full">
            <Link href={`${basePath}/${selected.id}`}>
              Open {selected.title}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
