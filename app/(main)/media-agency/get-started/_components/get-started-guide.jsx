"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Compass,
  FileCheck,
  FileText,
  Inbox,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Package,
  Percent,
  ScrollText,
  Settings,
  Sparkles,
} from "lucide-react";
import { MediaAgencyPageShell } from "../../_components/media-agency-page-shell";
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

const PHASES = [
  {
    id: "setup",
    label: "Set up",
    title: "Make buyers able to find you",
    description:
      "Finish your profile, publish inventory, and choose how you sell — packages, rate tables, or both.",
    stepIds: ["settings", "custom-packages", "smart-rate-card", "terms"],
  },
  {
    id: "sell",
    label: "Sell",
    title: "Win work from the marketplace",
    description:
      "Quotes and bookings land here. Negotiate terms, then keep the conversation in Messages.",
    stepIds: ["requests", "negotiations", "messages", "campaigns"],
  },
  {
    id: "deliver",
    label: "Deliver",
    title: "Close the loop after airtime",
    description:
      "Upload proof of transmission and performance so clients trust the next booking.",
    stepIds: ["transmission", "reporting", "dashboard"],
  },
];

const STEPS = [
  {
    id: "settings",
    phase: "setup",
    icon: Settings,
    title: "Settings",
    href: "/media-agency/settings",
    cta: "Open settings",
    summary: "Your agency profile is the foundation of every listing.",
    why: "Buyers see your agency name, contact details, and location. Incomplete profiles block listings and look untrusted.",
    doThis: [
      "Confirm agency name, contact person, and email",
      "Add city / region so marketplace filters work",
      "Save before creating your first listing",
    ],
  },
  {
    id: "custom-packages",
    phase: "setup",
    icon: Package,
    title: "Custom packages",
    href: "/media-agency/rate-card",
    cta: "Add a listing",
    summary: "Create outlet listings and fixed packages that power Digital marketplace quotes.",
    why: "Each listing is a station, site, or publisher. Packages (price + duration + reach) show on the marketplace and feed Get Quote → Messages.",
    doThis: [
      "Add a listing for each outlet (TV, radio, digital, billboard…)",
      "Set status to Active when you want it discoverable",
      "Add at least one package buyers can request",
      "Upload a cover image for stronger marketplace cards",
    ],
    tip: "Digital packages are what clients pick when they click Get Quote on Media Buying.",
  },
  {
    id: "smart-rate-card",
    phase: "setup",
    icon: FileText,
    title: "Smart rate card",
    href: "/media-agency/smart-rate-card",
    cta: "Open rate cards",
    summary: "Build publishable pricing tables for stations that sell by row / spot.",
    why: "Use this when buyers need a full rate sheet — dayparts, durations, spot prices — not just a handful of packages.",
    doThis: [
      "Create or select a station listing",
      "Add sections and pricing tables",
      "Publish when the card is ready for buyers",
    ],
    tip: "Custom packages = fixed offers. Smart rate card = detailed tables. Many agencies use both.",
  },
  {
    id: "terms",
    phase: "setup",
    icon: ScrollText,
    title: "Terms & conditions",
    href: "/media-agency/terms",
    cta: "Edit terms",
    summary: "Set the standard commercial terms attached to your bookings.",
    why: "Clear cancellation, payment, and creative deadlines reduce back-and-forth later.",
    doThis: [
      "Write or paste your standard media terms",
      "Keep a version buyers can review during negotiation",
    ],
  },
  {
    id: "requests",
    phase: "sell",
    icon: Inbox,
    title: "Requests",
    href: "/media-agency/requests",
    cta: "View requests",
    summary: "Incoming booking requests from marketplace and rate-card flows.",
    why: "This is your inbox for paid interest. Pending requests need accept, decline, or negotiate.",
    doThis: [
      "Check Pending regularly",
      "Open a request to see package, dates, and client details",
      "Confirm, decline, or start a negotiation",
    ],
  },
  {
    id: "negotiations",
    phase: "sell",
    icon: Percent,
    title: "Negotiations",
    href: "/media-agency/negotiations",
    cta: "Open negotiations",
    summary: "Price and package discussions before a booking is locked.",
    why: "When a quote isn’t quite right, negotiate here — offers stay structured and linked to the booking.",
    doThis: [
      "Respond to client offers with a counter or accept",
      "Keep notes on agreed inventory and flight dates",
    ],
  },
  {
    id: "messages",
    phase: "sell",
    icon: MessageCircle,
    title: "Messages",
    href: "/messages",
    cta: "Open messages",
    summary: "Live chat threads with clients — including Digital Get Quote conversations.",
    why: "Marketplace quotes open a media message thread so you can clarify creatives, dates, and next steps.",
    doThis: [
      "Reply promptly when a Get Quote thread appears",
      "Point clients to Requests once commercial terms are clear",
    ],
  },
  {
    id: "campaigns",
    phase: "sell",
    icon: Megaphone,
    title: "Campaigns",
    href: "/media-agency/campaigns",
    cta: "View campaigns",
    summary: "Post talent / influencer campaigns when you need creators, not just airtime.",
    why: "If a client brief needs creators, run a campaign here and review applications separately from media bookings.",
    doThis: [
      "Create a campaign with brief, budget, and deliverables",
      "Review applications and shortlist talent",
    ],
  },
  {
    id: "transmission",
    phase: "deliver",
    icon: FileCheck,
    title: "Transmission certificates",
    href: "/media-agency/transmission-certificates",
    cta: "Upload a TC",
    summary: "Proof that spots or placements ran as booked.",
    why: "Clients and finance teams often need TCs before paying the final invoice.",
    doThis: [
      "Upload certificates against the right booking",
      "Keep files named clearly by campaign / flight",
    ],
  },
  {
    id: "reporting",
    phase: "deliver",
    icon: BarChart3,
    title: "Reporting",
    href: "/media-agency/reporting",
    cta: "Add a report",
    summary: "Post-campaign performance reports and delivery summaries.",
    why: "Good reporting wins renewals. Attach reach, impressions, or qualitative notes buyers can share internally.",
    doThis: [
      "Create a report linked to the campaign window",
      "Upload supporting PDFs or screenshots",
    ],
  },
  {
    id: "dashboard",
    phase: "deliver",
    icon: LayoutDashboard,
    title: "Dashboard",
    href: "/media-agency",
    cta: "Go to dashboard",
    summary: "Your daily snapshot — listings, pending requests, and recent activity.",
    why: "Start here when you log in. Use the numbers as a to-do list, then jump into the right workspace.",
    doThis: [
      "Scan pending requests first",
      "Use quick actions for packages or rate cards",
      "Come back to this guide anytime from the sidebar",
    ],
  },
];

