"use client";

import Link from "next/link";
import { format } from "date-fns";
import { BorderBeam } from "border-beam";
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  FileText,
  Inbox,
  Megaphone,
  Package,
  Plus,
  TrendingUp,
} from "lucide-react";

function money(value) {
  if (value == null) return null;
  return `₵${Number(value).toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

/** Layered chrome rim — matches client overview MetalCard. */
const METAL_BORDER = `
  linear-gradient(
    145deg,
    #ffffff 0%,
    #c9d1d9 8%,
    #8b949e 18%,
    #e8ecef 32%,
    #6b7280 48%,
    #f3f4f6 58%,
    #9ca3af 72%,
    #4b5563 86%,
    #d1d5db 94%,
    #ffffff 100%
  )
`;

function MetalCard({
  children,
  className = "",
  theme = "dark",
  radius = 24,
  strength = 0.85,
  duration = 8,
  animated = true,
  rim = 2,
}) {
  const innerRadius = Math.max(radius - rim, 10);
  const frame = (
    <div
      className="relative h-full"
      style={{
        borderRadius: radius,
        padding: rim,
        background: METAL_BORDER,
        boxShadow:
          theme === "dark"
            ? "0 18px 44px -22px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.55)"
            : "0 12px 32px -18px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      <div
        className="relative h-full overflow-hidden"
        style={{
          borderRadius: innerRadius,
          boxShadow:
            theme === "dark"
              ? "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.45)"
              : "inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(15,23,42,0.06)",
        }}
      >
        {children}
      </div>
    </div>
  );

  if (!animated) {
    return <div className={className}>{frame}</div>;
  }

  return (
    <BorderBeam
      className={className}
      size="md"
      theme={theme}
      colorVariant="mono"
      strength={strength}
      borderRadius={radius}
      duration={duration}
    >
      {frame}
    </BorderBeam>
  );
}

const BOOKING_STATUS = {
  PENDING: { label: "Pending", className: "bg-amber-50 text-amber-700" },
  CONFIRMED: { label: "Confirmed", className: "bg-slate-100 text-slate-700" },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-700" },
  CANCELLED: { label: "Cancelled", className: "bg-rose-50 text-rose-600" },
};

function formatReportType(type) {
  return String(type || "")
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function StatCard({ icon: Icon, label, value, hint, href }) {
  const body = (
    <>
      <span className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white">
          <Icon className="h-4 w-4" />
        </span>
        {href ? <ArrowUpRight className="h-4 w-4 text-slate-300" /> : null}
      </span>
      <p className="mt-3 text-xs text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xl font-semibold tabular-nums text-slate-950">{value}</p>
      <p className="mt-1 truncate text-[11px] text-slate-400">{hint}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)]"
      >
        {body}
      </Link>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">{body}</div>
  );
}

function SectionTitle({ title, href }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      {href ? (
        <Link href={href} className="text-sm font-medium text-slate-950 hover:text-slate-700">
          View all
        </Link>
      ) : null}
    </div>
  );
}

function Empty({ label, href, action }) {
  return (
    <div className="flex min-h-[9.5rem] flex-col items-center justify-center rounded-2xl bg-[#f7f8fc] px-4 py-6 text-center">
      <p className="text-sm text-slate-500">{label}</p>
      {href && action ? (
        <Link
          href={href}
          className="mt-3 inline-flex h-9 items-center rounded-full bg-slate-950 px-4 text-xs font-semibold text-white hover:bg-slate-800"
        >
          {action}
        </Link>
      ) : null}
    </div>
  );
}

export function MediaAgencyOverview({
  agencyName,
  contactName,
  stats,
  bookings = [],
  reports = [],
  talentCampaigns = [],
}) {
  const welcomeName =
    (contactName || agencyName || "there").trim().split(" ")[0] || "there";
  const activeTalentCampaigns = talentCampaigns.filter((c) => c.status === "ACTIVE");
  const pendingApplications = talentCampaigns.reduce(
    (acc, c) => acc + (c.pendingApplications ?? 0),
    0
  );

  return (
    <div className="-m-3 min-h-full w-full min-w-0 !max-w-none bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-slate-950 md:text-xl">
            Welcome, {welcomeName}
          </h1>
          <p className="text-sm text-slate-400">
            Listings, bookings, and packages at a glance.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            href="/media-agency/requests"
            className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Requests
            {stats.pendingBookings > 0 ? (
              <span className="ml-2 rounded-full bg-slate-950 px-2 py-0.5 text-[11px] font-semibold text-white">
                {stats.pendingBookings}
              </span>
            ) : null}
          </Link>
          <Link
            href="/media-agency/rate-card"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Add listing
          </Link>
        </div>
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <MetalCard className="h-full" theme="dark" strength={0.95} duration={9} rim={2.5}>
          <section className="relative h-full overflow-hidden bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.14),transparent_42%),linear-gradient(145deg,#12141c_0%,#0a0a0a_48%,#1a1d27_100%)] p-6 text-white md:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
            />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
              Media workspace
            </p>
            <h2 className="mt-3 max-w-md text-2xl font-semibold tracking-tight md:text-3xl">
              Grow your media inventory.
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/65">
              Publish packages, manage booking requests, and keep rate cards current for clients.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/media-agency/smart-rate-card"
                className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"
              >
                Smart rate card
              </Link>
              <Link
                href="/media-agency/rate-card"
                className="inline-flex h-10 items-center rounded-full border border-white/25 bg-white/5 px-4 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10"
              >
                Custom packages
              </Link>
            </div>
          </section>
        </MetalCard>

        <section className="flex h-full flex-col rounded-[24px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <p className="text-sm text-slate-500">Quick actions</p>
          <div className="mt-3 grid flex-1 grid-cols-1 gap-2">
            <Link
              href="/media-agency/rate-card"
              className="flex items-center gap-3 rounded-2xl bg-[#f7f8fc] px-3 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              <Package className="h-4 w-4 shrink-0 text-slate-500" />
              Custom packages
            </Link>
            <Link
              href="/media-agency/smart-rate-card"
              className="flex items-center gap-3 rounded-2xl bg-[#f7f8fc] px-3 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              <FileText className="h-4 w-4 shrink-0 text-slate-500" />
              Smart rate card
            </Link>
            <Link
              href="/media-agency/requests"
              className="flex items-center gap-3 rounded-2xl bg-[#f7f8fc] px-3 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              <Inbox className="h-4 w-4 shrink-0 text-slate-500" />
              Booking requests
            </Link>
            <Link
              href="/media-agency/campaigns?create=true"
              className="flex items-center gap-3 rounded-2xl bg-[#f7f8fc] px-3 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              <Megaphone className="h-4 w-4 shrink-0 text-slate-500" />
              Post campaign
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Building2}
          label="Active listings"
          value={stats.activeListings ?? stats.totalListings}
          hint={`${stats.totalListings} total listing${stats.totalListings === 1 ? "" : "s"}`}
          href="/media-agency/rate-card"
        />
        <StatCard
          icon={Inbox}
          label="Pending requests"
          value={stats.pendingBookings}
          hint="Awaiting your response"
          href="/media-agency/requests"
        />
        <StatCard
          icon={TrendingUp}
          label="Confirmed"
          value={stats.confirmedBookings}
          hint="Active media bookings"
          href="/media-agency/requests"
        />
        <StatCard
          icon={BarChart3}
          label="Reports"
          value={stats.totalReports}
          hint="Campaign performance files"
          href="/media-agency/reporting"
        />
      </div>

      <div className="mt-4 grid items-stretch gap-4 lg:grid-cols-2">
        <section className="flex h-full flex-col rounded-[24px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <SectionTitle title="Recent booking requests" href="/media-agency/requests" />
          {bookings.length > 0 ? (
            <ul className="space-y-2.5">
              {bookings.map((booking) => {
                const status =
                  BOOKING_STATUS[booking.status] || {
                    label: booking.status || "Open",
                    className: "bg-slate-100 text-slate-600",
                  };
                return (
                  <li key={booking.id} className="rounded-2xl bg-[#f7f8fc] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {booking.clientName}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {booking.listing?.name || "Listing"}
                          {booking.packageName ? ` · ${booking.packageName}` : ""}
                          {booking.createdAt
                            ? ` · ${format(new Date(booking.createdAt), "d MMM yyyy")}`
                            : ""}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                        {booking.totalAmount != null ? (
                          <p className="mt-1 text-xs font-semibold tabular-nums text-slate-900">
                            {money(booking.totalAmount)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty
              label="No booking requests yet."
              href="/media-agency/rate-card"
              action="Publish a package"
            />
          )}
        </section>

        <section className="flex h-full flex-col rounded-[24px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <SectionTitle title="Campaign reports" href="/media-agency/reporting" />
          {reports.length > 0 ? (
            <ul className="space-y-2.5">
              {reports.map((report) => (
                <li key={report.id}>
                  <Link
                    href="/media-agency/reporting"
                    className="flex items-start gap-3 rounded-2xl bg-[#f7f8fc] p-3 hover:bg-[#eef1f8]"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                      <BarChart3 className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-950">
                        {report.title}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-400">
                        {formatReportType(report.reportType)}
                        {report.startDate
                          ? ` · ${format(new Date(report.startDate), "d MMM")} – ${format(
                              new Date(report.endDate),
                              "d MMM yyyy"
                            )}`
                          : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty
              label="No reports yet."
              href="/media-agency/reporting"
              action="Create report"
            />
          )}
        </section>
      </div>

      <section className="mt-4 rounded-[24px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-950">Talent campaigns</h2>
            <p className="mt-1 text-sm text-slate-500">
              {activeTalentCampaigns.length > 0
                ? `${activeTalentCampaigns.length} active · ${pendingApplications} pending application${pendingApplications === 1 ? "" : "s"}`
                : "Reach creators directly — publish campaigns and review applications."}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/media-agency/campaigns?create=true"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              New campaign
            </Link>
            <Link
              href="/media-agency/campaigns"
              className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Manage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
