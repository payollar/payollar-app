"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductsChannelTopBar } from "@/components/products/products-channel-top-bar";
import {
  DIGITAL_QUOTE_DURATIONS,
  cacheDigitalPublisher,
  digitalLogoToneClass,
  digitalPublisherQuoteAdTypes,
  resolveDigitalPublisher,
} from "@/lib/demo-digital-marketplace";
import { startDigitalMarketplaceNegotiation } from "@/actions/media-negotiate";
import { cn } from "@/lib/utils";

function money(n) {
  return `GH₵${Number(n || 0).toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

function impressionsLabel(n, unit = "views") {
  const value = Number(n) || 0;
  if (value >= 1_000_000) return `Estimated ${(value / 1_000_000).toFixed(1)}M ${unit}`;
  if (value >= 1_000) return `Estimated ${Math.round(value / 1_000)}K ${unit}`;
  return `Estimated ${value.toLocaleString()} ${unit}`;
}

const fieldClass =
  "h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0055ff]/40 focus:ring-[3px] focus:ring-[#0055ff]/15";

function DigitalQuoteBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const publisherKey =
    searchParams.get("publisher") ||
    searchParams.get("listing") ||
    searchParams.get("demo") ||
    "";

  const [publisher, setPublisher] = useState(null);
  const [loadingPublisher, setLoadingPublisher] = useState(Boolean(publisherKey));
  const [adTypeId, setAdTypeId] = useState("");
  const [durationId, setDurationId] = useState("2w");
  const [impressions, setImpressions] = useState(100000);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!publisherKey) {
      setPublisher(null);
      setLoadingPublisher(false);
      return;
    }

    setLoadingPublisher(true);
    resolveDigitalPublisher(publisherKey).then((resolved) => {
      if (cancelled) return;
      if (resolved) cacheDigitalPublisher(resolved);
      setPublisher(resolved);
      setLoadingPublisher(false);
    });

    return () => {
      cancelled = true;
    };
  }, [publisherKey]);

  const adTypes = useMemo(
    () => digitalPublisherQuoteAdTypes(publisher),
    [publisher]
  );

  useEffect(() => {
    if (!adTypes.length) return;
    const fromQuery = searchParams.get("adType");
    const initial =
      adTypes.find((a) => a.id === fromQuery)?.id || adTypes[0].id;
    setAdTypeId(initial);
    const selected = adTypes.find((a) => a.id === initial) || adTypes[0];
    setImpressions(selected.defaultImpressions || 100000);
  }, [adTypes, searchParams]);

  const selectedAdType = adTypes.find((a) => a.id === adTypeId) || adTypes[0];
  const selectedDuration =
    DIGITAL_QUOTE_DURATIONS.find((d) => d.id === durationId) ||
    DIGITAL_QUOTE_DURATIONS[1];

  const weeklyRate = Number(selectedAdType?.weeklyRate) || 0;
  const weeks = Number(selectedDuration?.weeks) || 1;
  const estimatedTotal = weeklyRate * weeks;

  const impressionOptions = useMemo(() => {
    const base = Number(selectedAdType?.defaultImpressions) || 100000;
    const unit = selectedAdType?.unit || "views";
    return [
      { value: Math.round(base * 0.5), label: impressionsLabel(base * 0.5, unit) },
      { value: base, label: impressionsLabel(base, unit) },
      { value: Math.round(base * 1.5), label: impressionsLabel(base * 1.5, unit) },
      { value: Math.round(base * 2), label: impressionsLabel(base * 2, unit) },
    ];
  }, [selectedAdType]);

  useEffect(() => {
    if (!selectedAdType) return;
    setImpressions(selectedAdType.defaultImpressions || 100000);
  }, [selectedAdType?.id]);

  const negotiatePublisherParam = publisher?.isDemo
    ? String(publisher.id).replace(/^demo-/, "")
    : publisher?.id || publisherKey;

  const handleRequestQuote = async () => {
    if (!publisher || !selectedAdType) return;
    if (!adTypes.length) {
      toast.error("This publisher has no packages yet");
      return;
    }
    setSubmitting(true);

    const payload = {
      publisherId: publisher.id,
      publisherName: publisher.name,
      listingId: publisher.isDemo ? null : publisher.id,
      isDemo: Boolean(publisher.isDemo),
      adTypeId: selectedAdType.id,
      adTypeLabel: selectedAdType.label,
      packageId: selectedAdType.id,
      packageName: selectedAdType.label,
      durationId: selectedDuration.id,
      durationLabel: selectedDuration.label,
      weeks,
      weeklyRate,
      estimatedTotal,
      impressions,
      unit: selectedAdType.unit || "views",
      requestedAt: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem(
        `digital-quote:${publisher.id}`,
        JSON.stringify(payload)
      );
      cacheDigitalPublisher(publisher);
    } catch {
      /* ignore */
    }

    // Live listings → dashboard Messages negotiation (same as media cart)
    if (!publisher.isDemo) {
      try {
        const result = await startDigitalMarketplaceNegotiation(payload);
        if (result?.success && result?.href) {
          toast.message("Opening negotiation in Messages");
          router.push(result.href);
          return;
        }
        if (result?.error === "Unauthorized" || /unauthorized|sign in|client/i.test(result?.error || "")) {
          toast.error("Sign in as a client to negotiate in Messages");
          router.push(
            `/sign-in?redirect_url=${encodeURIComponent(
              `/products/digital-quote?publisher=${encodeURIComponent(publisher.id)}`
            )}`
          );
          return;
        }
        if (!result?.demo) {
          toast.error(result?.error || "Could not open Messages negotiation");
          setSubmitting(false);
          return;
        }
      } catch (error) {
        const message = error?.message || "";
        if (/unauthorized|sign in|client/i.test(message)) {
          toast.error("Sign in as a client to negotiate in Messages");
          router.push(
            `/sign-in?redirect_url=${encodeURIComponent(
              `/products/digital-quote?publisher=${encodeURIComponent(publisher.id)}`
            )}`
          );
          return;
        }
        toast.error("Could not open Messages negotiation");
        setSubmitting(false);
        return;
      }
    }

    // Demo publishers keep a local preview chat
    toast.message("Opening demo negotiation preview");
    router.push(
      `/products/digital-quote/negotiate?publisher=${encodeURIComponent(
        negotiatePublisherParam
      )}`
    );
  };

  if (loadingPublisher) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading publisher…
      </div>
    );
  }

  if (!publisher) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg font-semibold text-slate-950">Publisher not found</p>
        <p className="mt-2 text-sm text-slate-500">
          Pick a digital publisher from the marketplace to build a quote.
        </p>
        <Button asChild className="mt-6 rounded-full bg-slate-950 hover:bg-slate-800">
          <Link href="/products?type=DIGITAL">Back to Digital Media</Link>
        </Button>
      </div>
    );
  }

  const logoLabel =
    publisher.logoText ||
    String(publisher.name || "?")
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  return (
    <div className="pb-16">
      <ProductsChannelTopBar
        title="Build quote"
        backHref="/products?type=DIGITAL"
        backLabel="Digital marketplace"
        variant="light"
        showChannelLabel={false}
      />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Step 3 · Configure & request quote
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Build Your Quote
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Choose an ad unit and flight length to estimate your buy with{" "}
            {publisher.name}.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <div className="flex items-center gap-3.5 border-b border-slate-100 px-5 py-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold shadow-sm",
                digitalLogoToneClass(publisher.logoTone)
              )}
            >
              {logoLabel}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="font-semibold text-slate-950">{publisher.name}</p>
                {publisher.agency?.verificationStatus === "VERIFIED" ? (
                  <BadgeCheck className="h-4 w-4 text-sky-500" />
                ) : null}
              </div>
              <p className="text-sm text-slate-500">
                {(publisher.tags || []).join(" · ") || publisher.frequency}
              </p>
            </div>
          </div>

          {adTypes.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-semibold text-slate-950">
                No packages published yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                This media owner needs to add packages on Custom packages before
                you can request a quote.
              </p>
              <Button asChild className="mt-5 rounded-full bg-slate-950 hover:bg-slate-800">
                <Link href="/products?type=DIGITAL">Back to marketplace</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-5 px-5 py-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Ad Type / Package
                  </label>
                  <div className="relative">
                    <select
                      value={adTypeId}
                      onChange={(e) => setAdTypeId(e.target.value)}
                      className={fieldClass}
                    >
                      {adTypes.map((ad) => (
                        <option key={ad.id} value={ad.id}>
                          {ad.label}
                          {ad.durationHint ? ` (${ad.durationHint})` : ""}
                          {ad.weeklyRate
                            ? ` — ${money(ad.weeklyRate)}`
                            : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Duration
                  </label>
                  <div className="relative">
                    <select
                      value={durationId}
                      onChange={(e) => setDurationId(e.target.value)}
                      className={fieldClass}
                    >
                      {DIGITAL_QUOTE_DURATIONS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Quantity / Impressions
                  </label>
                  <div className="relative">
                    <select
                      value={impressions}
                      onChange={(e) => setImpressions(Number(e.target.value))}
                      className={fieldClass}
                    >
                      {impressionOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#0055ff]/15 bg-[#0055ff]/[0.06] px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#0055ff]/80">
                  Estimated quote
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 tabular-nums">
                  {money(estimatedTotal)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  ({money(weeklyRate)} × {weeks} week{weeks === 1 ? "" : "s"})
                </p>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    className="h-11 flex-1 rounded-full bg-[#0055ff] text-sm font-semibold text-white hover:bg-[#0044cc]"
                    disabled={submitting || !weeklyRate}
                    onClick={handleRequestQuote}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Requesting…
                      </>
                    ) : (
                      <>
                        Request quote
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-full border-slate-200 px-4 text-sm font-semibold"
                  >
                    <Link href="/products?type=DIGITAL">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Cancel
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <p className="mt-4 flex items-start gap-2 text-xs text-slate-500">
          <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          Request quote opens negotiation in Messages for live publishers (same
          inbox as your dashboard). Demo publishers use a preview chat only.
        </p>
      </div>
    </div>
  );
}

export default function DigitalQuotePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading quote builder…
        </div>
      }
    >
      <DigitalQuoteBuilder />
    </Suspense>
  );
}
