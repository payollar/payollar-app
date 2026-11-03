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

const BOOKING_STATUS = {
  PENDING: { label: "Pending", className: "bg-amber-50 text-amber-700" },
  CONFIRMED: { label: "Confirmed", className: "bg-[#e8f0ff] text-[#0b3db8]" },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-700" },
  CANCELLED: { label: "Cancelled", className: "bg-rose-50 text-rose-600" },
};

function formatReportType(type) {
  return String(type || "")
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f0ff] text-[#0055ff]">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

function SectionTitle({ title, href }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      {href ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0055ff] hover:underline"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
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
          className="mt-3 inline-flex h-9 items-center rounded-full bg-[#0055ff] px-4 text-xs font-semibold text-white hover:bg-[#003ecc]"
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
  const displayName = (agencyName || contactName || "Media agency").trim();
  const activeTalentCampaigns = talentCampaigns.filter((c) => c.status === "ACTIVE");
  const pendingApplications = talentCampaigns.reduce(
    (acc, c) => acc + (c.pendingApplications ?? 0),
    0
  );

  return (
    <div className="-m-3 min-h-full w-full min-w-0 !max-w-none bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:p-5">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-slate-950 md:text-xl">
            {displayName}
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
              <span className="ml-2 rounded-full bg-[#e8f0ff] px-2 py-0.5 text-[11px] font-semibold text-[#0055ff]">
                {stats.pendingBookings}
              </span>
            ) : null}
          </Link>
          <Link
            href="/media-agency/rate-card"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0055ff] px-4 text-sm font-semibold text-white hover:bg-[#003ecc]"
          >
            <Plus className="h-4 w-4" />
            Add listing
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Building2}
          label="Active listings"
          value={stats.activeListings ?? stats.totalListings}
          hint={`${stats.totalListings} total listing${stats.totalListings === 1 ? "" : "s"}`}
        />
        <StatCard
          icon={Inbox}
          label="Pending requests"
          value={stats.pendingBookings}
          hint="Awaiting your response"
        />
        <StatCard
          icon={TrendingUp}
          label="Confirmed"
          value={stats.confirmedBookings}
          hint="Active media bookings"
        />
        <StatCard
          icon={BarChart3}
          label="Reports"
          value={stats.totalReports}
          hint="Campaign performance files"
        />
      </div>

      {/* Hero + quick actions */}
      <div className="mt-4 grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <BorderBeam
          className="h-full"
          size="md"
          theme="light"
          colorVariant="colorful"
          strength={0.7}
          borderRadius={24}
          duration={8}
        >
          <section className="flex h-full flex-col justify-between rounded-[24px] bg-gradient-to-br from-[#003ecc] via-[#0055ff] to-[#6d5efc] p-6 text-white md:p-7">
            <div>
              <h2 className="max-w-lg text-2xl font-semibold tracking-tight md:text-[1.75rem]">
                Grow your media inventory.
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
                Publish packages, manage booking requests, and keep rate cards current for clients.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/media-agency/smart-rate-card"
                className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-[#003ecc]"
              >
                Smart rate card
              </Link>
              <Link
                href="/media-agency/rate-card"
                className="inline-flex h-10 items-center rounded-full border border-white/40 px-4 text-sm font-semibold text-white"
              >
                Custom packages
              </Link>
            </div>
          </section>
        </BorderBeam>

        <BorderBeam
          className="h-full"
          size="md"
          theme="light"
          colorVariant="ocean"
          strength={0.85}
          borderRadius={24}
          duration={6}
        >
          <section className="flex h-full flex-col rounded-[24px] bg-gradient-to-b from-[#0055ff] to-[#003ecc] p-5 text-white shadow-[0_12px_28px_rgba(0,85,255,0.18)] md:p-6">
            <h2 className="text-base font-semibold">Quick actions</h2>
            <div className="mt-3 grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <Link
                href="/media-agency/rate-card"
                className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-medium transition hover:bg-white/15"
              >
                <Package className="h-4 w-4 shrink-0 text-white/80" />
                Custom packages
              </Link>
              <Link
                href="/media-agency/smart-rate-card"
                className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-medium transition hover:bg-white/15"
              >
                <FileText className="h-4 w-4 shrink-0 text-white/80" />
                Smart rate card
              </Link>
              <Link
                href="/media-agency/requests"
                className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-medium transition hover:bg-white/15"
              >
                <Inbox className="h-4 w-4 shrink-0 text-white/80" />
                Booking requests
              </Link>
              <Link
                href="/media-agency/campaigns?create=true"
                className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-medium transition hover:bg-white/15"
              >
                <Megaphone className="h-4 w-4 shrink-0 text-white/80" />
                Post campaign
              </Link>
            </div>
          </section>
        </BorderBeam>
      </div>

      {/* Requests + reports */}
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
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f0ff] text-[#0055ff]">
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

      {/* Talent campaigns */}
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
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0055ff] px-4 text-sm font-semibold text-white hover:bg-[#003ecc]"
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
