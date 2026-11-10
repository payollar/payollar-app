"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BorderBeam } from "border-beam";
import { ArrowLeft, LayoutGrid, Trophy, Users } from "lucide-react";
import { LeaderboardCard } from "@/components/ui/leaderboard-card";
import { cn } from "@/lib/utils";
import {
  CREATOR_LEADERBOARD_DEMO,
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

export function TalentLeaderboard({ entries = CREATOR_LEADERBOARD_DEMO }) {
  const router = useRouter();
  const [sortId, setSortId] = useState("rank");
  const [runId, setRunId] = useState("7d");
  const run = LEADERBOARD_RUNS[runId] || LEADERBOARD_RUNS["7d"];

  const board = useMemo(() => {
    const sorted = sortEntries(entries, sortId);
    return shapeCreatorLeaderboard(sorted, { sortId });
  }, [entries, sortId]);

  const openProfile = (ranking) => {
    if (!ranking?.userId) return;
    const specialty =
      ranking.specialty ||
      board.entries.find((entry) => entry.userId === ranking.userId)?.specialty ||
      "Creator";
    router.push(`/talents/${encodeURIComponent(String(specialty).trim())}/${ranking.userId}`);
  };

  const metricLabel =
    SORTS.find((sort) => sort.id === sortId)?.label || board.metricLabel;

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 pb-16 sm:px-6 lg:px-8">
      <Link
        href="/talents/all"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        All talents
      </Link>

      <BorderBeam
        size="md"
        theme="dark"
        colorVariant="mono"
        strength={0.9}
        borderRadius={24}
        duration={8}
        className="w-full"
      >
        <section className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(109,40,217,0.28),transparent_42%),linear-gradient(145deg,#16142b_0%,#0f0e1a_48%,#1a1630_100%)] p-5 text-white md:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent"
          />
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <Trophy className="h-7 w-7 text-amber-300" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-200/80">
                  Talent league
                </p>
                <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight md:text-3xl">
                  Top creators on Payollar
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65">
                  Ranked by bookings completed, active work, and marketplace score across all
                  specialties.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                    <Users className="h-3.5 w-3.5" />
                    {board.entries.length} talents
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-950">
                    All categories
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href="/talents#specialties"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Browse specialties
              </Link>
              <Link
                href="/talents/all"
                className="inline-flex h-9 items-center rounded-full bg-white px-4 text-xs font-semibold text-slate-950 hover:bg-violet-50"
              >
                View directory
              </Link>
            </div>
          </div>
        </section>
      </BorderBeam>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-50 p-1">
          {SORTS.map((sort) => (
            <button
              key={sort.id}
              type="button"
              onClick={() => setSortId(sort.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                sortId === sort.id
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              {sort.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-50 p-1">
          {LEADERBOARD_RUN_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setRunId(option.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
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
        title={`Talent league · ${run.label}`}
        fromDate={run.fromDate}
        toDate={run.toDate}
        podiumRankings={board.podiumRankings}
        rankings={board.rankings}
        selectedRunId={runId}
        onRunChange={setRunId}
        runOptions={LEADERBOARD_RUN_OPTIONS}
        hideRunSelect
        metricLabel={metricLabel}
        onUserClick={openProfile}
        className="border-slate-200 bg-white text-slate-900 shadow-sm"
      />
    </div>
  );
}
