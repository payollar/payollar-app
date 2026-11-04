"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, differenceInCalendarDays, isPast } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  Gift,
  HelpCircle,
  ListChecks,
  MapPin,
  Megaphone,
  MessageSquare,
  Package,
  Rocket,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import { siFacebook, siInstagram, siTiktok, siX, siYoutube } from "simple-icons";
import { campaignCategoryLabel } from "@/lib/campaign-categories";
import { formatFollowerRange } from "@/lib/campaign-followers";
import { campaignPlaceLabel } from "@/lib/campaign-places";
import { CampaignApplyDialog } from "@/components/campaigns/campaign-apply-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { id: "tiktok", label: "TikTok", icon: siTiktok, pattern: /tik\s?tok/i },
  { id: "instagram", label: "Instagram", icon: siInstagram, pattern: /instagram|\binsta\b/i },
  { id: "youtube", label: "YouTube", icon: siYoutube, pattern: /youtube|youtu\.be/i },
  { id: "facebook", label: "Facebook", icon: siFacebook, pattern: /facebook/i },
  { id: "x", label: "X", icon: siX, pattern: /twitter|\bx\.com\b/i },
];

const TABS = [
  { id: "overview", label: "Overview", full: "Campaign Overview", icon: Megaphone },
  { id: "deliverables", label: "Deliverables", full: "Deliverables", icon: Package },
  { id: "requirements", label: "Requirements", full: "Requirements", icon: ListChecks },
  { id: "rewards", label: "Rewards", full: "Rewards & Benefits", icon: Gift },
  { id: "faqs", label: "FAQs", full: "FAQs", icon: HelpCircle },
];

function campaignHaystack(campaign) {
  return [
    campaign.title,
    campaign.description,
    campaign.category,
    campaign.subcategory,
    ...(campaign.requirements || []),
  ]
    .filter(Boolean)
    .join(" ");
}

function campaignPlatforms(campaign) {
  const text = campaignHaystack(campaign);
  return PLATFORMS.filter((platform) => platform.pattern.test(text));
}

function PlatformGlyph({ icon, className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      style={{ color: `#${icon.hex}` }}
    >
      <path fill="currentColor" d={icon.path} />
    </svg>
  );
}

function asMoney(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function money(value) {
  return value.toLocaleString("en-GH");
}

function formatBudget(campaign) {
  const min = asMoney(campaign.budgetMin);
  const max = asMoney(campaign.budgetMax);
  if (min != null && max != null) return `GH₵ ${money(min)} – ${money(max)}`;
  if (min != null) return `From GH₵ ${money(min)}`;
  if (max != null) return `Up to GH₵ ${money(max)}`;
  return "Budget not set";
}

function paymentHighlight(campaign) {
  const min = asMoney(campaign.budgetMin);
  const max = asMoney(campaign.budgetMax);
  const note = campaign.paymentNote?.trim() || null;
  if (min != null && max != null && min === max) {
    return { primary: `GH₵ ${money(min)}`, secondary: note || "Listed budget" };
  }
  if (min != null && max != null) {
    return {
      primary: `GH₵ ${money(min)} – ${money(max)}`,
      secondary: note || "Budget range",
    };
  }
  if (max != null) {
    return { primary: `Up to GH₵ ${money(max)}`, secondary: note || "Budget cap" };
  }
  if (min != null) {
    return { primary: `From GH₵ ${money(min)}`, secondary: note || "Starting budget" };
  }
  return { primary: "Discuss with brand", secondary: note || "Budget not listed" };
}

function deliverableLines(campaign, platforms) {
  if (campaign.deliverables?.length) {
    return campaign.deliverables.filter(Boolean);
  }
  const lines = [];
  if (campaign.subcategory) lines.push(campaign.subcategory);
  if (campaign.category && campaign.category !== campaign.subcategory) {
    lines.push(`${campaignCategoryLabel(campaign)} campaign`);
  }
  platforms.forEach((platform) => {
    lines.push(`${platform.label} content`);
  });
  if (lines.length === 0) {
    lines.push("Confirm deliverables with the brand if selected");
  }
  return [...new Set(lines)].slice(0, 4);
}

function objectiveData(campaign) {
  if (campaign.objectives?.length) {
    return {
      title: "Campaign Objectives",
      items: campaign.objectives.filter(Boolean),
    };
  }
  if (campaign.requirements?.length) {
    return {
      title: "Campaign Objectives",
      items: campaign.requirements.filter(Boolean),
    };
  }
  return {
    title: "How to apply",
    items: [
      "Review the brief and apply with your best-fit pitch",
      "Share portfolio or social links the brand can open",
      "Confirm you can meet the deadline and location needs",
    ],
  };
}

function benefitLines(campaign) {
  if (campaign.benefits?.length) {
    return campaign.benefits.filter(Boolean);
  }
  return [
    `Work with ${campaign.brand || "the brand"} on a live brief`,
    "Apply from your Payollar creator profile",
    "Budget and deadline are listed on this campaign",
    campaign.location
      ? `Location listed as ${campaignPlaceLabel(campaign)}`
      : "Clear brief details before you apply",
  ];
}

function faqItems(campaign) {
  const custom = Array.isArray(campaign.faqs)
    ? campaign.faqs
        .map((item) => ({
          q: String(item?.question || item?.q || "").trim(),
          a: String(item?.answer || item?.a || "").trim(),
        }))
        .filter((item) => item.q && item.a)
    : [];

  if (custom.length) return custom;

  const followerRange = formatFollowerRange(campaign);
  return [
    {
      q: "Who can apply?",
      a: followerRange
        ? `Verified creators on Payollar in the ${followerRange} range can submit an application for this active campaign.`
        : "Verified creators on Payollar can submit an application for this active campaign.",
    },
    {
      q: "What should my application include?",
      a: "Your profile details, portfolio or social links, relevant experience, and your proposed rate if you have one.",
    },
    {
      q: "When is the deadline?",
      a: `Applications close on ${format(new Date(campaign.deadline), "MMMM d, yyyy 'at' h:mm a")}.`,
    },
    {
      q: "How do I get selected?",
      a: "The brand reviews applications on Payollar and follows up with creators they want to move forward with.",
    },
  ];
}

function CampaignArt({ title }) {
  const letter = (title || "C").trim().charAt(0).toUpperCase() || "C";
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#4c1d95] to-[#6d28d9]">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute bottom-6 left-6 text-5xl font-semibold text-white/75">
        {letter}
      </div>
    </div>
  );
}

