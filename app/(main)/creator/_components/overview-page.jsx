"use client";

import { useCallback } from "react";
import Link from "next/link";
import { MetalFx, PRESETS } from "metal-fx";

for (const mode of [PRESETS.silver.modes.light, PRESETS.silver.modes.dark]) {
  mode.shiftRed = 0;
  mode.shiftBlue = 0;
  mode.colorTint = "#b7d4ff55";
}
import { format, formatDistanceToNow } from "date-fns";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Eye,
  MessageCircle,
  Wallet,
} from "lucide-react";

function formatPercentTrend(value) {
  if (!value || Number.isNaN(value)) return null;
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
    <span className={`inline-flex ${size} shrink-0 items-center justify-center rounded-full bg-[#e8f0ff] text-sm font-semibold text-[#0b3db8]`}>
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

function MetalCover({ children, radius = 16, className }) {
  const mask = useCallback(
    (ctx, w, h, dpr) => {
      const r = Math.min(radius * dpr, Math.min(w, h) / 2);
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, r);
      ctx.fill();
    },
    [radius]
  );

  return (
    <MetalFx
      preset="silver"
      theme="light"
      strength={0.28}
      shaderScale={2.8}
      mask={mask}
      glowMode="ring"
      innerShadow={{ offsetY: 1, blur: 0.4, alpha: 0.95, color: "#ffffff" }}
      borderRadius={radius}
      className={className}
      style={{ width: "100%", background: "#ffffff", borderRadius: radius }}
    >
      <div className="relative w-full" style={{ borderRadius: radius }}>
        {children}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: radius,
            background:
              "linear-gradient(165deg, rgba(190,216,255,0.34) 0%, rgba(255,255,255,0) 46%, rgba(150,186,255,0.2) 100%)",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: radius,
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.98), inset 0 -1px 0 rgba(92,104,122,0.38), inset 1px 0 0 rgba(255,255,255,0.55), inset -1px 0 0 rgba(92,104,122,0.22)",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: radius,
            padding: 1,
            background:
              "linear-gradient(155deg, rgba(255,255,255,1) 0%, rgba(206,224,255,0.5) 40%, rgba(126,158,204,0.78) 100%)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      </div>
    </MetalFx>
  );
}

function HighlightCard({ label, value, hint }) {
  return (
    <MetalCover radius={16} className="h-full">
      <div className="relative w-full overflow-hidden rounded-2xl p-4 text-slate-950">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 92% 86% at 50% 46%, rgba(255,255,255,0.97) 42%, rgba(255,255,255,0.82) 68%, rgba(255,255,255,0.35) 100%)",
          }}
        />
        <div className="relative">
          <p className="text-sm text-slate-600">{label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">{hint}</p>
        </div>
      </div>
    </MetalCover>
  );
}

function BookingsChart({ data }) {
  const max = Math.max(...data.map((row) => row.bookings), 0);
  const peak = max > 0 ? data.reduce((best, row) => (row.bookings > best.bookings ? row : best), data[0]) : null;

  return (
    <section className="flex h-full flex-col rounded-2xl border border-white bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Bookings</h2>
          <p className="text-sm text-slate-400">Last 6 months</p>
        </div>
        {peak ? (
          <div className="rounded-xl bg-[#0055ff] px-3 py-2 text-center text-white">
            <p className="text-[10px] uppercase tracking-wide text-white/80">{peak.month}</p>
            <p className="text-sm font-semibold">{peak.bookings}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-6 flex flex-1 items-end gap-2">
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
        <p className="mt-4 text-center text-sm text-slate-400">No booked or completed sessions in this period.</p>
      ) : null}
    </section>
  );
}

