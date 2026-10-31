"use client";

import Link from "next/link";
import { format } from "date-fns";
import { BarChart3, Calendar, CheckCircle2, Plus, Search, Users, Wallet } from "lucide-react";

function money(value) {
  return `GH₵ ${Number(value || 0).toLocaleString("en-GH")}`;
}

const STATUS = {
  REQUESTED: { label: "Chat open", className: "bg-[#e8f0ff] text-[#0b3db8]" },
  SCHEDULED: { label: "Booked", className: "bg-amber-50 text-amber-700" },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-700" },
  CANCELLED: { label: "Cancelled", className: "bg-rose-50 text-rose-600" },
};

function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f0ff] text-[#0055ff]">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

function HighlightCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#0055ff] to-[#003ecc] p-4 text-white shadow-[0_12px_28px_rgba(0,85,255,0.22)]">
      <p className="text-sm text-white/80">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      <p className="mt-3 text-xs leading-relaxed text-white/75">{hint}</p>
    </div>
  );
}

export function ClientOverview({ stats, recentAppointments = [], campaigns = [] }) {
  const firstName = (stats?.companyName || "there").trim().split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "ACTIVE");
  const endingThisWeek = activeCampaigns.filter((campaign) => {
    if (!campaign.endDate) return false;
    const endDate = new Date(campaign.endDate);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return endDate >= today && endDate <= weekFromNow;
  }).length;

  const recent = [...recentAppointments]
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 6);

  return (
    <div className="-m-4 min-h-full bg-[#f4f6fb] p-4 text-slate-900 md:-m-6 md:p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-950 md:text-xl">
            {greeting}, {firstName}
          </h1>
          <p className="text-sm text-slate-400">Campaigns, bookings, and applications.</p>
        </div>
        <Link
          href="/client/campaigns?create=true"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0055ff] px-4 text-sm font-semibold text-white hover:bg-[#003ecc]"
        >
          <Plus className="h-4 w-4" />
          New campaign
        </Link>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Bookings"
              value={(stats?.totalAppointments ?? 0).toLocaleString()}
              hint={stats?.totalAppointments ? "Sessions you have opened" : "No bookings yet"}
              icon={Calendar}
            />
            <StatCard
              label="Completed"
              value={(stats?.completedAppointments ?? 0).toLocaleString()}
              hint={
                stats?.totalAppointments
                  ? `${stats.completedAppointments} of ${stats.totalAppointments} finished`
                  : "No sessions yet"
              }
              icon={CheckCircle2}
            />
            <StatCard
              label="Spent"
              value={money(stats?.totalSpent)}
              hint="Credits, products, and confirmed media"
              icon={Wallet}
            />
            <StatCard
              label="Applications"
              value={(stats?.pendingApplications ?? 0).toLocaleString()}
              hint="Waiting on your campaigns"
              icon={Users}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <HighlightCard
              label="Upcoming"
              value={stats?.upcomingAppointments ?? 0}
              hint="Paid sessions still on your calendar"
            />
            <HighlightCard
              label="Active campaigns"
              value={activeCampaigns.length}
              hint={
                endingThisWeek
                  ? `${endingThisWeek} ending within 7 days`
                  : "Campaigns currently open"
              }
            />
          </div>

          <section className="overflow-hidden rounded-2xl border border-white bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="text-base font-semibold text-slate-950">Recent bookings</h2>
              <Link href="/client/bookings" className="text-sm font-medium text-[#0055ff] hover:text-[#003ecc]">
                View all
              </Link>
            </div>
            {recent.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-y border-slate-100 text-xs text-slate-400">
                      <th className="px-5 py-3 font-medium">Talent</th>
                      <th className="px-3 py-3 font-medium">When</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((session) => {
                      const status = STATUS[session.status] || {
                        label: session.status || "Unknown",
                        className: "bg-slate-100 text-slate-600",
                      };
                      return (
                        <tr key={session.id} className="border-b border-slate-50 last:border-0">
                          <td className="px-5 py-3">
                            <p className="font-medium text-slate-900">{session.creator?.name || "Talent"}</p>
                            {session.creator?.specialty ? (
                              <p className="text-xs text-slate-400">{session.creator.specialty}</p>
                            ) : null}
                          </td>
                          <td className="px-3 py-3 text-slate-500">
                            {session.startTime ? format(new Date(session.startTime), "d MMM yyyy") : "—"}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-sm text-slate-400">
                <Calendar className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                No bookings yet.
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-950">This month</h2>
            <p className="mt-1 text-sm text-slate-400">
              {(stats?.appointmentsThisMonth ?? 0) === 1
                ? "1 session"
                : `${stats?.appointmentsThisMonth ?? 0} sessions`}{" "}
              this month.
            </p>
            <Link
              href="/client/bookings"
              className="mt-4 flex h-10 items-center justify-center rounded-xl bg-[#0055ff] text-sm font-semibold text-white hover:bg-[#003ecc]"
            >
              View bookings
            </Link>
          </section>

          <section className="rounded-2xl border border-white bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-950">Active campaigns</h2>
              <Link href="/client/campaigns" className="text-sm font-medium text-[#0055ff] hover:text-[#003ecc]">
                View all
              </Link>
            </div>
            {activeCampaigns.length > 0 ? (
              <ul className="space-y-2">
                {activeCampaigns.slice(0, 5).map((campaign) => (
                  <li key={campaign.id}>
                    <Link
                      href="/client/campaigns"
                      className="block rounded-xl px-1 py-2.5 hover:bg-[#f4f6fb]"
                    >
                      <p className="truncate text-sm font-medium text-slate-900">
                        {campaign.title || "Untitled campaign"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {campaign._count?.applications || 0} applications
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">
                <BarChart3 className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                No active campaigns yet.
                <Link href="/client/campaigns?create=true" className="mt-3 block font-medium text-[#0055ff]">
                  Create one
                </Link>
              </div>
            )}
          </section>

          <Link
            href="/client/talents"
            className="flex items-center gap-3 rounded-2xl border border-white bg-white p-4 text-sm font-medium text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.04)] hover:text-[#0055ff]"
          >
            <Search className="h-4 w-4 text-[#0055ff]" />
            Browse talents
          </Link>
        </aside>
      </div>
    </div>
  );
}
