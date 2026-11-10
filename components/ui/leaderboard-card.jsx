"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LeaderboardPodium } from "@/components/ui/leaderboard-podium";
import { LeaderboardRankings } from "@/components/ui/leaderboard-rankings";

function formatRangeDate(date) {
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const LeaderboardCard = React.forwardRef(function LeaderboardCard(
  {
    className,
    title = "Leaderboard",
    subtitle,
    fromDate,
    toDate,
    podiumRankings,
    rankings,
    currentUserId,
    runOptions,
    selectedRunId,
    onRunChange,
    onUserClick,
    hideRunSelect = false,
    metricLabel,
    ...props
  },
  ref
) {
  const fromLabel = formatRangeDate(fromDate);
  const toLabel = formatRangeDate(toDate);
  const resolvedRunId = selectedRunId ?? runOptions?.[0]?.id ?? "";
  const hasOnRunChange = Boolean(onRunChange);
  const [localRunId, setLocalRunId] = React.useState(resolvedRunId);

  React.useEffect(() => {
    if (hasOnRunChange) return;
    setLocalRunId(resolvedRunId);
  }, [hasOnRunChange, resolvedRunId]);

  const activeRunId = hasOnRunChange ? resolvedRunId : localRunId;
  const showRunSelect =
    !hideRunSelect && Array.isArray(runOptions) && runOptions.length > 0;

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6",
        className
      )}
      {...props}
    >
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {subtitle ||
              (fromLabel && toLabel ? `${fromLabel} – ${toLabel}` : null)}
            {metricLabel ? (
              <span className="text-slate-400"> · Sorted by {metricLabel}</span>
            ) : null}
          </p>
        </div>

        {showRunSelect ? (
          <select
            aria-label="Select leaderboard run"
            value={activeRunId}
            onChange={(event) => {
              if (onRunChange) {
                onRunChange(event.target.value);
                return;
              }
              setLocalRunId(event.target.value);
            }}
            className="h-9 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0055ff]"
          >
            {runOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <div className="mb-6 rounded-2xl bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_70%)] px-2 pb-1 pt-4 sm:mb-8 sm:px-4">
        <LeaderboardPodium
          rankings={podiumRankings}
          size="lg"
          medalStyle="modern"
        />
      </div>

      <LeaderboardRankings
        rankings={rankings}
        currentUserId={currentUserId}
        onUserClick={onUserClick}
        showPagination
        defaultPageSize={10}
        className="border-0 shadow-none"
      />
    </div>
  );
});

LeaderboardCard.displayName = "LeaderboardCard";

export { LeaderboardCard };
