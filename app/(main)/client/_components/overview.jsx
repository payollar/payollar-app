"use client";

import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { BorderBeam } from "border-beam";
import { campaignCategoryLabel } from "@/lib/campaign-categories";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Megaphone,
  MessageCircle,
  Plus,
  Search,
  Users,
  Wallet,
} from "lucide-react";

function money(value) {
  return `GH₵ ${Number(value || 0).toLocaleString("en-GH")}`;
}

const ORDER_STATUS = {
  REQUESTED: { label: "Chat open", className: "bg-[#e8f0ff] text-[#0b3db8]" },
  SCHEDULED: { label: "Booked", className: "bg-amber-50 text-amber-700" },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-700" },
  CANCELLED: { label: "Cancelled", className: "bg-rose-50 text-rose-600" },
};

function budgetLabel(campaign) {
  const min = campaign.budgetMin;
  const max = campaign.budgetMax;
  if (min == null && max == null) return null;
  if (min != null && max != null && Number(min) !== Number(max)) {
    return `${money(min)} – ${Number(max).toLocaleString("en-GH")}`;
  }
  return money(min ?? max);
}

function deadlineLabel(deadline) {
  if (!deadline) return null;
  const end = new Date(deadline);
  if (Number.isNaN(end.getTime())) return null;
  const days = Math.ceil((end.getTime() - Date.now()) / 86400000);
  if (days < 0) return "Deadline passed";
  if (days === 0) return "Due today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

function initials(name) {
  return (
    String(name || "P")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "P"
  );
}

export function ClientOverview({ stats, recentAppointments = [], appointments = [], campaigns = [], chats = [] }) {
  const firstName = (stats?.companyName || "there").trim().split(" ")[0] || "there";
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "ACTIVE");
  const applications = campaigns.flatMap((campaign) => campaign.applications || []);
  const weekAgo = Date.now() - 7 * 86400000;
  const newApplications = applications.filter((application) => new Date(application.createdAt).getTime() >= weekAgo).length;
  const pendingApplications = applications.filter((application) => application.status === "PENDING").length;

  const booked = appointments.filter((appointment) => appointment.status === "SCHEDULED" || appointment.status === "COMPLETED");
  const bookedCreators = [];
  const seen = new Set();
  for (const appointment of booked) {
    const creator = appointment.creator;
    if (!creator?.id || seen.has(creator.id)) continue;
    seen.add(creator.id);
    bookedCreators.push(creator);
  }
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const bookedThisMonth = booked.filter((appointment) => new Date(appointment.startTime) >= monthStart).length;

  const recentOrders = [...(recentAppointments.length ? recentAppointments : appointments)]
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 4);

  return (
    <div className="-m-3 min-h-full w-full min-w-0 !max-w-none bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-slate-950 md:text-xl">{firstName}</h1>
          <p className="text-sm text-slate-400">Campaigns, orders, and messages.</p>
        </div>
        <Link
          href="/client/campaigns?create=true"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#0055ff] px-4 text-sm font-semibold text-white hover:bg-[#003ecc] sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Post a campaign
        </Link>
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <BorderBeam className="h-full" size="md" theme="light" colorVariant="colorful" strength={0.7} borderRadius={24} duration={8}>
        <section className="h-full rounded-[24px] bg-gradient-to-br from-[#003ecc] via-[#0055ff] to-[#6d5efc] p-6 text-white md:p-8">
          <h2 className="max-w-md text-2xl font-semibold tracking-tight md:text-3xl">
            Find the right creators.
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
            Post a campaign, book a session, and keep the brief in one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/client/campaigns?create=true" className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-[#003ecc]">
              Post a campaign
            </Link>
            <Link href="/client/talents" className="inline-flex h-10 items-center rounded-full border border-white/40 px-4 text-sm font-semibold text-white">
              Browse talents
            </Link>
          </div>
        </section>
        </BorderBeam>

        <BorderBeam className="h-full" size="md" theme="light" colorVariant="ocean" strength={0.8} borderRadius={24} duration={7}>
        <section className="flex h-full flex-col rounded-[24px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <p className="text-sm text-slate-500">This month</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-950">{stats?.appointmentsThisMonth ?? 0}</p>
          <p className="text-sm text-slate-400">
            {(stats?.appointmentsThisMonth ?? 0) === 1 ? "session" : "sessions"} on your calendar
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Upcoming</dt>
              <dd className="font-semibold text-slate-900">{stats?.upcomingAppointments ?? 0}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Completed</dt>
              <dd className="font-semibold text-slate-900">{stats?.completedAppointments ?? 0}</dd>
            </div>
          </dl>
          <Link
            href="/client/bookings"
            className="mt-auto inline-flex h-10 items-center justify-center rounded-full bg-[#0055ff] text-sm font-semibold text-white hover:bg-[#003ecc]"
          >
            View orders
          </Link>
        </section>
        </BorderBeam>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={Megaphone}
          label="Active campaigns"
          value={activeCampaigns.length}
          hint={newApplications > 0 ? `${newApplications} new this week` : pendingApplications > 0 ? `${pendingApplications} waiting` : "Open campaigns"}
          href="/client/campaigns"
        />
        <Stat
          icon={Users}
          label="Booked talents"
          value={bookedCreators.length}
          hint={bookedThisMonth > 0 ? `${bookedThisMonth} sessions this month` : "Scheduled or completed"}
          href="/client/bookings"
        />
        <Stat
          icon={Wallet}
          label="Recorded spend"
          value={money(stats?.totalSpent)}
          hint="Credits, products, and confirmed media"
          href="/client/payouts"
        />
        <Stat
          icon={CheckCircle2}
          label="Upcoming"
          value={stats?.upcomingAppointments ?? 0}
          hint="Paid sessions still ahead"
          href="/client/bookings"
        />
      </div>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_260px]">
        <section className="rounded-[24px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <SectionTitle title="Active campaigns" href="/client/campaigns" />
          {activeCampaigns.length > 0 ? (
            <ul className="space-y-3">
              {activeCampaigns.slice(0, 3).map((campaign) => {
                const apps = campaign.applications || [];
                const pending = apps.filter((application) => application.status === "PENDING").length;
                const accepted = apps.filter((application) => application.status === "ACCEPTED").length;
                const budget = budgetLabel(campaign);
                const due = deadlineLabel(campaign.deadline);
                return (
                  <li key={campaign.id} className="rounded-2xl bg-[#f7f8fc] p-3">
                    <div className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#e8f0ff]">
                        {campaign.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={campaign.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#0b3db8]">
                            {initials(campaign.brand || campaign.title)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-slate-950">{campaign.title || "Untitled campaign"}</p>
                          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Active</span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {[campaign.brand, campaignCategoryLabel(campaign)].filter(Boolean).join(" · ")}
                          {budget ? ` · ${budget}` : ""}
                          {due ? ` · ${due}` : ""}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
                          <span>{apps.length} applications</span>
                          <span>{pending} pending</span>
                          <span>{accepted} accepted</span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty label="No active campaigns yet." href="/client/campaigns?create=true" action="Post a campaign" />
          )}
        </section>

        <section className="rounded-[24px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <SectionTitle title="Orders" href="/client/bookings" />
          {recentOrders.length > 0 ? (
            <ul className="space-y-3">
              {recentOrders.map((order) => {
                const status = ORDER_STATUS[order.status] || { label: order.status || "Open", className: "bg-slate-100 text-slate-600" };
                return (
                  <li key={order.id}>
                    <Link href={`/client/bookings/${order.id}`} className="flex items-center gap-3 rounded-2xl px-1 py-1 hover:bg-[#f7f8fc]">
                      <Avatar name={order.creator?.name} imageUrl={order.creator?.imageUrl} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-950">{order.creator?.name || "Talent"}</span>
                        <span className="block truncate text-xs text-slate-400">
                          {order.creator?.specialty || "Session"}
                          {order.startTime ? ` · ${format(new Date(order.startTime), "d MMM yyyy")}` : ""}
                        </span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.className}`}>{status.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty label="No orders yet." href="/client/talents" action="Browse talents" />
          )}
        </section>

        <BorderBeam size="md" theme="light" colorVariant="ocean" strength={0.85} borderRadius={24} duration={6}>
        <section className="rounded-[24px] bg-gradient-to-b from-[#0055ff] to-[#003ecc] p-4 text-white shadow-[0_12px_28px_rgba(0,85,255,0.22)]">
          <h2 className="text-base font-semibold">Quick actions</h2>
          <div className="mt-3 space-y-2">
            <Quick href="/client/campaigns?create=true" icon={Plus} label="Post a campaign" />
            <Quick href="/client/talents" icon={Search} label="Browse talents" />
            <Quick href="/client/bookings" icon={Calendar} label="View orders" />
            <Quick href="/messages" icon={MessageCircle} label="Open messages" />
          </div>
        </section>
        </BorderBeam>
      </div>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <section className="rounded-[24px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <SectionTitle title="Booked talents" href="/client/bookings" />
          {bookedCreators.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {bookedCreators.slice(0, 4).map((creator) => (
                <li key={creator.id} className="rounded-2xl bg-[#f7f8fc] p-3 text-center">
                  <Avatar name={creator.name} imageUrl={creator.imageUrl} className="mx-auto h-14 w-14 text-sm" />
                  <p className="mt-2 truncate text-sm font-semibold text-slate-950">{creator.name || "Talent"}</p>
                  <p className="truncate text-xs text-slate-400">{creator.specialty || "Creator"}</p>
                  <Link
                    href={`/talents/${encodeURIComponent(creator.specialty || "all")}/${creator.id}`}
                    className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-full bg-[#0055ff] text-xs font-semibold text-white"
                  >
                    View profile
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty label="Talents you book will show up here." href="/client/talents" action="Browse talents" />
          )}
        </section>

        <section className="rounded-[24px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <SectionTitle title="Recent messages" href="/messages" />
          {chats.length > 0 ? (
            <ul className="space-y-3">
              {chats.slice(0, 4).map((chat) => (
                <li key={chat.appointmentId}>
                  <Link href={`/messages/${chat.appointmentId}`} className="flex items-center gap-3 rounded-2xl px-1 py-1 hover:bg-[#f7f8fc]">
                    <Avatar name={chat.other?.name} imageUrl={chat.other?.imageUrl} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-slate-950">{chat.other?.name || "Payollar user"}</span>
                        {chat.lastMessage?.createdAt ? (
                          <span className="shrink-0 text-[11px] text-slate-400">
                            {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: false })}
                          </span>
                        ) : null}
                      </span>
                      <span className="block truncate text-xs text-slate-400">
                        {chat.lastMessage?.body || "No messages yet"}
                      </span>
                    </span>
                    {chat.unread > 0 ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0055ff] px-1.5 text-[11px] font-semibold text-white">
                        {chat.unread}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty label="No messages yet." href="/client/talents" action="Browse talents" />
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint, href }) {
  return (
    <Link href={href} className="rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <span className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f0ff] text-[#0055ff]">
          <Icon className="h-4 w-4" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-slate-300" />
      </span>
      <p className="mt-3 text-xs text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xl font-semibold tabular-nums text-slate-950">{value}</p>
      <p className="mt-1 truncate text-[11px] text-slate-400">{hint}</p>
    </Link>
  );
}

function SectionTitle({ title, href }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      <Link href={href} className="text-sm font-medium text-[#0055ff]">
        View all
      </Link>
    </div>
  );
}

function Quick({ href, icon: Icon, label }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-2xl bg-white/12 px-3 py-3 text-sm font-medium text-white hover:bg-white/20">
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <ArrowUpRight className="h-4 w-4 text-white/70" />
    </Link>
  );
}

function Avatar({ name, imageUrl, className = "h-10 w-10 text-xs" }) {
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8f0ff] font-semibold text-[#0b3db8] ${className}`}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}

function Empty({ label, href, action }) {
  return (
    <div className="px-2 py-8 text-center text-sm text-slate-400">
      <p>{label}</p>
      <Link href={href} className="mt-2 inline-block font-medium text-[#0055ff]">
        {action}
      </Link>
    </div>
  );
}
