"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  Loader2,
  MessageSquare,
  Percent,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  acceptMediaNegotiation,
  approveMediaDiscount,
  counterMediaNegotiation,
  rejectMediaNegotiation,
} from "@/actions/media-negotiate";
import { MEDIA_NEGOTIATION_DEMO } from "@/lib/media-negotiate-demo";
import { cn } from "@/lib/utils";
import {
  MediaAgencyPageShell,
  mediaAgencyCardClass,
} from "./media-agency-page-shell";

function money(value) {
  return `GH₵ ${Number(value || 0).toLocaleString("en-GH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function statusMeta(status) {
  if (status === "DISCOUNT_REQUESTED") {
    return {
      label: "Action required",
      className: "border-amber-200 bg-amber-50 text-amber-800",
    };
  }
  if (status === "COUNTERED") {
    return {
      label: "Counter sent",
      className: "border-sky-200 bg-sky-50 text-sky-800",
    };
  }
  if (status === "ACCEPTED") {
    return {
      label: "Approved",
      className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    };
  }
  if (status === "REJECTED") {
    return {
      label: "Declined",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }
  return {
    label: "Open",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  };
}

function initials(name) {
  return String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function NegotiationCard({ negotiation, isDemo, onLocalUpdate }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [discountPct, setDiscountPct] = useState(
    String(negotiation.requestedDiscountPct ?? 10)
  );
  const [counterAmount, setCounterAmount] = useState(
    String(
      negotiation.proposedAmount ??
        Math.round(Number(negotiation.listAmount || 0) * 0.9)
    )
  );
  const status = statusMeta(negotiation.status);
  const closed = ["ACCEPTED", "REJECTED", "CLOSED"].includes(negotiation.status);
  const needsAction = ["OPEN", "DISCOUNT_REQUESTED"].includes(negotiation.status);
  const approvedTotal =
    Number.isFinite(Number(discountPct)) && Number(discountPct) >= 0 && Number(discountPct) < 100
      ? Math.round(negotiation.listAmount * (1 - Number(discountPct) / 100) * 100) / 100
      : null;

  const run = (fn, successMessage, demoPatch) => {
    if (isDemo) {
      if (demoPatch) onLocalUpdate?.(negotiation.id, demoPatch);
      toast.success(successMessage);
      return;
    }
    startTransition(async () => {
      try {
        await fn();
        toast.success(successMessage);
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Something went wrong");
      }
    });
  };

  return (
    <article className={cn(mediaAgencyCardClass, "p-4 sm:p-5")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-xs font-semibold text-white">
            {initials(negotiation.clientName || negotiation.clientEmail)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-slate-950">
                {negotiation.clientName || negotiation.clientEmail}
              </h3>
              <Badge variant="outline" className={cn("rounded-full", status.className)}>
                {status.label}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-sm text-slate-500">
              {negotiation.title}
              {negotiation.packageLabel ? ` · ${negotiation.packageLabel}` : ""}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold tabular-nums text-slate-950">
            {money(negotiation.listAmount)}
          </p>
          <p className="text-xs text-slate-400">Published quote</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {negotiation.requestedDiscountPct != null ? (
          <Badge
            variant="outline"
            className="rounded-full border-slate-200 bg-slate-50 text-slate-700"
          >
            Requested {negotiation.requestedDiscountPct}% discount
          </Badge>
        ) : null}
        {negotiation.proposedAmount != null ? (
          <Badge
            variant="outline"
            className="rounded-full border-slate-200 bg-slate-50 text-slate-700"
          >
            Buyer proposed {money(negotiation.proposedAmount)}
          </Badge>
        ) : null}
        {negotiation.counterAmount != null ? (
          <Badge
            variant="outline"
            className="rounded-full border-sky-200 bg-sky-50 text-sky-800"
          >
            Your counter {money(negotiation.counterAmount)}
          </Badge>
        ) : null}
        {negotiation.agreedAmount != null ? (
          <Badge
            variant="outline"
            className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-800"
          >
            Agreed {money(negotiation.agreedAmount)}
          </Badge>
        ) : null}
      </div>

      {needsAction && !closed ? (
        <div className="mt-4 space-y-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-3.5">
          <p className="text-sm text-amber-950">
            Confirm inventory, then approve the requested discount, send a counter, or decline.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`discount-${negotiation.id}`}>
                Seller-approved discount %
              </Label>
              <div className="relative">
                <Input
                  id={`discount-${negotiation.id}`}
                  type="number"
                  min="0"
                  max="99"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                  className="h-10 rounded-xl pr-8"
                />
                <Percent className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>
              {approvedTotal != null ? (
                <p className="text-xs text-slate-500">
                  Approved total: {money(approvedTotal)}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`counter-${negotiation.id}`}>Counter amount (GH₵)</Label>
              <Input
                id={`counter-${negotiation.id}`}
                type="number"
                min="1"
                value={counterAmount}
                onChange={(e) => setCounterAmount(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="black"
              className="rounded-full"
              disabled={pending}
              onClick={() =>
                run(
                  () =>
                    approveMediaDiscount(negotiation.id, {
                      discountPct: Number(discountPct),
                    }),
                  "Discount approved",
                  {
                    status: "ACCEPTED",
                    requestedDiscountPct: Number(discountPct),
                    proposedAmount: approvedTotal,
                    agreedAmount: approvedTotal,
                  }
                )
              }
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Accept terms
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={pending}
              onClick={() =>
                run(
                  () =>
                    counterMediaNegotiation(negotiation.id, {
                      amount: Number(counterAmount),
                    }),
                  "Counter sent",
                  {
                    status: "COUNTERED",
                    counterAmount: Number(counterAmount),
                  }
                )
              }
            >
              Send counteroffer
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
              disabled={pending}
              onClick={() =>
                run(
                  () => rejectMediaNegotiation(negotiation.id),
                  "Discount declined",
                  { status: "REJECTED" }
                )
              }
            >
              <XCircle className="h-4 w-4" />
              Decline
            </Button>
            {!isDemo ? (
              <Button asChild variant="ghost" className="rounded-full">
                <Link href={`/media-agency/negotiations/${negotiation.id}`}>
                  <MessageSquare className="h-4 w-4" />
                  Open thread
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {!isDemo ? (
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/media-agency/negotiations/${negotiation.id}`}>
                <MessageSquare className="h-4 w-4" />
                Open thread
              </Link>
            </Button>
          ) : null}
          {negotiation.status === "COUNTERED" && !isDemo ? (
            <Button
              type="button"
              variant="black"
              className="rounded-full"
              disabled={pending}
              onClick={() =>
                run(
                  () =>
                    acceptMediaNegotiation(negotiation.id, {
                      amount: negotiation.counterAmount,
                    }),
                  "Terms locked"
                )
              }
            >
              Lock counter as agreed
            </Button>
          ) : null}
          <p className="self-center text-xs text-slate-400">
            Updated {formatDistanceToNow(new Date(negotiation.updatedAt), { addSuffix: true })}
          </p>
        </div>
      )}
    </article>
  );
}

