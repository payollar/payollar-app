"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BorderBeam } from "border-beam";
import {
  Clock3,
  Pencil,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { LeaderboardCard } from "@/components/ui/leaderboard-card";
import { cn } from "@/lib/utils";
import {
  CREATOR_LEADERBOARD_DEMO,
  getLeaderboardResetAt,
  LEADERBOARD_RUNS,
  LEADERBOARD_RUN_OPTIONS,
  shapeCreatorLeaderboard,
} from "@/lib/creator-leaderboard";

const SORTS = [
  { id: "rank", label: "Points" },
  { id: "winRate", label: "Win rate" },
  { id: "score", label: "Score" },
];

function sortEntries(entries, sortId) {
  const next = [...entries];
  if (sortId === "winRate") {
    next.sort((a, b) => (b.winRate ?? 0) - (a.winRate ?? 0) || b.value - a.value);
  } else if (sortId === "score") {
    next.sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || b.value - a.value);
  } else {
    next.sort((a, b) => b.value - a.value);
  }
  return next;
}

function formatCountdown(ms) {
  if (ms <= 0) return "0d 00h 00m";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
}

export function CreatorLeaderboard({
  currentUserId,
  currentUserName,
  entries = CREATOR_LEADERBOARD_DEMO,
}) {
  const [sortId, setSortId] = useState("rank");
  const [runId, setRunId] = useState("7d");
  const [countdown, setCountdown] = useState(() =>
    formatCountdown(getLeaderboardResetAt().getTime() - Date.now())
  );
  const run = LEADERBOARD_RUNS[runId] || LEADERBOARD_RUNS["7d"];

  useEffect(() => {
    const tick = () => {
      setCountdown(
        formatCountdown(getLeaderboardResetAt().getTime() - Date.now())
      );
    };
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

  const board = useMemo(() => {
    const sorted = sortEntries(entries, sortId);
    return shapeCreatorLeaderboard(sorted, { currentUserId, sortId });
  }, [entries, sortId, currentUserId]);

  const yourRank = board.entries.find((entry) => entry.userId === currentUserId);
  const firstName = currentUserName?.trim()?.split(/\s+/)[0] || "Creator";
  const metricLabel =
    SORTS.find((sort) => sort.id === sortId)?.label || board.metricLabel;

  return (
    <div className="-m-3 min-h-full min-w-0 bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:p-5">
      <div className="mx-auto max-w-5xl space-y-4">
        <BorderBeam
          size="md"
          theme="dark"
          colorVariant="mono"
          strength={0.9}
          borderRadius={24}
          duration={8}
          className="w-full"
        >
          <section className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(90%_70%_at_0%_0%,rgba(0,85,255,0.28),transparent_45%),linear-gradient(145deg,#0f172a_0%,#0a0a0a_52%,#111827_100%)] p-5 text-white md:p-7">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent"
            />
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 sm:h-14 sm:w-14">
                  <Trophy className="h-6 w-6 text-amber-300 sm:h-7 sm:w-7" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                    Creator league
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                    Inside the fire
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65">
                    Seasonal board for verified Payollar creators — bookings
                    completed, win rate, and overall score.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                      <Users className="h-3.5 w-3.5" />
                      {board.entries.length} creators
                    </span>
                    {yourRank ? (
                      <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-950">
                        You · #{yourRank.rank}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:items-end">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:min-w-[11.5rem]">
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-white/45">
                    <Clock3 className="h-3.5 w-3.5" />
                    Resets in
                  </p>
                  <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-white">
                    {countdown}
                  </p>
                </div>
                <Link
                  href="/creator/profile"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit profile
                </Link>
              </div>
            </div>
          </section>
        </BorderBeam>

        {yourRank ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Your rank
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-[#0055ff]">
                #{yourRank.rank}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                of {board.entries.length} creators
              </p>
            </div>
            <div className="rounded-2xl border border-white bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <Target className="h-3 w-3" />
                {metricLabel}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
                {yourRank.displayValue}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">This period</p>
            </div>
            <div className="rounded-2xl border border-white bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <Sparkles className="h-3 w-3" />
                Momentum
              </p>
              <p
                className={cn(
                  "mt-1 text-2xl font-semibold tabular-nums",
                  (yourRank.rankChange ?? 0) > 0
                    ? "text-emerald-600"
                    : (yourRank.rankChange ?? 0) < 0
                      ? "text-rose-600"
                      : "text-slate-950"
                )}
              >
                {(yourRank.rankChange ?? 0) > 0
                  ? `+${yourRank.rankChange}`
                  : (yourRank.rankChange ?? 0) === 0
                    ? "—"
                    : yourRank.rankChange}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">Rank change</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 rounded-2xl border border-white bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1 rounded-full bg-[#f4f6fb] p-1">
            {SORTS.map((sort) => (
              <button
                key={sort.id}
                type="button"
                onClick={() => setSortId(sort.id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                  sortId === sort.id
                    ? "bg-[#0055ff] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                {sort.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1 rounded-full bg-[#f4f6fb] p-1">
            {LEADERBOARD_RUN_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setRunId(option.id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                  runId === option.id
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <LeaderboardCard
          title={`${firstName}'s league · ${run.label}`}
          fromDate={run.fromDate}
          toDate={run.toDate}
          currentUserId={currentUserId}
          podiumRankings={board.podiumRankings}
          rankings={board.rankings}
          selectedRunId={runId}
          onRunChange={setRunId}
          runOptions={LEADERBOARD_RUN_OPTIONS}
          hideRunSelect
          metricLabel={metricLabel}
          className="border-white bg-white text-slate-900"
        />
      </div>
    </div>
  );
}
