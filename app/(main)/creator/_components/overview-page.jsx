"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format, formatDistanceToNow, isPast } from "date-fns";
import {
  Bell,
  Calendar,
  Eye,
  Megaphone,
  MessageCircle,
  Wallet,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { campaignCategoryLabel } from "@/lib/campaign-categories";
import { WelcomeCreditsCard } from "./welcome-credits-card";

function formatPercentTrend(value) {
  if (value == null || Number.isNaN(value) || !Number.isFinite(value)) return null;
  if (Math.abs(value) >= 100 && value < 0) return null;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}% from last month`;
}

function money(value) {
  return `GH₵ ${Number(value || 0).toLocaleString("en-GH")}`;
}

const STATUS = {
  REQUESTED: { label: "Chat open", className: "bg-[#e8f0ff] text-[#0b3db8]" },
  SCHEDULED: { label: "Booked", className: "bg-amber-50 text-amber-700" },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-700" },
  CANCELLED: { label: "Cancelled", className: "bg-rose-50 text-rose-600" },
};

function PersonAvatar({ name, imageUrl, size = "h-9 w-9" }) {
  if (imageUrl) {
    return <img src={imageUrl} alt="" className={`${size} shrink-0 rounded-full object-cover`} />;
  }
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <span
      className={`inline-flex ${size} shrink-0 items-center justify-center rounded-full bg-[#e8f0ff] text-sm font-semibold text-[#0b3db8]`}
    >
      {initial}
    </span>
  );
}

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

