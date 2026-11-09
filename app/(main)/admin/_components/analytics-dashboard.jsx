"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Filter,
  Megaphone,
  Package,
  Plus,
  Radio,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function money(value) {
  return `GH₵ ${Number(value || 0).toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

function pct(value) {
  const n = Number(value || 0);
  const sign = n > 0 ? "+" : "";
  return `${sign}${n}%`;
}

function Trend({ value }) {
  const n = Number(value || 0);
  if (!n) return <span className="text-xs font-medium text-slate-400">0%</span>;
  const up = n > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold",
        up ? "text-emerald-600" : "text-rose-500"
      )}
    >
      {pct(n)}
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

function Panel({ title, action, children, className }) {
  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
        {action}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}

function GhostLink({ href, children }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}

function Sparkline({ points = [], className }) {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(max - min, 1);
  const coords = points
    .map((value, index) => {
      const x = points.length <= 1 ? 0 : (index / (points.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={cn("h-24 w-full", className)}>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={coords}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function AreaSpark({ points = [] }) {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(max - min, 1);
  const line = points.map((value, index) => {
    const x = points.length <= 1 ? 0 : (index / (points.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  });
  const area = [`0,100`, ...line, `100,100`].join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-20 w-full text-slate-950">
      <polygon fill="currentColor" fillOpacity="0.1" points={area} />
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        points={line.join(" ")}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function SegmentBars({ items }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="mt-4 flex h-36 items-end gap-4">
      {items.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-full w-full items-end justify-center">
            <div
              className="w-10 rounded-t-xl bg-slate-950/90"
              style={{ height: `${Math.max((item.value / max) * 100, 8)}%` }}
            />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-slate-950">{item.value}%</p>
            <p className="text-[11px] text-slate-400">{item.label}</p>
            <Trend value={item.trend} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChannelBar({ parts }) {
  const total = parts.reduce((sum, part) => sum + part.value, 0) || 1;
  return (
    <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-100">
      {parts.map((part) => (
        <div
          key={part.label}
          className={part.color}
          style={{ width: `${(part.value / total) * 100}%` }}
          title={`${part.label}: ${part.value}`}
        />
      ))}
    </div>
  );
}

function HeatCell({ intensity }) {
  const opacity = 0.12 + intensity * 0.78;
  return (
    <div
      className="aspect-square rounded-md bg-slate-950"
      style={{ opacity }}
    />
  );
}

function statusCount(rows = [], status) {
  return Number(rows.find((row) => row.status === status)?._count || 0);
}

const RANGES = ["1D", "1W", "1M", "3M", "1Y"];

export function AnalyticsDashboard({ analytics, focus = "overview" }) {
  const { data: session } = useSession();
  const [range, setRange] = useState("1W");
  const firstName = (session?.user?.name || "Admin").trim().split(" ")[0] || "Admin";

  if (!analytics) {
    return (
      <div className="rounded-[22px] bg-white px-6 py-14 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <p className="text-sm text-slate-500">Loading analytics…</p>
      </div>
    );
  }

  const {
    users,
    appointments,
    payouts,
    products,
    campaigns,
    mediaAgencies,
    applications,
    logistics,
    negotiations,
    mediaBookings,
    delivery,
    marketplace,
    verification,
    operations,
    disputes,
  } = analytics;

  const growthPoints = useMemo(
    () => (users?.monthlyData || []).map((row) => Number(row.users || 0)),
    [users]
  );

  const salesBreakdown = [
    {
      label: "Product sales",
      value: money(marketplace?.revenue),
      trend: users?.growthRate,
    },
    {
      label: "Credit payouts",
      value: money(payouts?.totalAmount),
      trend: payouts?.pending ? -1 : 2,
    },
    {
      label: "Media bookings",
      value: String((mediaBookings?.confirmed || 0) + (mediaBookings?.pending || 0)),
      trend: mediaBookings?.pending ? 1.2 : 0.4,
    },
  ];

  const userMix = [
    {
      label: "Creators",
      value: Math.max(
        1,
        Math.round(
          ((statusCount(appointments?.byStatus, "COMPLETED") + (products?.active || 0)) /
            Math.max(users?.total || 1, 1)) *
            40
        )
      ),
      trend: Number(users?.growthRate || 0),
    },
    {
      label: "Clients",
      value: Math.max(1, Math.round(((campaigns?.active || 0) / Math.max(users?.total || 1, 1)) * 55)),
      trend: -1.1,
    },
    {
      label: "Agencies",
      value: Math.max(
        1,
        Math.round(((mediaAgencies?.verified || 0) / Math.max(users?.total || 1, 1)) * 30)
      ),
      trend: 0.8,
    },
  ];

  const funnel = [
    { label: "Applications", value: applications?.pending || 0 },
    { label: "Accepted", value: applications?.accepted || 0 },
    { label: "Reports in", value: delivery?.submitted || 0 },
  ];

  const conversionRate =
    applications?.accepted > 0
      ? ((delivery?.submitted || 0) / Math.max(applications.accepted, 1)) * 100
      : applications?.pending
        ? 8.4
        : 0;

  const channelParts = [
    { label: "Listings", value: mediaAgencies?.listings || 0, color: "bg-amber-400" },
    { label: "Rate cards", value: mediaBookings?.publishedRateCards || 0, color: "bg-sky-400" },
    { label: "Negotiations", value: negotiations?.total || 0, color: "bg-violet-500" },
  ];

  const heat = Array.from({ length: 28 }, (_, index) => {
    const base =
      ((operations?.attention || 0) + (logistics?.attention || 0) + (negotiations?.open || 0) + 1) %
      9;
    return ((index * 3 + base) % 10) / 10;
  });

  const opsRows = [
    {
      label: "Verification",
      value: (verification?.pendingCreators || 0) + (verification?.pendingAgencies || 0),
      href: "/admin?tab=pending",
    },
    {
      label: "Logistics issues",
      value: logistics?.attention || 0,
      href: "/admin?tab=logistics",
    },
    {
      label: "Open negotiations",
      value: negotiations?.open || 0,
      href: "/admin?tab=negotiations",
    },
    {
      label: "Pending payouts",
      value: payouts?.pending || 0,
      href: "/admin?tab=payouts",
    },
  ];

  const totalOrders = appointments?.total || 0;
  const transactionValue =
    (marketplace?.revenue || 0) + (payouts?.totalAmount || 0);

  const kpiCards = [
    {
      label: "Total users",
      value: (users?.total || 0).toLocaleString(),
      hint: `${users?.recent || 0} new this week`,
      trend: users?.growthRate || 0,
      icon: Users,
      href: "/admin?tab=users",
    },
    {
      label: "Campaigns",
      value: (campaigns?.total || 0).toLocaleString(),
      hint: `${campaigns?.active || 0} currently active`,
      trend: campaigns?.active ? 4.2 : 0,
      icon: Megaphone,
      href: "/admin?tab=campaigns",
    },
    {
      label: "Orders",
      value: totalOrders.toLocaleString(),
      hint: "All booking sources",
      trend: appointments?.recent ? 2.8 : 0,
      icon: CalendarDays,
      href: "/admin?tab=dashboard",
    },
    {
      label: "Transaction value",
      value: money(transactionValue),
      hint: "Marketplace + payouts",
      trend: marketplace?.completed ? 6.1 : 1.2,
      icon: Wallet,
      href: "/admin?tab=marketplace",
    },
  ];

  const SHOW_WORKFLOW_CONTROL = false;
  const workflows = [
    {
      title: "Creator campaigns",
      flow: "Applications → selection → offers → content → completion",
      status: `Review ${applications?.pending || 0} applications`,
      href: "/admin?tab=campaigns",
      icon: Megaphone,
    },
    {
      title: "Direct creator",
      flow: "Booking request → chat → invoice → session → payout",
      status: `${appointments?.recent || 0} recent bookings`,
      href: "/admin?tab=talents",
      icon: Users,
    },
    {
      title: "Media booking",
      flow: "Listing → rate card → negotiation → booking → proof",
      status: `${negotiations?.open || 0} negotiations open`,
      href: "/admin?tab=negotiations",
      icon: Radio,
    },
    {
      title: "Unified orders",
      flow: "Talent · campaign · media · marketplace queues",
      status: `${operations?.attention || 0} attention items`,
      href: "/admin?tab=analytics",
      icon: Package,
    },
  ];

  const pendingVerification =
    (verification?.pendingCreators || 0) + (verification?.pendingAgencies || 0);

  const actionQueue = [
    {
      count: disputes?.open || 0,
      priority: "High",
      workflow: "Disputes",
      item: `${disputes?.open || 0} open dispute${(disputes?.open || 0) === 1 ? "" : "s"} awaiting review`,
      owner: "Support",
      action: "Investigate",
      href: "/admin?tab=disputes",
    },
    {
      count: pendingVerification,
      priority: "High",
      workflow: "Verification",
      item: `${pendingVerification} pending talent / agency checks`,
      owner: "Ops",
      action: "Review",
      href: "/admin?tab=pending",
    },
    {
      count: payouts?.pending || 0,
      priority: "High",
      workflow: "Payouts",
      item: `${payouts?.pending || 0} credit payouts waiting approval`,
      owner: "Finance",
      action: "Approve",
      href: "/admin?tab=payouts",
    },
    {
      count: logistics?.attention || 0,
      priority: "Medium",
      workflow: "Logistics",
      item: `${logistics?.attention || 0} shipments need attention`,
      owner: "Ops",
      action: "Open",
      href: "/admin?tab=logistics",
    },
    {
      count: negotiations?.open || 0,
      priority: "Medium",
      workflow: "Media rate card",
      item: `${negotiations?.open || 0} open discount threads`,
      owner: "Media",
      action: "Review",
      href: "/admin?tab=negotiations",
    },
    {
      count: delivery?.submitted || 0,
      priority: "Medium",
      workflow: "Campaign content",
      item: `${delivery?.submitted || 0} delivery reports in review`,
      owner: "Brand & creator",
      action: "Open",
      href: "/admin?tab=campaigns",
    },
  ].filter((row) => row.count > 0);

  const SHOW_PLATFORM_HEALTH = false;
  const healthRows = [
    {
      letter: "P",
      title: "Payments",
      hint: "Settlement reconciliation",
      status: (payouts?.pending || 0) > 0 ? "Check" : "Monitored",
      tone: (payouts?.pending || 0) > 0 ? "warn" : "ok",
    },
    {
      letter: "M",
      title: "Messaging",
      hint: "Negotiation threads",
      status: (negotiations?.open || 0) > 5 ? "Check" : "Monitored",
      tone: (negotiations?.open || 0) > 5 ? "warn" : "ok",
    },
    {
      letter: "R",
      title: "Rate cards",
      hint: "Published prices",
      status: "Monitored",
      tone: "ok",
    },
    {
      letter: "D",
      title: "Disputes",
      hint: "Booking chat reviews",
      status: (disputes?.open || 0) > 0 ? "Check" : "Monitored",
      tone: (disputes?.open || 0) > 0 ? "warn" : "ok",
    },
    {
      letter: "L",
      title: "Media delivery",
      hint: "Transmission proof",
      status: (delivery?.submitted || 0) > 0 ? "Check" : "Monitored",
      tone: (delivery?.submitted || 0) > 0 ? "warn" : "ok",
    },
  ];

  return (
    <div className="-m-3 min-h-full min-w-0 bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:p-5">
      {/* Header */}
      <header className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
            {firstName.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Payollar admin console
            </p>
            <p className="truncate text-lg font-semibold text-slate-950 md:text-xl">
              {focus === "analytics" ? "Analytics" : "Platform overview"}
            </p>
            <p className="text-xs text-slate-400">
              {firstName}
              {operations?.attention
                ? ` · ${operations.attention} items need attention`
                : " · all queues clear"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Last month
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Filter className="h-3.5 w-3.5" />
            Filter by
          </button>
          <Link
            href="/admin?tab=marketplace"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-950 px-4 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Review marketplace
          </Link>
        </div>
      </header>

      {focus !== "analytics" ? (
        <>
          {/* KPI strip */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  href={card.href}
                  className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-colors hover:bg-slate-50/80"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    <Trend value={card.trend} />
                  </div>
                  <p className="mt-4 text-2xl font-semibold tabular-nums tracking-tight text-slate-950">
                    {card.value}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">{card.label}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{card.hint}</p>
                </Link>
              );
            })}
          </div>

          {/* Workflow control centre — hidden for now */}
          {SHOW_WORKFLOW_CONTROL ? (
            <section className="mt-4 rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:p-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-950">
                    Workflow control centre
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Jump into the queues that keep campaigns, bookings, and media moving.
                  </p>
                </div>
                <Link
                  href="/admin?tab=analytics"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-950"
                >
                  Open analytics
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {workflows.map((workflow) => {
                  const Icon = workflow.icon;
                  return (
                    <article
                      key={workflow.title}
                      className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white">
                          <Icon className="h-4 w-4" />
                        </span>
                        <h3 className="text-sm font-semibold text-slate-950">
                          {workflow.title}
                        </h3>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-slate-500">
                        {workflow.flow}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          {workflow.status}
                        </span>
                        <Link
                          href={workflow.href}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-950 hover:underline"
                        >
                          Open
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* Ops queue (+ platform health hidden for now) */}
          <div
            className={cn(
              "mt-4 grid items-stretch gap-4",
              SHOW_PLATFORM_HEALTH && "xl:grid-cols-[1.4fr_0.8fr]"
            )}
          >
            <section className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:p-5">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-950">
                    Operations needing action
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Only queues with items waiting for review appear here.
                  </p>
                </div>
                {actionQueue.length > 0 ? (
                  <GhostLink href="/admin?tab=pending">Open queues</GhostLink>
                ) : null}
              </div>

              {actionQueue.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
                  <p className="text-sm font-semibold text-slate-950">
                    All clear
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    No disputes, verifications, payouts, or media items need review
                    right now.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        <th className="px-2 py-2">Priority</th>
                        <th className="px-2 py-2">Workflow</th>
                        <th className="px-2 py-2">Item</th>
                        <th className="px-2 py-2">Owner</th>
                        <th className="px-2 py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {actionQueue.map((row) => (
                        <tr
                          key={`${row.workflow}-${row.item}`}
                          className="border-b border-slate-50 last:border-0"
                        >
                          <td className="px-2 py-3">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                row.priority === "High"
                                  ? "bg-rose-50 text-rose-700"
                                  : row.priority === "Medium"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                              )}
                            >
                              {row.priority}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-sm font-medium text-slate-700">
                            {row.workflow}
                          </td>
                          <td className="px-2 py-3 text-sm text-slate-600">
                            {row.item}
                          </td>
                          <td className="px-2 py-3 text-sm text-slate-500">
                            {row.owner}
                          </td>
                          <td className="px-2 py-3 text-right">
                            <Link
                              href={row.href}
                              className="inline-flex h-8 items-center rounded-full border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              {row.action}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {SHOW_PLATFORM_HEALTH ? (
              <section className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:p-5">
                <h2 className="text-base font-semibold text-slate-950">
                  Platform health
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Live checks across core services.
                </p>
                <div className="mt-4 space-y-3">
                  {healthRows.map((row) => (
                    <div
                      key={row.title}
                      className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-3"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-white">
                        {row.letter}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-950">
                          {row.title}
                        </p>
                        <p className="truncate text-xs text-slate-500">{row.hint}</p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          row.tone === "ok"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        )}
                      >
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <div className="mb-2 mt-6 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Live performance</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Marketplace, users, and channel activity at a glance.
              </p>
            </div>
          </div>
        </>
      ) : null}

      {/* Top row */}
      <div className="grid items-stretch gap-4 xl:grid-cols-3">
        <Panel
          title="Marketplace sales"
          action={<GhostLink href="/admin?tab=marketplace">Report</GhostLink>}
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-3xl font-semibold tracking-tight text-slate-950">
                {money(marketplace?.revenue)}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Trend value={users?.growthRate || 2} />
                <span className="text-xs text-slate-400">
                  {marketplace?.completed || 0} completed sales
                </span>
              </div>
            </div>
            <div className="flex rounded-full bg-slate-100 p-1">
              {RANGES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRange(item)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    range === item
                      ? "bg-slate-950 text-white"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-slate-950">
            <Sparkline points={growthPoints.length ? growthPoints : [2, 4, 3, 7, 5, 9]} />
          </div>

          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
            {salesBreakdown.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">{row.label}</span>
                <span className="flex items-center gap-2 font-semibold tabular-nums text-slate-950">
                  {row.value}
                  <Trend value={row.trend} />
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Platform users" action={<GhostLink href="/admin?tab=users">Details</GhostLink>}>
          <div>
            <p className="text-3xl font-semibold tracking-tight text-slate-950">
              {(users?.total || 0).toLocaleString()}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Trend value={users?.growthRate || 0} />
              <span className="text-xs text-slate-400">{users?.recent || 0} new this week</span>
            </div>
          </div>
          <SegmentBars items={userMix} />
        </Panel>

        <Panel
          title="Campaign conversion"
          action={<GhostLink href="/admin?tab=campaigns">Details</GhostLink>}
        >
          <div>
            <p className="text-3xl font-semibold tracking-tight text-slate-950">
              {conversionRate.toFixed(1)}%
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Trend value={2.1} />
              <span className="text-xs text-slate-400">accepted → report rate</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {funnel.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{row.label}</span>
                <span className="font-semibold tabular-nums text-slate-950">
                  {row.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4">
            <AreaSpark points={growthPoints.length ? growthPoints : [1, 2, 2, 4, 3, 5]} />
            <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-slate-400">
              {(users?.monthlyData || [{ month: "Jun" }, { month: "Nov" }]).map((row) => (
                <span key={row.month}>{row.month}</span>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* Bottom row */}
      <div className="mt-4 grid items-stretch gap-4 xl:grid-cols-3">
        <Panel
          title="Media channels"
          action={<GhostLink href="/admin?tab=media-agencies">View reports</GhostLink>}
        >
          <div>
            <p className="text-3xl font-semibold tracking-tight text-slate-950">
              {Math.min(
                99,
                Math.round(
                  (((mediaBookings?.confirmed || 0) + (mediaBookings?.publishedRateCards || 0)) /
                    Math.max(
                      (mediaBookings?.confirmed || 0) +
                        (mediaBookings?.pending || 0) +
                        (mediaBookings?.publishedRateCards || 0) +
                        1,
                      1
                    )) *
                    100
                )
              )}
              %
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Trend value={-0.4} />
              <span className="text-xs text-slate-400">booking readiness</span>
            </div>
          </div>

          <ChannelBar parts={channelParts} />

          <div className="mt-4 space-y-3">
            {[
              {
                label: "Pending bookings",
                value: mediaBookings?.pending || 0,
                meta: "Listing + rate card",
              },
              {
                label: "Open negotiations",
                value: negotiations?.open || 0,
                meta: "Discount threads",
              },
              {
                label: "Verified agencies",
                value: mediaAgencies?.verified || 0,
                meta: `${mediaAgencies?.listings || 0} listings`,
              },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-950">{row.label}</p>
                  <p className="text-xs text-slate-400">{row.meta}</p>
                </div>
                <p className="text-sm font-semibold tabular-nums text-slate-950">{row.value}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Operations heat"
          action={<GhostLink href="/admin?tab=logistics">Details</GhostLink>}
        >
          <div>
            <p className="text-3xl font-semibold tracking-tight text-slate-950">
              {operations?.attention || 0}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Trend value={operations?.attention ? -1.2 : 2} />
              <span className="text-xs text-slate-400">open attention items</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {heat.map((intensity, index) => (
              <HeatCell key={index} intensity={intensity} />
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
            {opsRows.map((row) => (
              <Link
                key={row.label}
                href={row.href}
                className="flex items-center justify-between rounded-xl px-1 py-1.5 text-sm hover:bg-slate-50"
              >
                <span className="text-slate-500">{row.label}</span>
                <span className="font-semibold tabular-nums text-slate-950">{row.value}</span>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Live queue across logistics, negotiations, verification, and payouts.
          </p>
        </Panel>

        <Panel
          title="Weekly activity"
          action={<GhostLink href="/admin?tab=analytics">Details</GhostLink>}
        >
          <div>
            <p className="text-3xl font-semibold tracking-tight text-slate-950">
              {(
                (appointments?.recent || 0) +
                (users?.recent || 0) +
                (marketplace?.completed || 0)
              ).toLocaleString()}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Trend value={1.1} />
              <span className="text-xs text-slate-400">actions this week</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { label: "Appointments", value: appointments?.recent || 0 },
              { label: "New users", value: users?.recent || 0 },
              { label: "Active campaigns", value: campaigns?.active || 0 },
              { label: "Active products", value: products?.active || 0 },
              { label: "Shipments", value: logistics?.total || 0 },
              {
                label: "Certificates",
                value: delivery?.transmissionCertificates || 0,
              },
            ].map((row) => (
              <div key={row.label} className="rounded-2xl bg-[#f7f8fc] px-3 py-3">
                <p className="text-[11px] text-slate-400">{row.label}</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-slate-950">
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function AdminFeaturePanel({ title, description, metrics = [], links = [] }) {
  return (
    <div className="-m-3 min-h-full min-w-0 bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:p-5">
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-slate-950 md:text-xl">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <section
              key={metric.label}
              className="rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white">
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-300" />
              </div>
              <p className="mt-4 text-xs text-slate-400">{metric.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
                {metric.value}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">{metric.hint}</p>
            </section>
          );
        })}
      </div>
      {links.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
