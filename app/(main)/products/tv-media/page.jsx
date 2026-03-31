"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tv,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Play,
  Mic,
  Star,
  Box,
  Film,
  Music,
  Megaphone,
  MessageCircle,
  LayoutPanelTop,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { getHeaderImage } from "@/lib/getHeaderImage";
import { getPublishedRateCards } from "@/actions/media-agency";
import { TV_AD_TYPES } from "@/lib/ad-types";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Station & Format" },
  { id: 2, label: "Dates" },
  { id: 3, label: "Airtimes & Spots" },
  { id: 4, label: "LPM" },
  { id: 5, label: "Repeat" },
  { id: 6, label: "Confirm" },
];

const AD_FORMAT_ICONS = {
  play: Play,
  mic: Mic,
  star: Star,
  box: Box,
  film: Film,
  music: Music,
  megaphone: Megaphone,
  "message-circle": MessageCircle,
  "layout-panel-top": LayoutPanelTop,
};

/** Display order for TV campaign scheduler — all TV ad formats */
const TV_AD_FORMAT_IDS = [
  "tvc",
  "lpm",
  "jingle",
  "sponsorship",
  "announcement",
  "interview",
  "product-placement",
  "documentary",
  "billboard",
];

function getTvAdFormatsForGrid() {
  const byId = Object.fromEntries(TV_AD_TYPES.map((t) => [t.id, t]));
  return TV_AD_FORMAT_IDS.map((id) => byId[id]).filter(Boolean);
}

