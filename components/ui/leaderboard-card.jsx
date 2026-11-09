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
    fromDate,
    toDate,
    podiumRankings,
    rankings,
    currentUserId,
    runOptions,
    selectedRunId,
    onRunChange,
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

  return (
    <div
      ref={ref}
      className={cn("rounded-2xl border border-border bg-card p-6 shadow-sm", className)}
      {...props}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-card-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {fromLabel} - {toLabel}
          </p>
        </div>

        {runOptions && runOptions.length > 0 ? (
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
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
          >
            {runOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <div className="mb-8">
        <LeaderboardPodium rankings={podiumRankings} size="lg" medalStyle="modern" />
      </div>

      <LeaderboardRankings
        rankings={rankings}
        currentUserId={currentUserId}
        showPagination
        defaultPageSize={10}
      />
    </div>
  );
});

LeaderboardCard.displayName = "LeaderboardCard";

export { LeaderboardCard };
