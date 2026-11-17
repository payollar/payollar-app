"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Calendar,
  ChevronDown,
  Loader2,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductsChannelTopBar } from "@/components/products/products-channel-top-bar";
import { findBillboardSite } from "@/lib/demo-billboard-marketplace";

function money(n) {
  return `GH₵${Number(n || 0).toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

const fieldClass =
  "h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0055ff]/40 focus:ring-[3px] focus:ring-[#0055ff]/15";

function BillboardQuoteBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteKey = searchParams.get("site") || searchParams.get("demo") || "";

  const site = useMemo(() => findBillboardSite(siteKey), [siteKey]);
  const rates = site?.rates || [];

  const [rateId, setRateId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!rates.length) return;
    const fromQuery = searchParams.get("rate");
    const initial =
      rates.find((r) => r.id === fromQuery)?.id ||
      rates.find((r) => r.weeks === 4)?.id ||
      rates[0].id;
    setRateId(initial);
  }, [rates, searchParams]);

  useEffect(() => {
    if (!site?.availability) return;
    setStartDate(site.availability.from || "2026-12-01");
    setEndDate(site.availability.to || "2026-12-31");
  }, [site]);

  const selectedRate = rates.find((r) => r.id === rateId) || rates[0];
  const total = Number(selectedRate?.price) || 0;

  const handleRequestQuote = async () => {
    if (!site || !selectedRate) return;
    setSubmitting(true);

    const payload = {
      siteId: site.id,
      siteName: site.name,
      location: site.location,
      size: site.size,
      boardType: site.boardType,
      rateId: selectedRate.id,
      rateLabel: selectedRate.label,
      weeks: selectedRate.weeks,
      total,
      startDate,
      endDate,
      requestedAt: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem(`billboard-quote:${site.id}`, JSON.stringify(payload));
    } catch {
      /* ignore */
    }

    await new Promise((r) => setTimeout(r, 450));
    toast.success("Quote requested — opening negotiation");
    router.push(
      `/products/billboard-quote/negotiate?site=${encodeURIComponent(site.id)}`
    );
  };

  if (!site) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg font-semibold text-slate-950">Site not found</p>
        <p className="mt-2 text-sm text-slate-500">
          Pick a billboard from the marketplace to build a quote.
        </p>
        <Button asChild className="mt-6 rounded-full bg-slate-950 hover:bg-slate-800">
          <Link href="/products?type=BILLBOARD">Back to marketplace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <ProductsChannelTopBar
        title="Build quote"
        backHref={`/products/billboard/${site.id}`}
        backLabel="Back to site"
        variant="light"
        showChannelLabel={false}
      />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Step 3 · Check availability & build quote
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Build Quote & Negotiate
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Confirm duration and campaign dates, then request a quote from the media owner.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <div className="flex items-start gap-3.5 border-b border-slate-100 px-5 py-4">
            <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={site.imageUrl || "/billboard.jpg"}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="font-semibold text-slate-950">{site.name}</p>
                {site.owner?.verificationStatus === "VERIFIED" ? (
                  <BadgeCheck className="h-4 w-4 text-sky-500" />
                ) : null}
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {site.location}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {[site.size, site.boardType].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          <div className="space-y-5 px-5 py-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Location</label>
              <input
                readOnly
                value={`${site.name} Billboard`}
                className={cnReadonly(fieldClass)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Duration</label>
              <div className="relative">
                <select
                  value={rateId}
                  onChange={(e) => setRateId(e.target.value)}
                  className={fieldClass}
                >
                  {rates.map((rate) => (
                    <option key={rate.id} value={rate.id}>
                      {rate.label} — {money(rate.price)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Campaign start
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={fieldClass}
                  />
                  <Calendar className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Campaign end
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={fieldClass}
                  />
                  <Calendar className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total amount
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 tabular-nums">
              {money(total)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {selectedRate?.label}
              {startDate && endDate ? ` · ${startDate} → ${endDate}` : ""}
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="h-11 flex-1 rounded-full bg-slate-950 text-sm font-semibold text-white hover:bg-slate-800"
                disabled={submitting || !total}
                onClick={handleRequestQuote}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Requesting…
                  </>
                ) : (
                  <>
                    Request Quote / Negotiate
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-slate-200 px-4 text-sm font-semibold"
              >
                <Link href={`/products/billboard/${site.id}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-4 flex items-start gap-2 text-xs text-slate-500">
          <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          After you request a quote, you can negotiate rate and dates with the media owner.
        </p>
      </div>
    </div>
  );
}

function cnReadonly(base) {
  return `${base} bg-slate-50 text-slate-700`;
}

export default function BillboardQuotePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading quote builder…
        </div>
      }
    >
      <BillboardQuoteBuilder />
    </Suspense>
  );
}