export default function TVMediaPage() {
  const [rateCards, setRateCards] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [selectedAdFormatId, setSelectedAdFormatId] = useState(null);
  const headerImage = getHeaderImage("/products/tv-media");

  const tvAdFormats = useMemo(() => getTvAdFormatsForGrid(), []);

  useEffect(() => {
    getPublishedRateCards("TV").then((result) => {
      if (result.success && result.rateCards?.length) {
        setRateCards(result.rateCards);
      }
    });
  }, []);

  const selectedRateCard = useMemo(
    () => rateCards.find((r) => r.id === selectedStationId),
    [rateCards, selectedStationId]
  );

  const canProceedStep1 = selectedStationId && selectedAdFormatId;

  const rateCardHref =
    selectedRateCard && selectedAdFormatId
      ? `/rate-cards/${selectedRateCard.id}?adType=${selectedAdFormatId}`
      : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top nav */}
      <nav className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <Link
              href="/products"
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
            <div className="flex items-center gap-2">
              <Tv className="h-5 w-5 text-blue-400" />
              <span className="font-semibold text-white">TV Media</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero — compact */}
      <section className="relative h-40 sm:h-48 w-full overflow-hidden border-b border-slate-800">
        <img
          src={headerImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        <div className="relative h-full max-w-6xl mx-auto px-4 flex flex-col justify-end pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Television advertising
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Plan campaigns across Ghana TV networks with multi-slot booking and LPM support.
          </p>
        </div>
      </section>

      {/* Campaign Scheduler */}
      <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl shadow-black/40 p-6 sm:p-8 md:p-10">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Campaign Scheduler</h2>
              <p className="text-slate-400 text-sm mt-1.5 max-w-2xl">
                Multi-slot booking with LPM support. Select as many time slots and spot lengths as you need.
              </p>
            </div>

            {/* Stepper */}
            <div className="mb-10 overflow-x-auto pb-2">
              <div className="flex items-center justify-between min-w-[min(100%,640px)] gap-1 sm:gap-2">
                {STEPS.map((step, idx) => (
                  <div key={step.id} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div
                        className={cn(
                          "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-semibold transition-colors",
                          currentStep === step.id
                            ? "bg-blue-600 text-white ring-2 ring-blue-500/40"
                            : currentStep > step.id
                              ? "bg-slate-700 text-slate-200"
                              : "bg-slate-800 text-slate-500 border border-slate-700"
                        )}
                      >
                        {step.id}
                      </div>
                      <span
                        className={cn(
                          "mt-2 text-[10px] sm:text-xs text-center leading-tight max-w-[72px] sm:max-w-none",
                          currentStep === step.id ? "text-blue-400 font-medium" : "text-slate-500"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "h-px flex-1 min-w-[8px] mx-0.5 sm:mx-1 -mt-5 hidden sm:block",
                          currentStep > step.id ? "bg-blue-600/50" : "bg-slate-800"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Station & Format */}
            {currentStep === 1 && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
                    Choose station
                  </h3>
                  {rateCards.length === 0 ? (
                    <p className="text-slate-500 text-sm py-8 text-center border border-dashed border-slate-700 rounded-xl">
                      No TV rate cards available yet. Check back soon or contact a media agency.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      {rateCards.map((card) => (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => setSelectedStationId(card.id)}
                          className={cn(
                            "text-left rounded-xl border p-4 transition-all hover:border-slate-600",
                            selectedStationId === card.id
                              ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50"
                              : "border-slate-700 bg-slate-800/50 hover:bg-slate-800"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center justify-center rounded-md bg-blue-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
                              <Tv className="h-3 w-3 mr-0.5" />
                              TV
                            </span>
                          </div>
                          <p className="font-semibold text-white text-sm leading-snug">{card.title}</p>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {card.location || "Nationwide"}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-1">
                    Ad format
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    All formats: TVC, LPM, jingles, sponsorship, announcements, interviews, product placement, documentary, and billboards.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    {tvAdFormats.map((format) => {
                      const Icon = AD_FORMAT_ICONS[format.icon] || Play;
                      return (
                        <button
                          key={format.id}
                          type="button"
                          onClick={() => setSelectedAdFormatId(format.id)}
                          className={cn(
                            "text-left rounded-xl border p-4 transition-all hover:border-slate-600",
                            selectedAdFormatId === format.id
                              ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50"
                              : "border-slate-700 bg-slate-800/50 hover:bg-slate-800"
                          )}
                        >
                          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                            <Icon className="h-5 w-5" />
                          </div>
                          <p className="font-semibold text-white text-sm">{format.label}</p>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{format.fullName}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    disabled={!canProceedStep1}
                    onClick={() => setCurrentStep(2)}
                    className="rounded-full bg-blue-600 hover:bg-blue-500 text-white px-6 disabled:opacity-40"
                  >
                    Next: Choose Dates
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Dates (placeholder — extend later) */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Campaign dates</h3>
                <p className="text-slate-400 text-sm">
                  Set your preferred flight dates. Full calendar scheduling is coming soon; for now, continue to your
                  selected station&apos;s rate card to build your campaign.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 max-w-md">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Start date</label>
                    <Input type="date" className="bg-slate-800 border-slate-600 text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">End date</label>
                    <Input type="date" className="bg-slate-800 border-slate-600 text-white" />
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-600 text-slate-200 hover:bg-slate-800"
                    onClick={() => setCurrentStep(1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="rounded-full bg-blue-600 hover:bg-blue-500"
                    onClick={() => setCurrentStep(3)}
                  >
                    Next: Airtimes &amp; spots
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Steps 3–5: short placeholders */}
            {currentStep >= 3 && currentStep <= 5 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">
                  {STEPS[currentStep - 1].label}
                </h3>
                <p className="text-slate-400 text-sm">
                  This step will let you configure{" "}
                  {currentStep === 3
                    ? "airtimes and number of spots"
                    : currentStep === 4
                      ? "LPM (live programme mention) options"
                      : "repeat patterns for your campaign"}
                  . We&apos;re building this workflow — use your rate card for detailed pricing in the meantime.
                </p>
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-600 text-slate-200 hover:bg-slate-800"
                    onClick={() => setCurrentStep((s) => s - 1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="rounded-full bg-blue-600 hover:bg-blue-500"
                    onClick={() => setCurrentStep((s) => Math.min(6, s + 1))}
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 6: Confirm */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Confirm &amp; book</h3>
                <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 space-y-2 text-sm">
                  {selectedRateCard && (
                    <>
                      <p>
                        <span className="text-slate-500">Station: </span>
                        <span className="text-white font-medium">{selectedRateCard.title}</span>
                      </p>
                      {selectedRateCard.location && (
                        <p className="flex items-center gap-1 text-slate-400">
                          <MapPin className="h-3.5 w-3.5" />
                          {selectedRateCard.location}
                        </p>
                      )}
                    </>
                  )}
                  {selectedAdFormatId && (
                    <p>
                      <span className="text-slate-500">Ad format: </span>
                      <span className="text-white font-medium">
                        {tvAdFormats.find((t) => t.id === selectedAdFormatId)?.label}
                      </span>
                    </p>
                  )}
                </div>
                <p className="text-slate-400 text-sm">
                  Open the rate card to select spots, time classes, and complete your booking with the period calculator.
                </p>
                <div className="flex flex-wrap gap-3 justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-600 text-slate-200 hover:bg-slate-800"
                    onClick={() => setCurrentStep(5)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  {rateCardHref ? (
                    <Button asChild className="rounded-full bg-blue-600 hover:bg-blue-500">
                      <Link href={rateCardHref}>
                        Open rate card
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button disabled className="rounded-full opacity-50">
                      Select station &amp; format first
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Secondary: quick links to rate cards when step 1 not active or as reference */}
          {rateCards.length > 0 && currentStep === 1 && selectedStationId && selectedAdFormatId && (
            <p className="text-center text-xs text-slate-500 mt-6">
              Or skip ahead:{" "}
              <Link
                href={rateCardHref}
                className="text-blue-400 hover:underline"
              >
                go directly to {selectedRateCard?.title}&apos;s rate card
              </Link>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