function BookingsChart({ data, openChats = 0, booked = 0 }) {
  const max = Math.max(...data.map((row) => row.bookings), 0);
  const peak =
    max > 0 ? data.reduce((best, row) => (row.bookings > best.bookings ? row : best), data[0]) : null;

  return (
    <section className="flex h-full flex-col rounded-2xl border border-white bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Bookings</h2>
          <p className="text-sm text-slate-400">Last 6 months</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-[#f4f6fb] px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Open chats</p>
            <p className="text-sm font-semibold tabular-nums text-slate-950">{openChats}</p>
          </div>
          <div className="rounded-xl bg-[#f4f6fb] px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Booked</p>
            <p className="text-sm font-semibold tabular-nums text-slate-950">{booked}</p>
          </div>
          {peak ? (
            <div className="rounded-xl bg-[#0055ff] px-3 py-2 text-center text-white">
              <p className="text-[10px] uppercase tracking-wide text-white/80">{peak.month}</p>
              <p className="text-sm font-semibold">{peak.bookings}</p>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-6 flex min-h-[140px] flex-1 items-end gap-2">
        {data.map((row) => {
          const height = max === 0 ? 8 : Math.max(10, (row.bookings / max) * 140);
          return (
            <div key={row.month} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full max-w-8 rounded-t-lg bg-[#dbe7ff]"
                style={{ height, opacity: row.bookings === 0 ? 0.55 : 1 }}
                title={`${row.bookings} booking${row.bookings === 1 ? "" : "s"}`}
              />
              <span className="text-[11px] text-slate-400">{row.month}</span>
            </div>
          );
        })}
      </div>
      {max === 0 ? (
        <p className="mt-4 text-center text-sm text-slate-400">
          No booked or completed sessions in this period.
        </p>
      ) : null}
    </section>
  );
}

function EmptyPanel({ icon: Icon, title, description, href, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#f4f6fb] text-slate-400">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-xs text-slate-400">{description}</p> : null}
      {href && action ? (
        <Link
          href={href}
          className="mt-4 inline-flex h-9 items-center rounded-full bg-[#0055ff] px-4 text-sm font-semibold text-white hover:bg-[#003ecc]"
        >
          {action}
        </Link>
      ) : null}
    </div>
  );
}

function campaignBudget(campaign) {
  const min = campaign?.budgetMin;
  const max = campaign?.budgetMax;
  if (min == null && max == null) return null;
  if (min != null && max != null && Number(min) !== Number(max)) {
    return `${money(min)} – ${Number(max).toLocaleString("en-GH")}`;
  }
  return money(min ?? max);
}

function campaignDeadline(deadline) {
  if (!deadline) return null;
  const end = new Date(deadline);
  if (Number.isNaN(end.getTime())) return null;
  const days = Math.ceil((end.getTime() - Date.now()) / 86400000);
  if (days < 0) return "Deadline passed";
  if (days === 0) return "Due today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

function isLiveCampaign(campaign) {
  if (!campaign || campaign.status !== "ACTIVE") return false;
  if (!campaign.deadline) return true;
  return !isPast(new Date(campaign.deadline));
}

export function OverviewPage({
  user,
  earnings = {},
  analytics = null,
  chats = [],
  applications = [],
  welcomeCredits = null,
}) {
  const firstName = user?.name?.split(" ")[0] || "Creator";

  const stats = analytics?.appointments ?? {};
  const sales = analytics?.productSales ?? {};
  const views = analytics?.profileViews ?? {};
  const totalEarnings = earnings?.totalEarnings ?? sales.totalEarnings ?? 0;

  const earningsHint =
    totalEarnings === 0 && (sales.thisMonthEarnings ?? 0) === 0
      ? "No product sales yet"
      : (sales.lastMonthEarnings ?? 0) === 0
        ? `${money(sales.thisMonthEarnings ?? 0)} this month`
        : formatPercentTrend(sales.earningsTrend) || "From product sales";

  const sessionsHint =
    (stats.thisMonth ?? 0) === 0 && (stats.lastMonth ?? 0) === 0
      ? "No sessions yet"
      : (stats.lastMonth ?? 0) === 0
        ? `${stats.thisMonth ?? 0} this month`
        : formatPercentTrend(stats.trend) || `${stats.thisMonth ?? 0} this month`;

  const viewsHint =
    (views.total ?? 0) === 0
      ? "No profile views yet"
      : (views.thisMonth ?? 0) === 0
        ? `${views.total} all time`
        : (views.lastMonth ?? 0) === 0
          ? `${views.thisMonth} this month`
          : formatPercentTrend(views.trend) || `${views.thisMonth} this month`;

  const chartData = (analytics?.monthlyData ?? []).map((row) => ({
    month: row.month,
    bookings: row.bookings ?? 0,
  }));

  const recent = [...(analytics?.schedule ?? [])]
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 6);
  const chatIds = new Set(chats.map((chat) => chat.appointmentId));
  const unread = chats.reduce((sum, chat) => sum + (chat.unread || 0), 0);

  const { activeCampaigns, pendingApplications } = useMemo(() => {
    const active = [];
    let pending = 0;
    for (const application of applications) {
      const campaign = application.campaign;
      if (!isLiveCampaign(campaign)) continue;
      if (application.status === "PENDING") pending += 1;
      if (application.status === "ACCEPTED") active.push(application);
    }
    return { activeCampaigns: active, pendingApplications: pending };
  }, [applications]);

  const campaignsHint =
    pendingApplications > 0
      ? `${pendingApplications} pending review`
      : activeCampaigns.length > 0
        ? "Accepted briefs in progress"
        : "No live campaigns yet";

  return (
    <div className="-m-3 min-h-full min-w-0 bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <PersonAvatar name={user?.name} imageUrl={user?.imageUrl} size="h-11 w-11" />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-slate-950 md:text-xl">
              Welcome, {firstName}
            </h1>
            <p className="text-sm text-slate-400">Sessions, campaigns, and messages.</p>
          </div>
        </div>
        <Link
          href="/messages"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm hover:text-slate-900"
          aria-label={unread ? `${unread} unread messages` : "Messages"}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#0055ff]" />
          ) : null}
        </Link>
      </div>

      <div className="space-y-4">
        <WelcomeCreditsCard offer={welcomeCredits} />

        <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Sessions"
            value={(stats.total ?? 0).toLocaleString()}
            hint={sessionsHint}
            icon={Calendar}
          />
          <StatCard
            label="Active campaigns"
            value={activeCampaigns.length.toLocaleString()}
            hint={campaignsHint}
            icon={Megaphone}
          />
          <StatCard label="Earnings" value={money(totalEarnings)} hint={earningsHint} icon={Wallet} />
          <StatCard
            label="Profile views"
            value={(views.total ?? 0).toLocaleString()}
            hint={viewsHint}
            icon={Eye}
          />
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.7fr)]">
          {chartData.length > 0 ? (
            <BookingsChart
              data={chartData}
              openChats={stats.requested ?? 0}
              booked={stats.scheduled ?? 0}
            />
          ) : (
            <div className="flex min-h-52 items-center justify-center rounded-2xl bg-white p-6 text-sm text-slate-400 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              Booking history will show up here after your first session.
            </div>
          )}

          <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <section className="rounded-2xl border border-white bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <h2 className="text-base font-semibold text-slate-950">This month</h2>
              <p className="mt-1 text-sm text-slate-400">
                {(stats.thisMonth ?? 0) === 1
                  ? "1 session started this month."
                  : `${stats.thisMonth ?? 0} sessions started this month.`}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#f4f6fb] px-3 py-2.5">
                  <dt className="text-[11px] text-slate-400">Open chats</dt>
                  <dd className="mt-0.5 text-lg font-semibold tabular-nums text-slate-950">
                    {stats.requested ?? 0}
                  </dd>
                </div>
                <div className="rounded-xl bg-[#f4f6fb] px-3 py-2.5">
                  <dt className="text-[11px] text-slate-400">Booked</dt>
                  <dd className="mt-0.5 text-lg font-semibold tabular-nums text-slate-950">
                    {stats.scheduled ?? 0}
                  </dd>
                </div>
              </dl>
              <Link
                href="/creator/bookings"
                className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full bg-[#0055ff] text-sm font-semibold text-white hover:bg-[#003ecc]"
              >
                View bookings
              </Link>
            </section>

            <section className="rounded-2xl border border-white bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-950">Recent messages</h2>
                <Link
                  href="/messages"
                  className="text-sm font-medium text-[#0055ff] hover:text-[#003ecc]"
                >
                  View all
                </Link>
              </div>
              {chats.length > 0 ? (
                <ul>
                  {chats.slice(0, 5).map((chat) => (
                    <li key={chat.appointmentId}>
                      <Link
                        href={`/messages/${chat.appointmentId}`}
                        className="flex items-center gap-3 rounded-xl px-1 py-2.5 hover:bg-[#f4f6fb]"
                      >
                        <PersonAvatar
                          name={chat.other?.name}
                          imageUrl={chat.other?.imageUrl}
                          size="h-8 w-8"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-medium text-slate-900">
                              {chat.other?.name || "Client"}
                            </span>
                            <span className="shrink-0 text-[11px] text-slate-400">
                              {chat.lastMessage?.createdAt
                                ? formatDistanceToNow(new Date(chat.lastMessage.createdAt), {
                                    addSuffix: false,
                                  })
                                : ""}
                            </span>
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-slate-400">
                            {chat.lastMessage?.body || "No messages yet"}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-8 text-center text-sm text-slate-400">
                  <MessageCircle className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                  No booking messages yet.
                </div>
              )}
            </section>
          </aside>
        </div>

        <section className="overflow-hidden rounded-2xl border border-white bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <Tabs defaultValue="sessions" className="w-full gap-0">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <TabsList className="h-10 w-full justify-start gap-1 rounded-full bg-[#f4f6fb] p-1 sm:w-auto">
                <TabsTrigger
                  value="sessions"
                  className="rounded-full px-4 text-sm data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm"
                >
                  Recent sessions
                </TabsTrigger>
                <TabsTrigger
                  value="campaigns"
                  className="rounded-full px-4 text-sm data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm"
                >
                  Active campaigns
                  {activeCampaigns.length > 0 ? (
                    <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e8f0ff] px-1.5 text-[11px] font-semibold text-[#0055ff]">
                      {activeCampaigns.length}
                    </span>
                  ) : null}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="sessions" className="mt-0">
              {recent.length > 0 ? (
                <>
                  <div className="flex justify-end border-b border-slate-50 px-5 py-2.5">
                    <Link
                      href="/creator/bookings"
                      className="text-sm font-medium text-[#0055ff] hover:text-[#003ecc]"
                    >
                      View all
                    </Link>
                  </div>
                  <ul className="divide-y divide-slate-100 md:hidden">
                    {recent.map((session) => {
                      const status = STATUS[session.status] || {
                        label: session.status || "Unknown",
                        className: "bg-slate-100 text-slate-600",
                      };
                      return (
                        <li key={session.id} className="space-y-2 px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900">
                                {session.clientName || "Client"}
                              </p>
                              <p className="text-xs text-slate-400">
                                {session.startTime
                                  ? format(new Date(session.startTime), "d MMM yyyy")
                                  : "Date not set"}
                              </p>
                            </div>
                            <span
                              className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </div>
                          {session.brief ? (
                            <p className="line-clamp-2 text-xs text-slate-400">{session.brief}</p>
                          ) : null}
                          {chatIds.has(session.id) ? (
                            <Link
                              href={`/messages/${session.id}`}
                              className="text-sm font-medium text-[#0055ff]"
                            >
                              Open chat
                            </Link>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs text-slate-400">
                          <th className="px-5 py-3 font-medium">Client</th>
                          <th className="px-3 py-3 font-medium">When</th>
                          <th className="px-3 py-3 font-medium">Status</th>
                          <th className="px-5 py-3 font-medium">Chat</th>
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
                                <p className="font-medium text-slate-900">
                                  {session.clientName || "Client"}
                                </p>
                                {session.brief ? (
                                  <p className="max-w-[220px] truncate text-xs text-slate-400">
                                    {session.brief}
                                  </p>
                                ) : null}
                              </td>
                              <td className="px-3 py-3 text-slate-500">
                                {session.startTime
                                  ? format(new Date(session.startTime), "d MMM yyyy")
                                  : "—"}
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                                >
                                  {status.label}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                {chatIds.has(session.id) ? (
                                  <Link
                                    href={`/messages/${session.id}`}
                                    className="font-medium text-[#0055ff] hover:text-[#003ecc]"
                                  >
                                    Open
                                  </Link>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <EmptyPanel
                  icon={Calendar}
                  title="No sessions yet"
                  description="When clients book you, recent sessions will show up here."
                  href="/creator/availability"
                  action="Set availability"
                />
              )}
            </TabsContent>

            <TabsContent value="campaigns" className="mt-0">
              {activeCampaigns.length > 0 ? (
                <>
                  <div className="flex justify-end border-b border-slate-50 px-5 py-2.5">
                    <Link
                      href="/creator/applications"
                      className="text-sm font-medium text-[#0055ff] hover:text-[#003ecc]"
                    >
                      View all
                    </Link>
                  </div>
                  <ul className="space-y-3 p-5">
                    {activeCampaigns.slice(0, 5).map((application) => {
                      const campaign = application.campaign;
                      const budget = campaignBudget(campaign);
                      const due = campaignDeadline(campaign?.deadline);
                      return (
                        <li key={application.id}>
                          <Link
                            href={`/campaigns/${campaign.id}`}
                            className="flex gap-3 rounded-2xl bg-[#f7f8fc] p-3 transition-colors hover:bg-[#eef1f8]"
                          >
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#e8f0ff]">
                              {campaign.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={campaign.imageUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#0b3db8]">
                                  {(campaign.brand || campaign.title || "C")
                                    .trim()
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="truncate text-sm font-semibold text-slate-950">
                                  {campaign.title || "Untitled campaign"}
                                </p>
                                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                  Accepted
                                </span>
                              </div>
                              <p className="mt-0.5 truncate text-xs text-slate-400">
                                {[campaign.brand, campaignCategoryLabel(campaign)]
                                  .filter(Boolean)
                                  .join(" · ")}
                                {budget ? ` · ${budget}` : ""}
                                {due ? ` · ${due}` : ""}
                              </p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <EmptyPanel
                  icon={Megaphone}
                  title="No active campaigns yet"
                  description={
                    pendingApplications > 0
                      ? `${pendingApplications} application${pendingApplications === 1 ? "" : "s"} awaiting brand review.`
                      : "Browse open briefs and apply — accepted campaigns will land here."
                  }
                  href={pendingApplications > 0 ? "/creator/applications" : "/campaigns"}
                  action={pendingApplications > 0 ? "View applications" : "Browse campaigns"}
                />
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
