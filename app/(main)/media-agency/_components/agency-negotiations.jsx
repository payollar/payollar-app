"use client";

import { useMemo, useState, useTransition } from "react";
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
  if (status === "DISCOUNT_REQUESTED" || status === "OPEN") {
    return {
      label: status === "OPEN" ? "Open" : "Needs reply",
      className: "bg-amber-50 text-amber-800",
    };
  }
  if (status === "COUNTERED") {
    return { label: "Countered", className: "bg-[#eef2ff] text-[#0055ff]" };
  }
  if (status === "ACCEPTED") {
    return { label: "Approved", className: "bg-emerald-50 text-emerald-700" };
  }
  if (status === "REJECTED") {
    return { label: "Declined", className: "bg-rose-50 text-rose-700" };
  }
  return { label: status || "Open", className: "bg-slate-100 text-slate-600" };
}

function initials(name) {
  return String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function needsAction(status) {
  return status === "OPEN" || status === "DISCOUNT_REQUESTED";
}

function NegotiationCard({ negotiation }) {
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
  const actionNeeded = needsAction(negotiation.status);
  const closed = ["ACCEPTED", "REJECTED", "CLOSED"].includes(negotiation.status);

  const approvedTotal =
    Number.isFinite(Number(discountPct)) &&
    Number(discountPct) >= 0 &&
    Number(discountPct) < 100
      ? Math.round(negotiation.listAmount * (1 - Number(discountPct) / 100) * 100) /
        100
      : null;

  const run = (fn, successMessage) => {
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
    <article className={cn(mediaAgencyCardClass, "p-4")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
            {initials(negotiation.clientName || negotiation.clientEmail)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-slate-950">
                {negotiation.clientName || negotiation.clientEmail}
              </h3>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  status.className
                )}
              >
                {status.label}
              </span>
            </div>
            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
              {negotiation.title}
              {negotiation.packageLabel ? ` · ${negotiation.packageLabel}` : ""}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold tabular-nums text-slate-950">
            {money(negotiation.listAmount)}
          </p>
          <p className="text-[10px] text-slate-400">Quote</p>
        </div>
      </div>

      {(negotiation.requestedDiscountPct != null ||
        negotiation.proposedAmount != null ||
        negotiation.counterAmount != null ||
        negotiation.agreedAmount != null) && (
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-slate-600">
          {negotiation.requestedDiscountPct != null ? (
            <span className="rounded-md bg-slate-50 px-2 py-1">
              −{negotiation.requestedDiscountPct}%
            </span>
          ) : null}
          {negotiation.proposedAmount != null ? (
            <span className="rounded-md bg-slate-50 px-2 py-1">
              Asked {money(negotiation.proposedAmount)}
            </span>
          ) : null}
          {negotiation.counterAmount != null ? (
            <span className="rounded-md bg-slate-50 px-2 py-1">
              Counter {money(negotiation.counterAmount)}
            </span>
          ) : null}
          {negotiation.agreedAmount != null ? (
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">
              Agreed {money(negotiation.agreedAmount)}
            </span>
          ) : null}
        </div>
      )}

      {actionNeeded && !closed ? (
        <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label
                htmlFor={`discount-${negotiation.id}`}
                className="text-xs text-slate-500"
              >
                Discount %
              </Label>
              <div className="relative">
                <Input
                  id={`discount-${negotiation.id}`}
                  type="number"
                  min="0"
                  max="99"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                  className="h-9 rounded-lg border-slate-200 pr-8 text-sm shadow-none"
                />
                <Percent className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>
              {approvedTotal != null ? (
                <p className="text-[11px] text-slate-400">
                  = {money(approvedTotal)}
                </p>
              ) : null}
            </div>
            <div className="space-y-1">
              <Label
                htmlFor={`counter-${negotiation.id}`}
                className="text-xs text-slate-500"
              >
                Counter (GH₵)
              </Label>
              <Input
                id={`counter-${negotiation.id}`}
                type="number"
                min="1"
                value={counterAmount}
                onChange={(e) => setCounterAmount(e.target.value)}
                className="h-9 rounded-lg border-slate-200 text-sm shadow-none"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-full bg-slate-950 px-3 text-xs text-white hover:bg-black"
              disabled={pending}
              onClick={() =>
                run(
                  () =>
                    approveMediaDiscount(negotiation.id, {
                      discountPct: Number(discountPct),
                    }),
                  "Discount approved"
                )
              }
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Accept
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 rounded-full border-slate-200 px-3 text-xs"
              disabled={pending}
              onClick={() =>
                run(
                  () =>
                    counterMediaNegotiation(negotiation.id, {
                      amount: Number(counterAmount),
                    }),
                  "Counter sent"
                )
              }
            >
              Counter
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 rounded-full border-rose-200 px-3 text-xs text-rose-700 hover:bg-rose-50"
              disabled={pending}
              onClick={() =>
                run(
                  () => rejectMediaNegotiation(negotiation.id),
                  "Declined"
                )
              }
            >
              <XCircle className="h-3.5 w-3.5" />
              Decline
            </Button>
            <Button asChild size="sm" variant="ghost" className="h-8 rounded-full px-2 text-xs text-slate-500">
              <Link href={`/media-agency/negotiations/${negotiation.id}`}>
                Thread
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <Button asChild size="sm" variant="outline" className="h-8 rounded-full border-slate-200 px-3 text-xs">
            <Link href={`/media-agency/negotiations/${negotiation.id}`}>
              <MessageSquare className="h-3.5 w-3.5" />
              Thread
            </Link>
          </Button>
          {negotiation.status === "COUNTERED" ? (
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-full bg-[#0055ff] px-3 text-xs text-white hover:bg-[#0046d4]"
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
              Lock counter
            </Button>
          ) : null}
          <span className="ml-auto text-[11px] text-slate-400">
            {formatDistanceToNow(new Date(negotiation.updatedAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      )}
    </article>
  );
}

export function AgencyNegotiationsDashboard({ negotiations = [] }) {
  const [filter, setFilter] = useState("all");

  const stats = useMemo(() => {
    let action = 0;
    let accepted = 0;
    let listValue = 0;
    for (const row of negotiations) {
      listValue += Number(row.listAmount || 0);
      if (needsAction(row.status)) action += 1;
      if (row.status === "ACCEPTED") accepted += 1;
    }
    return { action, accepted, listValue, total: negotiations.length };
  }, [negotiations]);

  const filtered = useMemo(() => {
    let list = [...negotiations];
    if (filter === "action") {
      list = list.filter((row) => needsAction(row.status));
    } else if (filter === "done") {
      list = list.filter((row) =>
        ["ACCEPTED", "REJECTED", "CLOSED", "COUNTERED"].includes(row.status)
      );
    }
    list.sort((a, b) => {
      const aAction = needsAction(a.status) ? 0 : 1;
      const bAction = needsAction(b.status) ? 0 : 1;
      if (aAction !== bAction) return aAction - bAction;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    return list;
  }, [negotiations, filter]);

  return (
    <MediaAgencyPageShell
      eyebrow="Seller workspace"
      title="Negotiations"
      description="Approve, counter, or decline buyer discount requests."
    >
      <div
        className={cn(
          mediaAgencyCardClass,
          "grid grid-cols-3 overflow-hidden"
        )}
      >
        {[
          { label: "Needs reply", value: stats.action },
          { label: "Open quotes", value: money(stats.listValue) },
          { label: "Approved", value: stats.accepted },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "px-4 py-3.5",
              index < 2 && "border-r border-slate-100"
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {stat.label}
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-slate-950">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-700">
          {filtered.length} request{filtered.length === 1 ? "" : "s"}
        </p>
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-0.5">
          {[
            { id: "all", label: "All" },
            { id: "action", label: "Needs reply" },
            { id: "done", label: "Other" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                filter === item.id
                  ? "bg-slate-950 text-white"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className={cn(
            mediaAgencyCardClass,
            "px-5 py-12 text-center"
          )}
        >
          <MessageSquare className="mx-auto h-5 w-5 text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {negotiations.length === 0
              ? "No negotiations yet"
              : "Nothing here"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {negotiations.length === 0
              ? "Discount requests from buyers will show up here."
              : "Try another filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((negotiation) => (
            <NegotiationCard key={negotiation.id} negotiation={negotiation} />
          ))}
        </div>
      )}
    </MediaAgencyPageShell>
  );
}