export function AgencyNegotiationsDashboard({ negotiations = [] }) {
  const hasReal = negotiations.length > 0;
  const [rows, setRows] = useState(hasReal ? negotiations : MEDIA_NEGOTIATION_DEMO);
  const usingDemo = !hasReal;

  useEffect(() => {
    setRows(hasReal ? negotiations : MEDIA_NEGOTIATION_DEMO);
  }, [hasReal, negotiations]);

  const stats = useMemo(() => {
    const next = {
      open: 0,
      requested: 0,
      countered: 0,
      accepted: 0,
      listValue: 0,
    };
    for (const row of rows) {
      next.listValue += Number(row.listAmount || 0);
      if (row.status === "OPEN") next.open += 1;
      if (row.status === "DISCOUNT_REQUESTED") next.requested += 1;
      if (row.status === "COUNTERED") next.countered += 1;
      if (row.status === "ACCEPTED") next.accepted += 1;
    }
    return next;
  }, [rows]);

  const actionRequired = rows.filter((row) =>
    ["OPEN", "DISCOUNT_REQUESTED"].includes(row.status)
  );

  return (
    <MediaAgencyPageShell
      eyebrow="Seller workspace"
      title="Quote requests & negotiations"
      description="Publish rates stay on the quote. Approve discounts, counter, or decline — then lock exact terms."
    >
      {usingDemo ? (
        <p className="text-sm text-slate-500">
          Preview with example quote requests. Real negotiations appear here when buyers ask for discounts.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Action required" value={stats.requested + stats.open} />
        <Stat label="Published quote value" value={money(stats.listValue)} />
        <Stat
          label="Discount requests"
          value={stats.requested}
        />
        <Stat label="Approved deals" value={stats.accepted} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-950">
              Quote requests & negotiations
            </h2>
            {actionRequired.length > 0 ? (
              <Badge
                variant="outline"
                className="rounded-full border-amber-200 bg-amber-50 text-amber-800"
              >
                Action required
              </Badge>
            ) : null}
          </div>

          {rows.length === 0 ? (
            <div className={cn(mediaAgencyCardClass, "px-5 py-12 text-center")}>
              <MessageSquare className="mx-auto h-6 w-6 text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-900">No negotiations yet</p>
              <p className="mt-1 text-sm text-slate-500">
                When buyers request discounts from Media bookings, they show up here.
              </p>
            </div>
          ) : (
            rows.map((negotiation) => (
              <NegotiationCard
                key={negotiation.id}
                negotiation={negotiation}
                isDemo={usingDemo}
                onLocalUpdate={(id, patch) => {
                  setRows((prev) =>
                    prev.map((row) => (row.id === id ? { ...row, ...patch } : row))
                  );
                }}
              />
            ))
          )}
        </div>

        <aside className={cn(mediaAgencyCardClass, "h-fit p-4 sm:p-5")}>
          <h2 className="text-base font-semibold text-slate-950">Station controls</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <ControlLink href="/media-agency/smart-rate-card" label="Rate cards" detail="Publish and update rates" />
            <ControlLink href="/media-agency/rate-card" label="Packages" detail="Custom inventory packages" />
            <ControlLink href="/media-agency/requests" label="Bookings" detail="Approve booking requests" />
            <ControlLink href="/media-agency/transmission-certificates" label="Delivery" detail="Upload proof of airing" />
            <ControlLink href="/media-agency/reporting" label="Reporting" detail="Campaign performance" />
          </ul>
        </aside>
      </div>
    </MediaAgencyPageShell>
  );
}

function Stat({ label, value }) {
  return (
    <div className={cn(mediaAgencyCardClass, "p-4")}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">{value}</p>
    </div>
  );
}

function ControlLink({ href, label, detail }) {
  return (
    <li>
      <Link
        href={href}
        className="block rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
      >
        <p className="font-semibold text-slate-950">{label}</p>
        <p className="text-xs text-slate-500">{detail}</p>
      </Link>
    </li>
  );
}
