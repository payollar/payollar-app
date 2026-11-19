"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductsChannelTopBar } from "@/components/products/products-channel-top-bar";
import {
  findBillboardSite,
  liveListingToBillboardSite,
} from "@/lib/demo-billboard-marketplace";
import { startBillboardMarketplaceNegotiation } from "@/actions/media-negotiate";

function money(n) {
  return `GH₵${Number(n || 0).toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

function loadQuote(siteId) {
  try {
    const raw = sessionStorage.getItem(`billboard-quote:${siteId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function BillboardNegotiateWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteKey = searchParams.get("site") || "";

  const demoSite = useMemo(() => findBillboardSite(siteKey), [siteKey]);
  const [liveSite, setLiveSite] = useState(null);
  const [loadingSite, setLoadingSite] = useState(!demoSite && Boolean(siteKey));
  const [quote, setQuote] = useState(null);
  const [offer, setOffer] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);

  const site = demoSite || liveSite;

  useEffect(() => {
    if (demoSite || !siteKey) {
      setLiveSite(null);
      setLoadingSite(false);
      return;
    }
    let cancelled = false;
    setLoadingSite(true);
    (async () => {
      try {
        const res = await fetch(`/api/media-listings/${siteKey}`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data?.listing) {
          setLiveSite(liveListingToBillboardSite(data.listing));
        } else {
          setLiveSite(null);
        }
      } catch {
        if (!cancelled) setLiveSite(null);
      } finally {
        if (!cancelled) setLoadingSite(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [demoSite, siteKey]);

  // Live billboards always negotiate in dashboard Messages
  useEffect(() => {
    if (!site || site.isDemo) return;
    let cancelled = false;

    (async () => {
      try {
        const stored = loadQuote(site.id) || {};
        const fallbackRate = site.rates?.[0];
        const result = await startBillboardMarketplaceNegotiation({
          listingId: site.id,
          siteId: site.id,
          isDemo: false,
          rateId: stored.rateId || fallbackRate?.id,
          rateLabel: stored.rateLabel || fallbackRate?.label,
          weeks: stored.weeks || fallbackRate?.weeks,
          total: stored.total || fallbackRate?.price || 0,
          startDate: stored.startDate,
          endDate: stored.endDate,
        });

        if (cancelled) return;
        if (result?.success && result?.href) {
          router.replace(result.href);
          return;
        }
        if (
          result?.error === "Unauthorized" ||
          /unauthorized|sign in|client/i.test(result?.error || "")
        ) {
          router.replace(
            `/sign-in?redirect_url=${encodeURIComponent(
              `/products/billboard-quote?site=${encodeURIComponent(site.id)}`
            )}`
          );
          return;
        }
        if (!result?.demo) {
          toast.error(result?.error || "Could not open Messages");
          router.replace(
            `/products/billboard-quote?site=${encodeURIComponent(site.id)}`
          );
        }
      } catch {
        if (!cancelled) {
          toast.error("Could not open Messages negotiation");
          router.replace(
            `/products/billboard-quote?site=${encodeURIComponent(site.id)}`
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [site, router]);

  useEffect(() => {
    if (!site || !site.isDemo) return;
    const stored = loadQuote(site.id);
    setQuote(stored);

    const total = stored?.total || 20000;
    const rateLabel = stored?.rateLabel || "1 month";

    setMessages([
      {
        id: "m1",
        from: "you",
        at: "11:02 AM",
        text: stored
          ? `Requesting ${site.name} for ${rateLabel} (${stored.startDate || "Dec 1"} – ${stored.endDate || "Dec 31"}). Quoted ${money(total)}. Can you improve the rate for a confirmed booking?`
          : `Hi, I'd like to negotiate outdoor rates for ${site.name}.`,
      },
    ]);

    const timer = setTimeout(() => {
      const discountPct = 8;
      const listTotal = total;
      const revisedTotal = Math.round(listTotal * (1 - discountPct / 100));

      setMessages((prev) => [
        ...prev,
        {
          id: "m2",
          from: "owner",
          at: "11:14 AM",
          text: `We can offer ${discountPct}% off for a confirmed ${rateLabel} booking. Revised total: ${money(revisedTotal)}.`,
        },
      ]);
      setOffer({
        rateLabel,
        listTotal,
        discountPct,
        total: revisedTotal,
        startDate: stored?.startDate,
        endDate: stored?.endDate,
        size: stored?.size || site.size,
      });
    }, 900);

    return () => clearTimeout(timer);
  }, [site]);

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
    if (!offer || !site) return;
    setAccepted(true);
    const booking = {
      ...quote,
      ...offer,
      siteId: site.id,
      siteName: site.name,
      location: site.location,
      acceptedAt: new Date().toISOString(),
    };
    try {
      sessionStorage.setItem(`billboard-booking:${site.id}`, JSON.stringify(booking));
    } catch {
      /* ignore */
    }
    toast.success("Offer accepted — continue to booking");
  };

  const counterOffer = () => {
    setDraft(
      `Thanks — could you do ${money(Math.round((offer?.total || 0) * 0.95))} for ${offer?.rateLabel || "1 month"}?`
    );
  };

  if (loadingSite || (site && !site.isDemo)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Opening Messages…
      </div>
    );
  }

  if (!site) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-slate-950">Site not found</p>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/products?type=BILLBOARD">Back to marketplace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <ProductsChannelTopBar
        title="Negotiate"
        backHref={`/products/billboard-quote?site=${encodeURIComponent(site.id)}`}
        backLabel="Back to quote"
        variant="light"
        showChannelLabel={false}
      />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Demo preview
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Negotiation with {site.owner?.name || "media owner"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{site.name}</p>
          <p className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
            Live billboards open your dashboard{" "}
            <Link href="/messages" className="font-semibold underline-offset-2 hover:underline">
              Messages
            </Link>{" "}
            chat when you’re signed in. This screen is a demo preview only.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              {(site.owner?.name || "MO")
                .split(/\s+/)
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-slate-950">
                  {site.owner?.name || "Media owner"}
                </p>
                <BadgeCheck className="h-4 w-4 text-sky-500" />
              </div>
              <p className="text-xs text-slate-500">Outdoor inventory</p>
            </div>
          </div>

          <div className="max-h-[22rem] space-y-3 overflow-y-auto bg-[#f7f8fc] px-4 py-4 sm:px-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={
                  msg.from === "you"
                    ? "ml-8 rounded-2xl rounded-br-md bg-slate-950 px-3.5 py-2.5 text-sm text-white"
                    : "mr-8 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800"
                }
              >
                <p>{msg.text}</p>
                <p
                  className={
                    msg.from === "you"
                      ? "mt-1 text-[10px] text-white/60"
                      : "mt-1 text-[10px] text-slate-400"
                  }
                >
                  {msg.at}
                </p>
              </div>
            ))}
          </div>

          {offer ? (
            <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Revised offer
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
                  {money(offer.total)}
                </p>
                <p className="mt-0.5 text-sm text-slate-600">
                  {offer.rateLabel} · {offer.discountPct}% off list (
                  {money(offer.listTotal)})
                </p>
              </div>

              {accepted ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Offer accepted
                  </div>
                  <Button
                    className="h-11 w-full rounded-full bg-slate-950 font-semibold hover:bg-slate-800"
                    onClick={() =>
                      router.push(
                        `/products/billboard-quote/booking?site=${encodeURIComponent(site.id)}`
                      )
                    }
                  >
                    Continue to booking
                  </Button>
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button
                    className="h-11 flex-1 rounded-full bg-slate-950 font-semibold hover:bg-slate-800"
                    onClick={acceptOffer}
                  >
                    Accept offer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-full border-slate-200 font-semibold"
                    onClick={counterOffer}
                  >
                    Counter
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
              Waiting for media owner reply…
            </div>
          )}

          <div className="flex gap-2 border-t border-slate-100 px-4 py-3 sm:px-5">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendDraft();
              }}
              placeholder="Type a message…"
              className="h-11 flex-1 rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-[#0055ff]/40 focus:ring-[3px] focus:ring-[#0055ff]/15"
            />
            <Button
              type="button"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-full bg-slate-950 hover:bg-slate-800"
              onClick={sendDraft}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BillboardNegotiatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading negotiation…
        </div>
      }
    >
      <BillboardNegotiateWorkspace />
    </Suspense>
  );
}
