"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductsChannelTopBar } from "@/components/products/products-channel-top-bar";
import {
  cacheDigitalPublisher,
  digitalLogoToneClass,
  resolveDigitalPublisher,
} from "@/lib/demo-digital-marketplace";
import { startDigitalMarketplaceNegotiation } from "@/actions/media-negotiate";
import { cn } from "@/lib/utils";

function money(n) {
  return `GH₵${Number(n || 0).toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

function loadQuote(publisherId) {
  try {
    const raw = sessionStorage.getItem(`digital-quote:${publisherId}`);
    if (!raw) {
      const alt = sessionStorage.getItem(`digital-quote:demo-${publisherId}`);
      return alt ? JSON.parse(alt) : null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function DigitalNegotiateWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const publisherKey =
    searchParams.get("publisher") ||
    searchParams.get("listing") ||
    searchParams.get("demo") ||
    "";

  const [publisher, setPublisher] = useState(null);
  const [loadingPublisher, setLoadingPublisher] = useState(Boolean(publisherKey));
  const [quote, setQuote] = useState(null);
  const [offer, setOffer] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let cancelled = false;
    if (!publisherKey) {
      setPublisher(null);
      setLoadingPublisher(false);
      return;
    }

    setLoadingPublisher(true);
    resolveDigitalPublisher(publisherKey).then(async (resolved) => {
      if (cancelled) return;
      if (resolved) cacheDigitalPublisher(resolved);

      // Live listings should negotiate in the dashboard Messages inbox
      if (resolved && !resolved.isDemo) {
        try {
          let quotePayload = null;
          try {
            const raw =
              sessionStorage.getItem(`digital-quote:${resolved.id}`) ||
              sessionStorage.getItem(
                `digital-quote:demo-${resolved.id}`
              );
            quotePayload = raw ? JSON.parse(raw) : null;
          } catch {
            /* ignore */
          }

          const result = await startDigitalMarketplaceNegotiation({
            listingId: resolved.id,
            isDemo: false,
            packageId: quotePayload?.adTypeId || quotePayload?.packageId,
            packageName:
              quotePayload?.adTypeLabel || quotePayload?.packageName,
            adTypeId: quotePayload?.adTypeId,
            adTypeLabel: quotePayload?.adTypeLabel,
            durationLabel: quotePayload?.durationLabel || "2 weeks",
            weeks: quotePayload?.weeks || 2,
            weeklyRate: quotePayload?.weeklyRate || 0,
            estimatedTotal:
              quotePayload?.estimatedTotal ||
              (Number(quotePayload?.weeklyRate) || 0) *
                (Number(quotePayload?.weeks) || 2),
            impressions: quotePayload?.impressions,
          });

          if (!cancelled && result?.success && result?.href) {
            router.replace(result.href);
            return;
          }
          if (
            !cancelled &&
            (result?.error === "Unauthorized" ||
              /unauthorized|sign in|client/i.test(result?.error || ""))
          ) {
            router.replace(
              `/sign-in?redirect_url=${encodeURIComponent(
                `/products/digital-quote?publisher=${encodeURIComponent(resolved.id)}`
              )}`
            );
            return;
          }
        } catch {
          /* fall through to local preview if Messages handoff fails */
        }
      }

      if (cancelled) return;
      setPublisher(resolved);
      setLoadingPublisher(false);
    });

    return () => {
      cancelled = true;
    };
  }, [publisherKey, router]);

  useEffect(() => {
    if (!publisher) return;
    const stored =
      loadQuote(publisher.id) ||
      loadQuote(publisher.id.replace(/^demo-/, ""));
    setQuote(stored);
    setOffer(null);
    setAccepted(false);

    const weeks = stored?.weeks || 2;
    const weekly = stored?.weeklyRate || 4500;
    const total = stored?.estimatedTotal || weekly * weeks;

    const opener = stored
      ? `Your request: ${stored.adTypeLabel} for ${stored.durationLabel}. Estimated: ${money(total)}. Can you offer a discount for a 4-week campaign?`
      : `Hi ${publisher.name}, I'd like to discuss digital inventory rates.`;

    setMessages([
      {
        id: "m1",
        from: "you",
        at: "10:24 AM",
        text: opener,
      },
    ]);

    const timer = setTimeout(() => {
      const revisedWeeks = 4;
      const listTotal = weekly * revisedWeeks;
      const discountPct = 10;
      const revisedTotal = Math.round(listTotal * (1 - discountPct / 100));

      setMessages((prev) => [
        ...prev,
        {
          id: "m2",
          from: "owner",
          at: "10:36 AM",
          text: `Yes, we can offer ${discountPct}% for ${revisedWeeks} weeks. Revised total: ${money(revisedTotal)} (${money(listTotal)} → ${discountPct}% discount).`,
        },
      ]);
      setOffer({
        weeks: revisedWeeks,
        durationLabel: `${revisedWeeks} weeks`,
        listTotal,
        discountPct,
        total: revisedTotal,
        weeklyRate: weekly,
        adTypeLabel: stored?.adTypeLabel || "Digital placement",
      });
    }, 900);

    return () => clearTimeout(timer);
  }, [publisher]);

  const logoLabel =
    publisher?.logoText ||
    String(publisher?.name || "?")
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const quoteBackParam = publisher?.isDemo
    ? String(publisher.id).replace(/^demo-/, "")
    : publisher?.id || publisherKey;

  const sendDraft = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        from: "you",
        at: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        text,
      },
    ]);
    setDraft("");
  };

  const acceptOffer = () => {
    if (!offer) return;
    setAccepted(true);
    toast.success("Offer accepted — ready for booking");
  };

  const counterOffer = () => {
    setDraft(
      `Thanks — could you do ${money(Math.round((offer?.total || 0) * 0.95))} for ${offer?.durationLabel || "4 weeks"}?`
    );
  };

  if (loadingPublisher) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Opening negotiation…
      </div>
    );
  }

  if (!publisher) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-slate-950">Publisher not found</p>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/products?type=DIGITAL">Back to marketplace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <ProductsChannelTopBar
        title="Negotiate"
        backHref={`/products/digital-quote?publisher=${encodeURIComponent(
          quoteBackParam
        )}`}
        backLabel="Back to quote"
        variant="light"
        showChannelLabel={false}
      />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Step 4 · Negotiate & accept offer
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Negotiation with {publisher.name}
          </h1>
          {publisher.isDemo ? (
            <p className="mt-2 rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
              Demo preview only. Live Digital listings open negotiation in your{" "}
              <Link href="/messages" className="font-semibold underline-offset-2 hover:underline">
                Messages
              </Link>{" "}
              inbox with the media owner.
            </p>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold",
                digitalLogoToneClass(publisher.logoTone)
              )}
            >
              {logoLabel}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-slate-950">{publisher.name}</p>
                {publisher.agency?.verificationStatus === "VERIFIED" ? (
                  <BadgeCheck className="h-4 w-4 text-sky-500" />
                ) : null}
              </div>
              <p className="text-xs text-slate-500">
                {publisher.isDemo ? "Demo media owner · preview chat" : "Media owner"}
              </p>
            </div>
          </div>

          <div className="max-h-[22rem] space-y-3 overflow-y-auto bg-[#f7f8fc] px-4 py-4 sm:px-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.from === "you" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                    msg.from === "you"
                      ? "rounded-br-md bg-white text-slate-800"
                      : "rounded-bl-md bg-[#0055ff] text-white"
                  )}
                >
                  <p>{msg.text}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      msg.from === "you" ? "text-slate-400" : "text-white/70"
                    )}
                  >
                    {msg.at}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {offer ? (
            <div className="border-t border-slate-100 px-5 py-4">
              <div className="rounded-2xl border border-[#0055ff]/20 bg-[#0055ff]/[0.05] p-4">
                <span className="inline-flex rounded-full bg-[#0055ff] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Offer from media owner
                </span>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">Placement</p>
                    <p className="font-medium text-slate-900">{offer.adTypeLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Duration</p>
                    <p className="font-medium text-slate-900">{offer.durationLabel}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-slate-500">Total amount</p>
                    <p className="text-2xl font-semibold tabular-nums text-slate-950">
                      {money(offer.total)}
                    </p>
                    <p className="text-xs text-slate-500">
                      List {money(offer.listTotal)} · {offer.discountPct}% off
                    </p>
                  </div>
                </div>

                {accepted ? (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">
                    <CheckCircle2 className="h-4 w-4" />
                    Offer accepted. Next: confirm booking with the publisher.
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      className="h-11 flex-1 rounded-full bg-[#0055ff] font-semibold text-white hover:bg-[#0044cc]"
                      onClick={acceptOffer}
                    >
                      Accept Offer
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 flex-1 rounded-full border-[#0055ff]/30 font-semibold text-[#0055ff] hover:bg-[#0055ff]/5"
                      onClick={counterOffer}
                    >
                      Counter Offer
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
              Waiting for {publisher.name} to reply…
            </div>
          )}

          <div className="flex gap-2 border-t border-slate-100 px-4 py-3 sm:px-5">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendDraft();
                }
              }}
              placeholder="Write a message…"
              className="h-11 flex-1 rounded-full border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#0055ff]/40 focus:ring-[3px] focus:ring-[#0055ff]/15"
              disabled={accepted}
            />
            <Button
              type="button"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-full bg-slate-950 hover:bg-slate-800"
              onClick={sendDraft}
              disabled={accepted || !draft.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full border-slate-200">
            <Link href="/products?type=DIGITAL">Back to marketplace</Link>
          </Button>
          {accepted ? (
            <Button
              type="button"
              className="rounded-full bg-slate-950 hover:bg-slate-800"
              onClick={() => router.push("/products?type=DIGITAL")}
            >
              Done
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function DigitalNegotiatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Opening negotiation…
        </div>
      }
    >
      <DigitalNegotiateWorkspace />
    </Suspense>
  );
}
