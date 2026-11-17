"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Download,
  FileImage,
  Loader2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductsChannelTopBar } from "@/components/products/products-channel-top-bar";
import { findBillboardSite } from "@/lib/demo-billboard-marketplace";
import { cn } from "@/lib/utils";

function money(n) {
  return `GH₵${Number(n || 0).toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

function loadBooking(siteId) {
  try {
    const raw = sessionStorage.getItem(`billboard-booking:${siteId}`);
    if (raw) return JSON.parse(raw);
    const quote = sessionStorage.getItem(`billboard-quote:${siteId}`);
    return quote ? JSON.parse(quote) : null;
  } catch {
    return null;
  }
}

const STEPS = ["Quote", "Offer", "Booking", "Go Live"];

function BillboardBookingFlow() {
  const searchParams = useSearchParams();
  const siteKey = searchParams.get("site") || "";
  const site = useMemo(() => findBillboardSite(siteKey), [siteKey]);

  const [booking, setBooking] = useState(null);
  const [phase, setPhase] = useState("booking"); // booking | live | report
  const [creativeName, setCreativeName] = useState("");
  const [creativeApproved, setCreativeApproved] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [reportTab, setReportTab] = useState("proof");

  useEffect(() => {
    if (!site) return;
    setBooking(loadBooking(site.id));
  }, [site]);

  const stepIndex = phase === "booking" ? 2 : 3;

  const handleUpload = () => {
    setCreativeName("Payollar_Billboard_v1.jpg");
    setTimeout(() => {
      setCreativeApproved(true);
      toast.success("Creative marked approved (demo)");
    }, 400);
  };

  const confirmAndPay = async () => {
    if (!site) return;
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 700));
    setConfirming(false);
    setPhase("live");
    toast.success("Booking confirmed — site going live");
  };

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

  const amount = booking?.total || booking?.listTotal || 20000;
  const duration = booking?.rateLabel || "1 month";

  return (
    <div className="pb-16">
      <ProductsChannelTopBar
        title={phase === "booking" ? "Confirm booking" : "Proof & report"}
        backHref={`/products/billboard-quote/negotiate?site=${encodeURIComponent(site.id)}`}
        backLabel="Back to negotiate"
        variant="light"
        showChannelLabel={false}
      />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {phase === "booking"
              ? "Step 5 · Confirm, upload creative & go live"
              : "Step 6 · Proof of installation & report"}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {phase === "booking" ? "Confirm Booking" : "Installation Report"}
          </h1>
        </div>

        {/* Progress */}
        <div className="mb-6 flex items-center gap-1.5 sm:gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-full items-center justify-center rounded-full text-[10px] font-semibold sm:text-xs",
                  i <= stepIndex
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-400"
                )}
              >
                {i < stepIndex ? <Check className="h-3.5 w-3.5" /> : label}
              </div>
            </div>
          ))}
        </div>

        {phase === "booking" ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
            <div className="space-y-3 border-b border-slate-100 px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Booking summary
              </p>
              <dl className="grid gap-2 text-sm">
                {[
                  ["Site", site.name],
                  ["Size", booking?.size || site.size],
                  ["Duration", duration],
                  [
                    "Dates",
                    booking?.startDate && booking?.endDate
                      ? `${booking.startDate} → ${booking.endDate}`
                      : "Dec 1 – Dec 31, 2026",
                  ],
                  ["Amount", money(amount)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-semibold text-slate-950">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="px-5 py-5">
              <p className="text-sm font-semibold text-slate-950">
                Creatives & artwork
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Upload final artwork for production and install.
              </p>

              {creativeName ? (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <FileImage className="h-5 w-5 text-slate-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {creativeName}
                    </p>
                    {creativeApproved ? (
                      <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approved
                      </p>
                    ) : (
                      <p className="mt-0.5 text-xs text-slate-500">Reviewing…</p>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleUpload}
                  className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-100"
                >
                  <Upload className="h-5 w-5 text-slate-400" />
                  <span className="font-medium">Upload creative (demo)</span>
                </button>
              )}
            </div>

            <div className="border-t border-slate-100 px-5 py-4">
              <Button
                className="h-11 w-full rounded-full bg-slate-950 font-semibold hover:bg-slate-800"
                disabled={confirming || !creativeApproved}
                onClick={confirmAndPay}
              >
                {confirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming…
                  </>
                ) : (
                  "Confirm Booking & Pay"
                )}
              </Button>
              {!creativeApproved ? (
                <p className="mt-2 text-center text-xs text-slate-400">
                  Upload and approve creative to continue.
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                <p className="text-lg font-semibold text-emerald-950">
                  Billboard Live
                </p>
              </div>
              <p className="mt-1 text-sm text-emerald-800/90">
                Installed {booking?.startDate || "Dec 1, 2026"} · {site.name}
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
              <div className="flex gap-1 border-b border-slate-100 px-3 pt-3">
                {[
                  { id: "proof", label: "Proof of Posting" },
                  { id: "performance", label: "Performance / Impact" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setReportTab(tab.id)}
                    className={cn(
                      "rounded-t-lg px-3.5 py-2.5 text-sm font-semibold transition",
                      reportTab === tab.id
                        ? "border-b-2 border-slate-950 text-slate-950"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="px-5 py-5">
                {reportTab === "proof" ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500">
                      Visual evidence of the installed board (demo imagery).
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[1, 2].map((n) => (
                        <div
                          key={n}
                          className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={site.imageUrl || "/billboard.jpg"}
                            alt={`Proof ${n}`}
                            className="aspect-[4/3] w-full object-cover"
                          />
                          <p className="px-3 py-2 text-xs font-medium text-slate-600">
                            Proof photo {n} · day of install
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm text-slate-600">
                    <p>
                      Estimated daily traffic:{" "}
                      <span className="font-semibold text-slate-950">
                        {site.traffic || site.reach}
                      </span>
                    </p>
                    <p>
                      Campaign duration:{" "}
                      <span className="font-semibold text-slate-950">
                        {duration}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Full performance metrics connect when live posting data is
                      available from the media owner.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 px-5 py-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-full border-slate-200 font-semibold"
                  onClick={() => toast.success("Demo report download started")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Report (PDF)
                </Button>
                <Button
                  asChild
                  className="mt-2 h-11 w-full rounded-full bg-slate-950 font-semibold hover:bg-slate-800"
                >
                  <Link href="/products?type=BILLBOARD">
                    Back to marketplace
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BillboardBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading booking…
        </div>
      }
    >
      <BillboardBookingFlow />
    </Suspense>
  );
}