export function GetStartedGuide() {
  const [activeId, setActiveId] = useState(STEPS[0].id);
  const [activePhase, setActivePhase] = useState(PHASES[0].id);

  const stepsById = useMemo(
    () => Object.fromEntries(STEPS.map((step) => [step.id, step])),
    []
  );

  useEffect(() => {
    const nodes = STEPS.map((step) => document.getElementById(`guide-${step.id}`)).filter(
      Boolean
    );
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (!top?.target?.id) return;
        const id = top.target.id.replace("guide-", "");
        const step = stepsById[id];
        if (!step) return;
        setActiveId(id);
        setActivePhase(step.phase);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.15, 0.35, 0.55] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [stepsById]);

  const scrollTo = (id) => {
    const el = document.getElementById(`guide-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <MediaAgencyPageShell
      eyebrow="Guide"
      title="Get started"
      description="A short tour of the media dashboard — what each page does, and the order that usually works."
    >
      <section className={cn(DASHBOARD_CARD_CLASS, "p-6 md:p-8")}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              <Compass className="h-3.5 w-3.5" />
              Media agency tour
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
              Sell inventory in three moves.
            </h2>
            <p className="text-sm leading-relaxed text-slate-500 md:text-[15px]">
              Set up what you sell, respond when buyers reach out, then prove delivery.
              Follow the path below — jump to any page when you’re ready.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/media-agency/settings"
              className="inline-flex h-10 items-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Start with settings
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/media-agency/rate-card"
              className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Add a listing
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {PHASES.map((phase, index) => {
            const active = activePhase === phase.id;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => {
                  setActivePhase(phase.id);
                  scrollTo(phase.stepIds[0]);
                }}
                className={cn(
                  "rounded-2xl bg-[#f7f8fc] p-4 text-left transition",
                  active
                    ? "bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                    : "hover:bg-white/80"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                      active
                        ? "bg-slate-950 text-white"
                        : "bg-white text-slate-500"
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {phase.label}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-950">{phase.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {phase.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className={cn(DASHBOARD_CARD_CLASS, "p-3")}>
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              On this page
            </p>
            <nav className="space-y-4">
              {PHASES.map((phase) => (
                <div key={phase.id}>
                  <p className="px-2 pb-1 text-xs font-semibold text-slate-500">
                    {phase.label}
                  </p>
                  <ul className="space-y-0.5">
                    {phase.stepIds.map((stepId) => {
                      const step = stepsById[stepId];
                      if (!step) return null;
                      const Icon = step.icon;
                      const active = activeId === step.id;
                      return (
                        <li key={step.id}>
                          <button
                            type="button"
                            onClick={() => scrollTo(step.id)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition",
                              active
                                ? "bg-slate-100 font-medium text-slate-950"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                            <span className="truncate">{step.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const active = activeId === step.id;
            return (
              <article
                key={step.id}
                id={`guide-${step.id}`}
                className={cn(
                  DASHBOARD_CARD_CLASS,
                  "scroll-mt-6 p-5 transition md:p-6",
                  active && "shadow-[0_12px_32px_rgba(15,23,42,0.07)]"
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          Step {index + 1}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          {PHASES.find((p) => p.id === step.phase)?.label}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-500">{step.summary}</p>
                    </div>
                  </div>
                  <Link
                    href={step.href}
                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    {step.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-[#f7f8fc] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Why it matters
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {step.why}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f7f8fc] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Do this
                    </p>
                    <ul className="mt-2 space-y-2">
                      {step.doThis.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-slate-600"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {step.tip ? (
                  <div className="mt-4 flex items-start gap-2 rounded-2xl bg-[#f7f8fc] px-4 py-3 text-sm text-slate-700">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                    <p>
                      <span className="font-semibold text-slate-950">Tip: </span>
                      {step.tip}
                    </p>
                  </div>
                ) : null}
              </article>
            );
          })}

          <section
            className={cn(
              DASHBOARD_CARD_CLASS,
              "flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
            )}
          >
            <div>
              <h3 className="text-base font-semibold text-slate-950">
                Ready to publish?
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Most agencies start with one Active digital listing and one package.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/media-agency/rate-card"
                className="inline-flex h-10 items-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Create custom package
              </Link>
              <Link
                href="/media-agency"
                className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back to dashboard
              </Link>
            </div>
          </section>
        </div>
      </div>
    </MediaAgencyPageShell>
  );
}
