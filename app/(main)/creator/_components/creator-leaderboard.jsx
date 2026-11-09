"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BorderBeam } from "border-beam";
import { MetalFx } from "metal-fx";
import {
  Bookmark,
  Pencil,
  Trophy,
  Users,
} from "lucide-react";
import { LeaderboardCard } from "@/components/ui/leaderboard-card";
import { cn } from "@/lib/utils";
import {
  CREATOR_LEADERBOARD_DEMO,
  LEADERBOARD_RUNS,
  LEADERBOARD_RUN_OPTIONS,
  shapeCreatorLeaderboard,
} from "@/lib/creator-leaderboard";

const SORTS = [
  { id: "rank", label: "Rank" },
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

export function CreatorLeaderboard({
  currentUserId,
  currentUserName,
  entries = CREATOR_LEADERBOARD_DEMO,
}) {
  const [sortId, setSortId] = useState("rank");
  const [runId, setRunId] = useState("7d");
  const run = LEADERBOARD_RUNS[runId] || LEADERBOARD_RUNS["7d"];

  const board = useMemo(() => {
    const sorted = sortEntries(entries, sortId);
    return shapeCreatorLeaderboard(sorted, { currentUserId });
  }, [entries, sortId, currentUserId]);

  const yourRank = board.entries.find((entry) => entry.userId === currentUserId);

  return (
    <div className="-m-3 min-h-full min-w-0 bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:p-5">
      <div className="mx-auto max-w-7xl space-y-4">
        <BorderBeam
          size="md"
          theme="dark"
          colorVariant="mono"
          strength={0.9}
          borderRadius={24}
          duration={8}
          className="w-full"
        >
          <section className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.12),transparent_42%),linear-gradient(145deg,#12141c_0%,#0a0a0a_48%,#1a1d27_100%)] p-5 text-white md:p-7">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent"
            />
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                  <Trophy className="h-7 w-7 text-rank-1" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                    Creator league
                  </p>
                  <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight md:text-3xl">
                    Inside the fire
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65">
                    Seasonal board for verified Payollar creators — bookings completed,
                    win rate, and overall score.
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

              <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
                <p className="text-right text-xs text-white/50">
                  Leaderboard resets in
                  <span className="mt-1 block text-lg font-semibold tabular-nums text-white">
                    4d 11h 08m
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    Save
                  </button>
                  <Link
                    href="/creator/profile"
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit profile
                  </Link>
                  <MetalFx variant="button" preset="chromatic" theme="dark" strength={0.9}>
                    <Link
                      href="/messages"
                      className="inline-flex h-9 items-center rounded-full bg-slate-950 px-4 text-xs font-semibold text-white hover:bg-black"
                    >
                      Invite friends
                    </Link>
                  </MetalFx>
                </div>
              </div>
            </div>
          </section>
        </BorderBeam>

        <div className="flex flex-col gap-3 rounded-2xl border border-white bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1 rounded-xl bg-[#f4f6fb] p-1">
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
          <div className="flex flex-wrap gap-1 rounded-xl bg-[#f4f6fb] p-1">
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
          title={`${currentUserName ? `${currentUserName.split(" ")[0]}'s` : "Creator"} league · ${run.label}`}
          fromDate={run.fromDate}
          toDate={run.toDate}
          currentUserId={currentUserId}
          podiumRankings={board.podiumRankings}
          rankings={board.rankings}
          selectedRunId={runId}
          onRunChange={setRunId}
          runOptions={LEADERBOARD_RUN_OPTIONS}
          className="border-white bg-white text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
        />
      </div>
    </div>
  );
}
