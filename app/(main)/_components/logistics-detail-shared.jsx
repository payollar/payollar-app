"use client";

import { format } from "date-fns";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Gift,
  Package,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  logisticsDispositionMeta,
  logisticsStatusMeta,
} from "@/lib/logistics-ui";

export function LogisticsStatusStrip({
  shipment,
  labelKey = "clientLabel",
}) {
  const meta = logisticsStatusMeta(shipment.status);
  const StatusIcon = meta.icon;
  const disposition = logisticsDispositionMeta(shipment.disposition);
  const campaign = shipment.application?.campaign;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        variant="outline"
        className={cn("rounded-full gap-1.5 px-3 py-1 font-medium", meta.className)}
      >
        <StatusIcon className="h-3.5 w-3.5" />
        {meta[labelKey] || meta.label}
      </Badge>
      <Badge
        variant="outline"
        className={cn("rounded-full px-3 py-1 font-medium", disposition.className)}
      >
        {disposition.shortLabel}
      </Badge>
      {campaign?.title ? (
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600">
          {campaign.brand ? `${campaign.brand} · ` : ""}
          {campaign.title}
        </span>
      ) : null}
    </div>
  );
}

export function LogisticsDispositionPicker({
  value = "GIFT",
  onChange,
  disabled = false,
}) {
  const options = [
    {
      id: "GIFT",
      label: "Gift",
      detail: "Creator keeps the product",
      icon: Gift,
    },
    {
      id: "RETURNABLE",
      label: "Returnable",
      detail: "Expect it back later",
      icon: RotateCcw,
    },
  ];

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-slate-900">Product type</p>
        <p className="text-xs text-slate-500">
          Choose whether this kit is a gift or needs to come back.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {options.map((option) => {
          const active = value === option.id;
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(option.id)}
              className={cn(
                "relative rounded-2xl border px-3.5 py-3.5 text-left transition",
                active
                  ? "border-slate-950 bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
                  : "border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-white",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <span
                className={cn(
                  "mb-3 flex h-9 w-9 items-center justify-center rounded-xl",
                  active ? "bg-white/15 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold">{option.label}</p>
              <p
                className={cn(
                  "mt-0.5 text-xs leading-relaxed",
                  active ? "text-white/70" : "text-slate-500"
                )}
              >
                {option.detail}
              </p>
              <span
                className={cn(
                  "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full",
                  active
                    ? "bg-white text-slate-950"
                    : "border border-slate-300 bg-white"
                )}
              >
                {active ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LogisticsPersonChip({ name, role, tone = "slate" }) {
  const initials = String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          tone === "dark"
            ? "bg-slate-950 text-white"
            : "bg-slate-100 text-slate-700"
        )}
      >
        {initials || "?"}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">{name || "—"}</p>
        {role ? (
          <p className="text-[11px] uppercase tracking-wide text-slate-400">{role}</p>
        ) : null}
      </div>
    </div>
  );
}

export function LogisticsWorkspaceShell({
  eyebrow,
  title,
  description,
  person,
  children,
  className,
  cardClass,
}) {
  return (
    <section className={cn(cardClass, "p-4 sm:p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        {person}
        {eyebrow ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {eyebrow}
          </span>
        ) : null}
      </div>
      <div className="mt-4 space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function LogisticsDispatchSummary({ shipment }) {
  if (!shipment?.dispatchedAt) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
        Waiting for dispatch details
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoTile icon={Truck} label="Courier" value={shipment.courier || "—"} />
        <InfoTile icon={Package} label="Rider number" value={shipment.riderNumber || "—"} />
        {shipment.trackingRef ? (
          <InfoTile icon={Package} label="Reference" value={shipment.trackingRef} />
        ) : null}
      </div>
      {shipment.dispatchNotes ? (
        <div className="rounded-2xl bg-slate-50 px-3.5 py-3 text-sm text-slate-700">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Notes
          </p>
          <p className="mt-1 whitespace-pre-wrap">{shipment.dispatchNotes}</p>
        </div>
      ) : null}
      <p className="text-xs text-slate-400">
        Recorded {format(new Date(shipment.dispatchedAt), "MMM d · h:mm a")}
      </p>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        <p className="text-[11px] font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-1.5 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export function LogisticsRecipientPanel({ shipment, perspective = "client" }) {
  const meta = logisticsStatusMeta(shipment.status);

  if (shipment.status === "RECEIVED_OK") {
    return (
      <OutcomePanel
        tone="success"
        icon={CheckCircle2}
        title="Received safely"
        body={shipment.receiveNotes || null}
        at={shipment.receivedAt}
      />
    );
  }

  if (shipment.status === "PROBLEM") {
    return (
      <OutcomePanel
        tone="danger"
        icon={AlertTriangle}
        title="Problem reported"
        body={shipment.problemNotes || null}
        at={shipment.receivedAt}
      />
    );
  }

  if (shipment.status === "RETURN_REQUESTED" || shipment.status === "RETURN_ACKED") {
    return (
      <OutcomePanel
        tone="warn"
        icon={RotateCcw}
        title={
          shipment.status === "RETURN_ACKED"
            ? "Return acknowledged"
            : "Return requested"
        }
        body={shipment.returnNotes || shipment.returnAckNotes || null}
        at={shipment.returnAckedAt || shipment.returnRequestedAt}
      />
    );
  }

  if (shipment.status === "DISPATCHED") {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <Clock3 className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-950">
              {perspective === "client" ? "Awaiting confirmation" : "Confirm receipt"}
            </p>
            {shipment.dispatchedAt ? (
              <p className="mt-0.5 text-xs text-slate-400">
                Dispatched {format(new Date(shipment.dispatchedAt), "MMM d · h:mm a")}
                {shipment.courier ? ` · ${shipment.courier}` : ""}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <Package className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-semibold text-slate-900">{meta.creatorLabel}</p>
      <p className="mt-1 text-sm text-slate-500">Available after dispatch</p>
    </div>
  );
}

function OutcomePanel({ tone, icon: Icon, title, body, at }) {
  const tones = {
    success: "border-emerald-200 bg-emerald-50/70 text-emerald-900",
    danger: "border-rose-200 bg-rose-50/70 text-rose-900",
    warn: "border-orange-200 bg-orange-50/70 text-orange-950",
  };
  const iconTone = {
    success: "bg-white text-emerald-600 ring-emerald-100",
    danger: "bg-white text-rose-600 ring-rose-100",
    warn: "bg-white text-orange-600 ring-orange-100",
  };

  return (
    <div className={cn("rounded-2xl border px-4 py-5", tones[tone])}>
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1",
            iconTone[tone]
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          {body ? <p className="mt-1 text-sm opacity-80">{body}</p> : null}
          {at ? (
            <p className="mt-2 text-xs opacity-60">
              {format(new Date(at), "MMM d · h:mm a")}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function LogisticsAuditTrail({ events = [] }) {
  if (!events.length) {
    return <p className="text-sm text-slate-500">No events yet.</p>;
  }

  return (
    <ul className="relative space-y-0">
      <span className="absolute bottom-2 left-[7px] top-2 w-px bg-slate-200" />
      {[...events].reverse().map((event) => (
        <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
          <span className="relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white bg-slate-950 shadow-sm" />
          <div className="min-w-0 flex-1 rounded-xl bg-slate-50/80 px-3.5 py-2.5">
            <p className="text-sm font-medium text-slate-900">{event.message}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>
                {event.at ? format(new Date(event.at), "MMM d · h:mm a") : ""}
              </span>
              {event.actorRole ? (
                <span className="rounded-full bg-white px-2 py-0.5 font-medium uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">
                  {event.actorRole.toLowerCase()}
                </span>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function LogisticsExplainers() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Two-sided verification",
      body: "Brand records dispatch. Creator confirms receipt or flags a problem.",
    },
    {
      icon: Package,
      title: "Evidence, not delivery",
      body: "Payollar stores claims and confirmations — not courier tracking.",
    },
    {
      icon: AlertTriangle,
      title: "Exception alerts",
      body: "Problems and return requests stay visible on the shared record.",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.03)]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
            <item.icon className="h-4 w-4" />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-950">{item.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
