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
    title: "Add what you sell",
    description: "Profile, listings, prices, and your booking terms.",
    stepIds: ["settings", "custom-packages", "smart-rate-card", "terms"],
  },
  {
    id: "sell",
    label: "Sell",
    title: "Handle buyer interest",
    description: "Requests, chats, price talks, and creator campaigns.",
    stepIds: ["requests", "negotiations", "messages", "campaigns"],
  },
  {
    id: "deliver",
    label: "Deliver",
    title: "Prove the work ran",
    description: "Certificates, reports, and your home overview.",
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
    summary: "Your agency profile — name, contact, and location.",
    for: "Update how your agency appears to buyers and keep contact details current.",
    doThis: [
      "Enter agency name and contact person",
      "Add email and city / region",
      "Save before you add listings",
    ],
  },
  {
    id: "custom-packages",
    phase: "setup",
    icon: Package,
    title: "Custom packages",
    href: "/media-agency/rate-card",
    cta: "Add a listing",
    summary: "List your media and set ready-made offers buyers can buy.",
    for: "Use this page to add a TV station, radio, website, or billboard, then attach simple packages (price, length, reach) that show on the Media marketplace.",
    doThis: [
      "Add one listing per outlet you sell",
      "Turn status to Active so buyers can see it",
      "Add a package with price and details",
      "Add a cover photo if you have one",
    ],
    tip: "Start with one listing and one package. You can add more later.",
  },
  {
    id: "smart-rate-card",
    phase: "setup",
    icon: FileText,
    title: "Smart rate card",
    href: "/media-agency/smart-rate-card",
    cta: "Open rate cards",
    summary: "Full price tables — for when one package is not enough.",
    for: "Use this when you sell many spots or dayparts and need a detailed rate sheet instead of a few fixed packages.",
    doThis: [
      "Pick or create the station listing",
      "Add your pricing rows / sections",
      "Publish when the card is ready",
    ],
    tip: "Packages = simple offers. Rate card = full price list. Use either or both.",
  },
  {
    id: "terms",
    phase: "setup",
    icon: ScrollText,
    title: "Terms & conditions",
    href: "/media-agency/terms",
    cta: "Edit terms",
    summary: "Your standard rules for bookings.",
    for: "Write payment, cancellation, and delivery rules so buyers know what they agree to.",
    doThis: [
      "Add your usual media terms",
      "Keep them updated when policies change",
    ],
  },
  {
    id: "requests",
    phase: "sell",
    icon: Inbox,
    title: "Requests",
    href: "/media-agency/requests",
    cta: "View requests",
    summary: "New booking requests from buyers.",
    for: "This is your booking inbox. Accept, decline, or negotiate each request.",
    doThis: [
      "Check Pending often",
      "Open a request to review details",
      "Accept, decline, or negotiate",
    ],
  },
  {
    id: "negotiations",
    phase: "sell",
    icon: Percent,
    title: "Negotiations",
    href: "/media-agency/negotiations",
    cta: "Open negotiations",
    summary: "Price talks before a booking is final.",
    for: "When a buyer wants a different price or package, handle the back-and-forth here.",
    doThis: [
      "Review the client’s offer",
      "Accept or send a counter",
    ],
  },
  {
    id: "messages",
    phase: "sell",
    icon: MessageCircle,
    title: "Messages",
    href: "/messages",
    cta: "Open messages",
    summary: "Chat with buyers about dates, creatives, and next steps.",
    for: "Answer questions in chat. When they are ready to book, the formal request still lives under Requests.",
    doThis: [
      "Reply when a new chat comes in",
      "Move to Requests when terms are clear",
    ],
  },
  {
    id: "campaigns",
    phase: "sell",
    icon: Megaphone,
    title: "Campaigns",
    href: "/media-agency/campaigns",
    cta: "View campaigns",
    summary: "Find creators / influencers for a brief.",
    for: "Use this only when you need talent — not for selling airtime or billboards.",
    doThis: [
      "Post a brief with budget and needs",
      "Review who applies",
    ],
  },
  {
    id: "transmission",
    phase: "deliver",
    icon: FileCheck,
    title: "Transmission certificates",
    href: "/media-agency/transmission-certificates",
    cta: "Upload a TC",
    summary: "Proof that the media ran.",
    for: "Upload certificates so clients can confirm spots or placements went live.",
    doThis: [
      "Upload the file for the right booking",
      "Name files clearly (campaign / dates)",
    ],
  },
  {
    id: "reporting",
    phase: "deliver",
    icon: BarChart3,
    title: "Reporting",
    href: "/media-agency/reporting",
    cta: "Add a report",
    summary: "Results after a campaign ends.",
    for: "Share performance notes, numbers, or PDFs with the client after delivery.",
    doThis: [
      "Create a report for that campaign",
      "Attach any supporting files",
    ],
  },
  {
    id: "dashboard",
    phase: "deliver",
    icon: LayoutDashboard,
    title: "Dashboard",
    href: "/media-agency",
    cta: "Go to dashboard",
    summary: "Your home screen when you log in.",
    for: "See listings, pending requests, and quick links to the rest of the dashboard.",
    doThis: [
      "Check pending requests first",
      "Jump to packages or rate cards as needed",
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
      description="Plain answers for what each page is for — and what to do first."
    >
      <section className={cn(DASHBOARD_CARD_CLASS, "p-6 md:p-8")}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              <Compass className="h-3.5 w-3.5" />
              Media agency guide
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
              What each page is for
            </h2>
            <p className="text-sm leading-relaxed text-slate-500 md:text-[15px]">
              Set up your agency, respond to buyers, then upload proof after the work runs.
              Skim a card below, then open that page when you’re ready.
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
                      What this page is for
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {step.for}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f7f8fc] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      What to do
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
                Not sure where to start?
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Add your profile in Settings, then create one listing with one package.
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
