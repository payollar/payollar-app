"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Percent,
  Send,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  acceptMediaNegotiation,
  counterMediaNegotiation,
  getMediaNegotiation,
  rejectMediaNegotiation,
  requestMediaDiscount,
  sendMediaNegotiationMessage,
} from "@/actions/media-negotiate";
import { cn } from "@/lib/utils";
import { ClientPageShell, clientCardClass } from "./client-page-shell";

function money(value) {
  return `GH₵ ${Number(value || 0).toLocaleString("en-GH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function statusMeta(status) {
  if (status === "DISCOUNT_REQUESTED") {
    return { label: "Discount pending", className: "border-amber-200 bg-amber-50 text-amber-800" };
  }
  if (status === "COUNTERED") {
    return { label: "Station countered", className: "border-sky-200 bg-sky-50 text-sky-800" };
  }
  if (status === "ACCEPTED") {
    return { label: "Agreed", className: "border-emerald-200 bg-emerald-50 text-emerald-800" };
  }
  if (status === "REJECTED") {
    return { label: "Declined", className: "border-rose-200 bg-rose-50 text-rose-700" };
  }
  return { label: "Open", className: "border-slate-200 bg-slate-100 text-slate-700" };
}

function OfferSummary({ negotiation }) {
  const rows = [
    { label: "Published quote", value: money(negotiation.listAmount) },
    {
      label: "Discount requested",
      value:
        negotiation.requestedDiscountPct != null
          ? `${negotiation.requestedDiscountPct}%`
          : "—",
    },
    {
      label: "Your proposed total",
      value: negotiation.proposedAmount != null ? money(negotiation.proposedAmount) : "—",
    },
    {
      label: "Station counter",
      value: negotiation.counterAmount != null ? money(negotiation.counterAmount) : "—",
    },
    {
      label: "Agreed total",
      value: negotiation.agreedAmount != null ? money(negotiation.agreedAmount) : "Pending",
    },
  ];

  return (
    <div className={cn(clientCardClass, "p-4 sm:p-5")}>
      <h2 className="text-base font-semibold text-slate-950">Offer summary</h2>
      <dl className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
            <dt className="text-slate-500">{row.label}</dt>
            <dd className="font-semibold tabular-nums text-slate-950">{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 rounded-xl bg-slate-50 px-3.5 py-3 text-xs leading-relaxed text-slate-500">
        Messages, discount requests, and counters stay on this record for both sides.
      </div>
    </div>
  );
}

function MessageBubble({ message, perspective }) {
  const mine =
    (perspective === "CLIENT" && message.senderRole === "CLIENT") ||
    (perspective === "AGENCY" && message.senderRole === "AGENCY");
  const system = message.senderRole === "SYSTEM" || message.type === "SYSTEM";

  if (system) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm text-slate-200">
        {message.body}
      </div>
    );
  }

  if (message.type === "DISCOUNT_REQUEST") {
    return (
      <div
        className={cn(
          "max-w-[85%] rounded-2xl border px-4 py-3 text-sm",
          mine
            ? "ml-auto border-slate-900 bg-slate-950 text-white"
            : "border-amber-200 bg-amber-50 text-amber-950"
        )}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
          Discount request
        </p>
        <p className="mt-1 whitespace-pre-wrap">{message.body}</p>
      </div>
    );
  }

  if (message.type === "COUNTER_OFFER") {
    return (
      <div
        className={cn(
          "max-w-[85%] rounded-2xl border px-4 py-3 text-sm",
          mine
            ? "ml-auto border-slate-900 bg-slate-950 text-white"
            : "border-sky-200 bg-sky-50 text-sky-950"
        )}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
          Counter offer
        </p>
        <p className="mt-1 whitespace-pre-wrap">{message.body}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
        mine ? "ml-auto bg-slate-950 text-white" : "bg-slate-100 text-slate-800"
      )}
    >
      <p className="whitespace-pre-wrap">{message.body}</p>
      <p className={cn("mt-1.5 text-[10px]", mine ? "text-white/50" : "text-slate-400")}>
        {format(new Date(message.createdAt), "MMM d · h:mm a")}
      </p>
    </div>
  );
}

export function MediaNegotiateWorkspace({
  negotiation: initial,
  perspective = "CLIENT",
  backHref,
  backLabel = "Back",
  PageShell = ClientPageShell,
  cardClass = clientCardClass,
}) {
  const router = useRouter();
  const [negotiation, setNegotiation] = useState(initial);
  const [draft, setDraft] = useState("");
  const [discountPct, setDiscountPct] = useState("10");
  const [discountNote, setDiscountNote] = useState("");
  const [counterAmount, setCounterAmount] = useState(
    initial.proposedAmount != null
      ? String(initial.proposedAmount)
      : String(Math.round(initial.listAmount * 0.9))
  );
  const [counterNote, setCounterNote] = useState("");
  const [pending, startTransition] = useTransition();
  const endRef = useRef(null);
  const closed = ["ACCEPTED", "REJECTED", "CLOSED"].includes(negotiation.status);
  const status = statusMeta(negotiation.status);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [negotiation.messages?.length]);

  useEffect(() => {
    if (!negotiation.id) return undefined;
    let active = true;
    const timer = setInterval(async () => {
      try {
        const next = await getMediaNegotiation(negotiation.id);
        if (active && next?.negotiation) setNegotiation(next.negotiation);
      } catch {
        // keep current thread
      }
    }, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [negotiation.id]);

  const run = (fn, successMessage) => {
    startTransition(async () => {
      try {
        const result = await fn();
        if (result?.negotiation) setNegotiation(result.negotiation);
        if (successMessage) toast.success(successMessage);
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Something went wrong");
      }
    });
  };

  return (
    <PageShell
      eyebrow="Negotiate"
      title={negotiation.title}
      description={`Talk with ${negotiation.stationName || "the station"} about rates and discounts.`}
      actions={
        <Button asChild variant="outline" className="rounded-full">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={cn("rounded-full", status.className)}>
          {status.label}
        </Badge>
        {negotiation.packageLabel ? (
          <span className="text-sm text-slate-500">{negotiation.packageLabel}</span>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className={cn(cardClass, "flex min-h-[560px] flex-col overflow-hidden p-0")}>
          <div className="border-b border-slate-100 px-4 py-3.5 sm:px-5">
            <p className="text-sm font-semibold text-slate-950">
              Inbox · {negotiation.stationName || "Station"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Negotiate directly with the media owner.
            </p>
          </div>

          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 sm:px-5">
            Quote {money(negotiation.listAmount)}
            {negotiation.packageLabel ? ` · ${negotiation.packageLabel}` : ""}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
            {(negotiation.messages || []).map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                perspective={perspective}
              />
            ))}
            {negotiation.status === "DISCOUNT_REQUESTED" && perspective === "CLIENT" ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                Discount request pending station approval. It is not yet a confirmed booking price.
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          {!closed ? (
            <div className="space-y-3 border-t border-slate-100 px-4 py-4 sm:px-5">
              {perspective === "CLIENT" ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                    <Percent className="h-4 w-4" />
                    Request discount
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-[100px_1fr_auto]">
                    <div className="space-y-1">
                      <Label htmlFor="discountPct">%</Label>
                      <Input
                        id="discountPct"
                        type="number"
                        min="1"
                        max="99"
                        value={discountPct}
                        onChange={(e) => setDiscountPct(e.target.value)}
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="discountNote">Note</Label>
                      <Input
                        id="discountNote"
                        value={discountNote}
                        onChange={(e) => setDiscountNote(e.target.value)}
                        placeholder="e.g. Volume buy across December"
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="black"
                        className="h-10 w-full rounded-full sm:w-auto"
                        disabled={pending}
                        onClick={() =>
                          run(
                            () =>
                              requestMediaDiscount(negotiation.id, {
                                discountPct: Number(discountPct),
                                note: discountNote,
                              }),
                            "Discount requested"
                          )
                        }
                      >
                        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Send request
                      </Button>
                    </div>
                  </div>
                  {Number(discountPct) > 0 && Number(discountPct) < 100 ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Proposed total:{" "}
                      {money(negotiation.listAmount * (1 - Number(discountPct) / 100))}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {perspective === "AGENCY" ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
                  <p className="text-sm font-semibold text-slate-950">Respond to offer</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="counterAmount">Counter amount (GH₵)</Label>
                      <Input
                        id="counterAmount"
                        type="number"
                        min="1"
                        value={counterAmount}
                        onChange={(e) => setCounterAmount(e.target.value)}
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="counterNote">Note</Label>
                      <Input
                        id="counterNote"
                        value={counterNote}
                        onChange={(e) => setCounterNote(e.target.value)}
                        placeholder="Optional note"
                        className="h-10 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="black"
                      className="rounded-full"
                      disabled={pending}
                      onClick={() =>
                        run(
                          () =>
                            counterMediaNegotiation(negotiation.id, {
                              amount: Number(counterAmount),
                              note: counterNote,
                            }),
                          "Counter sent"
                        )
                      }
                    >
                      Send counter
                    </Button>
                    {negotiation.proposedAmount != null ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        disabled={pending}
                        onClick={() =>
                          run(
                            () =>
                              acceptMediaNegotiation(negotiation.id, {
                                amount: negotiation.proposedAmount,
                              }),
                            "Offer accepted"
                          )
                        }
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Accept {money(negotiation.proposedAmount)}
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
                      disabled={pending}
                      onClick={() =>
                        run(
                          () => rejectMediaNegotiation(negotiation.id),
                          "Discount declined"
                        )
                      }
                    >
                      <XCircle className="h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </div>
              ) : null}

              {perspective === "CLIENT" && negotiation.status === "COUNTERED" ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="black"
                    className="rounded-full"
                    disabled={pending || negotiation.counterAmount == null}
                    onClick={() =>
                      run(
                        () =>
                          acceptMediaNegotiation(negotiation.id, {
                            amount: negotiation.counterAmount,
                          }),
                        "Counter accepted"
                      )
                    }
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Accept {money(negotiation.counterAmount)}
                  </Button>
                </div>
              ) : null}

              <div className="flex gap-2">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  className="rounded-xl"
                  placeholder="Write a message…"
                />
                <Button
                  type="button"
                  variant="black"
                  className="h-auto rounded-full px-4"
                  disabled={pending || !draft.trim()}
                  onClick={() => {
                    const text = draft.trim();
                    setDraft("");
                    run(() => sendMediaNegotiationMessage(negotiation.id, text));
                  }}
                >
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-t border-slate-100 px-4 py-4 text-sm text-slate-500 sm:px-5">
              This negotiation is {negotiation.status.toLowerCase()}.
              {negotiation.agreedAmount != null
                ? ` Agreed total: ${money(negotiation.agreedAmount)}.`
                : ""}
            </div>
          )}
        </section>

        <OfferSummary negotiation={negotiation} />
      </div>
    </PageShell>
  );
}

export function MediaNegotiateEmptyHint() {
  return (
    <div className={cn(clientCardClass, "px-5 py-10 text-center")}>
      <MessageSquare className="mx-auto h-6 w-6 text-slate-400" />
      <p className="mt-2 text-sm font-semibold text-slate-900">No negotiations yet</p>
      <p className="mt-1 text-sm text-slate-500">
        Open a booking and start a discount conversation with the station.
      </p>
    </div>
  );
}