export function OverviewPage({ user, earnings = {}, analytics = null, chats = [] }) {
  const firstName = user?.name?.split(" ")[0] || "Creator";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

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
      : (views.lastMonth ?? 0) === 0
        ? `${views.thisMonth ?? 0} this month`
        : formatPercentTrend(views.trend) || `${views.thisMonth ?? 0} this month`;

  const chartData = (analytics?.monthlyData ?? []).map((row) => ({
    month: row.month,
    bookings: row.bookings ?? 0,
  }));

  const recent = [...(analytics?.schedule ?? [])]
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 6);
  const chatIds = new Set(chats.map((chat) => chat.appointmentId));
  const unread = chats.reduce((sum, chat) => sum + (chat.unread || 0), 0);

  return (
    <div className="-m-4 min-h-full bg-[#f4f6fb] p-4 text-slate-900 md:-m-6 md:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <PersonAvatar name={user?.name} imageUrl={user?.imageUrl} size="h-11 w-11" />
          <div>
            <h1 className="text-lg font-semibold text-slate-950 md:text-xl">
              {greeting}, {firstName}
            </h1>
            <p className="text-sm text-slate-400">Sessions, product earnings, and messages.</p>
          </div>
        </div>
        <Link
          href="/messages"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm hover:text-slate-900"
          aria-label={unread ? `${unread} unread messages` : "Messages"}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#0055ff]" /> : null}
        </Link>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Sessions" value={(stats.total ?? 0).toLocaleString()} hint={sessionsHint} icon={Calendar} />
            <StatCard
              label="Completed"
              value={(stats.completed ?? 0).toLocaleString()}
              hint={stats.total ? `${stats.completed} of ${stats.total} finished` : "No sessions yet"}
              icon={CheckCircle2}
            />
            <StatCard label="Earnings" value={money(totalEarnings)} hint={earningsHint} icon={Wallet} />
            <StatCard label="Profile views" value={(views.total ?? 0).toLocaleString()} hint={viewsHint} icon={Eye} />
          </div>

          <div className="grid gap-3 lg:grid-cols-[200px_minmax(0,1fr)]">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <HighlightCard
                label="Open chats"
                value={stats.requested ?? 0}
                hint="Clients who started a chat and have not paid yet"
              />
              <HighlightCard
                label="Booked"
                value={stats.scheduled ?? 0}
                hint="Paid sessions on your calendar"
              />
            </div>
            {chartData.length > 0 ? (
              <BookingsChart data={chartData} />
            ) : (
              <div className="flex min-h-52 items-center justify-center rounded-2xl bg-white p-6 text-sm text-slate-400">
                Booking history will show up here after your first session.
              </div>
            )}
          </div>

          <section className="overflow-hidden rounded-2xl border border-white bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="text-base font-semibold text-slate-950">Recent sessions</h2>
              <Link href="/creator/bookings" className="text-sm font-medium text-[#0055ff] hover:text-[#003ecc]">
                View all
              </Link>
            </div>
            {recent.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-y border-slate-100 text-xs text-slate-400">
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
                            <p className="font-medium text-slate-900">{session.clientName || "Client"}</p>
                            {session.brief ? (
                              <p className="max-w-[220px] truncate text-xs text-slate-400">{session.brief}</p>
                            ) : null}
                          </td>
                          <td className="px-3 py-3 text-slate-500">
                            {session.startTime ? format(new Date(session.startTime), "d MMM yyyy") : "—"}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            {chatIds.has(session.id) ? (
                              <Link href={`/messages/${session.id}`} className="font-medium text-[#0055ff] hover:text-[#003ecc]">
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
            ) : (
              <div className="px-5 py-10 text-center text-sm text-slate-400">
                <Calendar className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                No sessions yet.
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-950">This month</h2>
            <p className="mt-1 text-sm text-slate-400">
              {(stats.thisMonth ?? 0) === 1 ? "1 session" : `${stats.thisMonth ?? 0} sessions`} started this month.
            </p>
            <MetalCover radius={20} className="mt-4">
              <Link
                href="/creator/bookings"
                className="relative flex h-10 w-full items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-slate-950"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 80% 90% at 50% 50%, rgba(255,255,255,0.96) 36%, rgba(255,255,255,0.55) 78%, rgba(255,255,255,0.2) 100%)",
                  }}
                />
                <span className="relative">View bookings</span>
              </Link>
            </MetalCover>
          </section>

          <section className="rounded-2xl border border-white bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-950">Recent messages</h2>
              <Link href="/messages" className="text-sm font-medium text-[#0055ff] hover:text-[#003ecc]">
                View all
              </Link>
            </div>
            {chats.length > 0 ? (
              <ul>
                {chats.slice(0, 6).map((chat) => (
                  <li key={chat.appointmentId}>
                    <Link
                      href={`/messages/${chat.appointmentId}`}
                      className="flex items-center gap-3 rounded-xl px-1 py-2.5 hover:bg-[#f4f6fb]"
                    >
                      <PersonAvatar name={chat.other?.name} imageUrl={chat.other?.imageUrl} size="h-8 w-8" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-slate-900">
                            {chat.other?.name || "Client"}
                          </span>
                          <span className="shrink-0 text-[11px] text-slate-400">
                            {chat.lastMessage?.createdAt
                              ? formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: false })
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
    </div>
  );
}