function SectionHeading({ icon: Icon, children, aside }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f3e8ff] text-[#6d28d9]">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          {children}
        </h2>
      </div>
      {aside}
    </div>
  );
}

function HighlightCard({ icon: Icon, label, children }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-100 bg-[#f8f7fc] p-4 transition hover:border-violet-200 hover:bg-white hover:shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#6d28d9] shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <div className="mt-2 flex-1 text-sm font-medium text-slate-800">{children}</div>
    </div>
  );
}

export function CampaignDetailClient({ campaign, creatorProfile = null }) {
  const [applyOpen, setApplyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const canUseProfile = Boolean(creatorProfile?.ready);

  const platforms = useMemo(() => campaignPlatforms(campaign), [campaign]);
  const objectives = useMemo(() => objectiveData(campaign), [campaign]);
  const deliverables = useMemo(
    () => deliverableLines(campaign, platforms),
    [campaign, platforms]
  );
  const benefits = useMemo(() => benefitLines(campaign), [campaign]);
  const faqs = useMemo(() => faqItems(campaign), [campaign]);
  const payment = useMemo(() => paymentHighlight(campaign), [campaign]);
  const followerRange = useMemo(() => formatFollowerRange(campaign), [campaign]);

  const deadline = new Date(campaign.deadline);
  const createdAt = new Date(campaign.createdAt);
  const closed = isPast(deadline);
  const daysLeft = differenceInCalendarDays(deadline, new Date());

  const timeline = [
    {
      id: 1,
      label: "Apply",
      detail: closed ? "Closed" : "Open now",
      date: format(createdAt, "MMM d"),
      active: !closed,
    },
    {
      id: 2,
      label: "Selection",
      detail: "Brand reviews",
      date: "Next",
      active: false,
    },
    {
      id: 3,
      label: "Create",
      detail: "If selected",
      date: "Then",
      active: false,
    },
    {
      id: 4,
      label: "Publish",
      detail: "Wrap up",
      date: format(deadline, "MMM d"),
      active: false,
    },
  ];

  useEffect(() => {
    const observers = TABS.map((tab) => {
      const el = document.getElementById(tab.id);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveTab(tab.id);
        },
        { rootMargin: "-28% 0px -55% 0px", threshold: 0.05 }
      );
      observer.observe(el);
      return observer;
    }).filter(Boolean);

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  const scrollToTab = (id) => {
    setActiveTab(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const deadlineHint = closed
    ? "Applications closed"
    : daysLeft === 0
      ? "Closes today"
      : daysLeft === 1
        ? "1 day left"
        : `${daysLeft} days left`;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 sm:px-6 lg:px-8 lg:pb-20">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-[#6d28d9]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to campaigns
        </Link>
        {closed ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            <Clock3 className="h-3.5 w-3.5" />
            Closed for applications
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Open · {deadlineHint}
          </span>
        )}
      </div>

      {/* Hero */}
      <section className="overflow-hidden rounded-[1.75rem] bg-[#120f2d] shadow-[0_24px_60px_-28px_rgba(15,23,42,0.45)]">
        <div className="relative min-h-[15rem] sm:min-h-[17rem] lg:min-h-[19rem]">
          {campaign.imageUrl ? (
            <Image
              src={campaign.imageUrl}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 1152px"
              priority
            />
          ) : (
            <CampaignArt title={campaign.brand || campaign.title} />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#120f2d] via-[#120f2d]/78 to-[#120f2d]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120f2d]/70 via-transparent to-transparent" />
          <div className="relative flex h-full min-h-[15rem] flex-col justify-end p-5 sm:min-h-[17rem] sm:p-8 lg:min-h-[19rem] lg:p-10">
            <p className="text-sm font-medium text-violet-200/90">{campaign.brand}</p>
            <h1 className="mt-1.5 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {campaign.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {campaign.category ? (
                <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {campaignCategoryLabel(campaign)}
                </span>
              ) : null}
              {platforms.map((platform) => (
                <span
                  key={platform.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-xs text-white backdrop-blur-sm"
                >
                  <PlatformGlyph icon={platform.icon} className="h-3.5 w-3.5" />
                  {platform.label}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-xs text-white backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5" />
                {campaignPlaceLabel(campaign)}
              </span>
              {followerRange ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-xs text-white backdrop-blur-sm">
                  <Users className="h-3.5 w-3.5" />
                  {followerRange}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Key facts strip */}
        <div className="grid grid-cols-2 border-t border-white/10 divide-x divide-white/10 sm:grid-cols-4">
          {[
            { label: "Budget", value: formatBudget(campaign), icon: Wallet },
            {
              label: "Deadline",
              value: format(deadline, "MMM d, yyyy"),
              icon: Clock3,
            },
            {
              label: followerRange ? "Followers" : "Applicants",
              value: followerRange || String(campaign.applicants || 0),
              icon: Users,
            },
            {
              label: "Location",
              value: campaignPlaceLabel(campaign),
              icon: MapPin,
            },
          ].map((fact) => (
            <div key={fact.label} className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
              <fact.icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {fact.label}
                </p>
                <p className="truncate text-sm font-semibold text-white">{fact.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-[4.5rem] z-30 mt-5 md:top-[5.25rem]">
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-sm backdrop-blur-md [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max min-w-full gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => scrollToTab(tab.id)}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-[#6d28d9] text-white shadow-md shadow-violet-500/20"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="sm:hidden">{tab.label}</span>
                  <span className="hidden sm:inline">{tab.full}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-7">
        <div className="min-w-0 space-y-5">
          {/* Overview */}
          <section
            id="overview"
            className="scroll-mt-36 rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7"
          >
            <SectionHeading
              icon={Megaphone}
              aside={
                <p
                  className="hidden max-w-[8.5rem] text-right text-base leading-tight text-[#7c3aed]/75 lg:block"
                  style={{ fontFamily: "var(--font-handwriting), cursive" }}
                  aria-hidden
                >
                  Let&apos;s create together!
                </p>
              }
            >
              About This Campaign
            </SectionHeading>

            <p className="max-w-3xl text-base leading-7 text-slate-600 sm:text-[1.05rem] sm:leading-8">
              {campaign.description}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <HighlightCard icon={Package} label="Deliverables">
                <ul className="space-y-1">
                  {deliverables.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </HighlightCard>
              <HighlightCard icon={Users} label="Target audience">
                <p className="text-base font-semibold text-slate-950">
                  {campaign.targetAudience?.trim() ||
                    followerRange ||
                    campaignPlaceLabel(campaign)}
                </p>
                <p className="mt-1 text-xs font-normal text-slate-500">
                  {campaign.targetAudience?.trim()
                    ? followerRange || campaignPlaceLabel(campaign)
                    : followerRange
                      ? campaignPlaceLabel(campaign)
                      : "Listed location for this brief"}
                </p>
              </HighlightCard>
              <HighlightCard icon={Wallet} label="Payment">
                <p className="text-base font-semibold text-slate-950">
                  {payment.primary}
                </p>
                <p className="mt-1 text-xs font-normal text-slate-500">
                  {payment.secondary}
                </p>
              </HighlightCard>
              <HighlightCard icon={Gift} label="Benefits">
                <ul className="space-y-1.5 font-normal">
                  {benefits.slice(0, 2).map((line) => (
                    <li key={line} className="flex gap-1.5">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span className="leading-snug text-slate-700">{line}</span>
                    </li>
                  ))}
                </ul>
              </HighlightCard>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-7">
              <SectionHeading icon={Target}>{objectives.title}</SectionHeading>
              <ul className="space-y-3">
                {objectives.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 rounded-2xl bg-[#f8f7fc] px-4 py-3.5 text-sm text-slate-700 sm:text-[0.95rem]"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-7">
              <SectionHeading icon={Clock3}>Campaign Timeline</SectionHeading>
              <div className="relative">
                <div className="absolute left-[1.15rem] top-3 bottom-3 w-px bg-violet-100 md:left-8 md:right-8 md:top-5 md:bottom-auto md:h-0.5 md:w-auto" />
                <ol className="grid gap-5 md:grid-cols-4 md:gap-3">
                  {timeline.map((step, index) => (
                    <li
                      key={step.id}
                      className="relative flex gap-3 md:flex-col md:items-center md:px-2 md:text-center"
                    >
                      <span
                        className={cn(
                          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold shadow-sm",
                          index === 0
                            ? "border-[#6d28d9] bg-[#6d28d9] text-white"
                            : "border-violet-200 bg-white text-[#6d28d9]"
                        )}
                      >
                        {index === 0 ? <Check className="h-4 w-4" /> : step.id}
                      </span>
                      <div className="min-w-0 pt-1 md:pt-3">
                        <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{step.detail}</p>
                        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#6d28d9]">
                          {step.date}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          <section
            id="deliverables"
            className="scroll-mt-36 rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7"
          >
            <SectionHeading icon={Package}>Deliverables</SectionHeading>
            <p className="mb-5 text-sm leading-relaxed text-slate-500">
              Based on the campaign category and brief. Confirm exact deliverables with the brand if selected.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {deliverables.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-[#f8f7fc] px-4 py-3.5 text-sm font-medium text-slate-800"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[#6d28d9] shadow-sm">
                    <Package className="h-3.5 w-3.5" />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </section>

          <section
            id="requirements"
            className="scroll-mt-36 rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7"
          >
            <SectionHeading icon={ListChecks}>Requirements</SectionHeading>
            {campaign.requirements?.length ? (
              <ul className="space-y-3">
                {campaign.requirements.map((item, index) => (
                  <li
                    key={item}
                    className="flex gap-3 rounded-2xl border border-slate-100 bg-[#f8f7fc] px-4 py-3.5 text-sm text-slate-700"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6d28d9] text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                No separate requirements list was added. Use the campaign description as the brief.
              </div>
            )}
          </section>

          <section
            id="rewards"
            className="scroll-mt-36 rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7"
          >
            <SectionHeading icon={Gift}>Rewards & Benefits</SectionHeading>
            <div className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#6d28d9] to-[#4c1d95] px-5 py-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-200">
                Listed budget
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {formatBudget(campaign)}
              </p>
            </div>
            <ul className="space-y-3">
              {benefits.map((line) => (
                <li key={line} className="flex gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <span className="leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
          </section>

          <section
            id="faqs"
            className="scroll-mt-36 rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7"
          >
            <SectionHeading icon={HelpCircle}>FAQs</SectionHeading>
            <div className="space-y-2.5">
              {faqs.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-slate-200 bg-[#f8f7fc] px-4 py-3.5 open:border-violet-200 open:bg-white open:shadow-sm"
                >
                  <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-3">
                      {item.q}
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#6d28d9] shadow-sm transition group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeading icon={Users}>
              Applicants ({campaign.applicants || 0})
            </SectionHeading>
            {campaign.applications?.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {campaign.applications.map((application) => {
                  const talent = application.talent;
                  const href =
                    talent?.id && talent?.specialty
                      ? `/talents/${encodeURIComponent(talent.specialty)}/${talent.id}`
                      : null;
                  const row = (
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-[#f8f7fc] px-3 py-3 transition hover:border-violet-200 hover:bg-white">
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white">
                        {talent?.imageUrl ? (
                          <Image
                            src={talent.imageUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-xs font-semibold text-slate-500">
                            {(talent?.name || "?").charAt(0).toUpperCase()}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1 text-sm font-medium text-slate-900">
                          <span className="truncate">{talent?.name || "Creator"}</span>
                          {talent?.verificationStatus === "VERIFIED" ? (
                            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                          ) : null}
                        </span>
                        {talent?.specialty ? (
                          <span className="block truncate text-xs text-slate-500">
                            {talent.specialty}
                          </span>
                        ) : null}
                      </span>
                    </div>
                  );
                  return (
                    <li key={application.id}>
                      {href ? <Link href={href}>{row}</Link> : row}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-2xl bg-[#f8f7fc] px-4 py-5 text-sm text-slate-500">
                No one has applied yet. Be the first.
              </p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_20px_50px_-28px_rgba(109,40,217,0.4)]">
            <div className="bg-[#6d28d9] px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                  <Rocket className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Apply for This Campaign</p>
                  <p className="text-xs text-violet-100">
                    {closed
                      ? "This brief is no longer accepting applications"
                      : canUseProfile
                        ? "Use your creator profile to apply faster"
                        : "Submit your pitch to the brand"}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3 p-5">
              {!closed ? (
                <p className="text-sm leading-relaxed text-slate-600">
                  Share why you&apos;re a fit. Brands review applications directly on Payollar.
                </p>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
                  Applications closed on {format(deadline, "MMM d, yyyy")}. Browse other open briefs instead.
                </div>
              )}

              {closed ? (
                <Button
                  asChild
                  className="h-11 w-full rounded-xl bg-[#6d28d9] text-sm font-semibold hover:bg-[#5b21b6]"
                >
                  <Link href="/campaigns">
                    Browse open campaigns
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => setApplyOpen(true)}
                  className="h-11 w-full rounded-xl bg-[#6d28d9] text-sm font-semibold hover:bg-[#5b21b6]"
                >
                  Submit Application
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              )}

              <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                or
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <Button
                asChild
                type="button"
                variant="outline"
                className="h-11 w-full rounded-xl border-[#6d28d9]/25 bg-white text-[#6d28d9] hover:bg-[#f5f3ff]"
              >
                <Link href="/contact-support">
                  <MessageSquare className="mr-1.5 h-4 w-4" />
                  Message Brand
                </Link>
              </Button>

              {creatorProfile && !canUseProfile && !closed ? (
                <p className="text-center text-xs text-slate-500">
                  <Link
                    href="/creator/profile"
                    className="font-medium text-[#6d28d9] hover:underline"
                  >
                    Complete your profile
                  </Link>{" "}
                  for one-tap apply.
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-violet-100 bg-[#f5f3ff] p-5">
            <div className="flex items-center gap-2 text-[#6d28d9]">
              <Clock3 className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-wide">
                Application Deadline
              </p>
            </div>
            <p className="mt-2 text-lg font-semibold leading-snug text-slate-950">
              {format(deadline, "MMM d, yyyy")}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {format(deadline, "h:mm a")} · {deadlineHint}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3e8ff] text-[#6d28d9]">
                <Building2 className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900">Brand Information</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/80">
                {campaign.client?.imageUrl || campaign.imageUrl ? (
                  <Image
                    src={campaign.client?.imageUrl || campaign.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-lg font-semibold text-slate-500">
                    {(campaign.brand || "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-sm font-semibold text-slate-950">
                  <span className="truncate">{campaign.brand}</span>
                  <BadgeCheck className="h-4 w-4 shrink-0 text-sky-500" />
                </p>
                <p className="truncate text-xs text-slate-500">
                  {campaignCategoryLabel(campaign)}
                  {campaign.client?.name ? ` · ${campaign.client.name}` : ""}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {campaign.applicants || 0}{" "}
                  {(campaign.applicants || 0) === 1 ? "applicant" : "applicants"} so far
                </p>
              </div>
            </div>
            <Link
              href="/campaigns"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#6d28d9] hover:underline"
            >
              Browse more campaigns
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{campaign.title}</p>
            <p className="truncate text-xs text-slate-500">
              {closed ? "Applications closed" : formatBudget(campaign)}
            </p>
          </div>
          {closed ? (
            <Button asChild className="rounded-xl bg-[#6d28d9] hover:bg-[#5b21b6]">
              <Link href="/campaigns">Browse</Link>
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setApplyOpen(true)}
              className="rounded-xl bg-[#6d28d9] hover:bg-[#5b21b6]"
            >
              Apply
            </Button>
          )}
        </div>
      </div>

      <CampaignApplyDialog
        campaign={campaign}
        open={applyOpen}
        onOpenChange={setApplyOpen}
        creatorProfile={creatorProfile}
      />
    </div>
  );
}
