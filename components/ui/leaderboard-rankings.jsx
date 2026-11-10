"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Ellipsis,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const crownColorMap = {
  1: "text-amber-500",
  2: "text-slate-400",
  3: "text-orange-500",
};

const pageSizeOptions = [10, 25, 50];

function formatLeaderboardValue(ranking) {
  if (ranking.displayValue != null) return ranking.displayValue;
  const value = ranking.value;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}m`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toLocaleString();
}

const LeaderboardRankings = React.forwardRef(function LeaderboardRankings(
  {
    className,
    rankings,
    onUserClick,
    currentUserId,
    showPagination = false,
    defaultPageSize = 10,
    ...props
  },
  ref
) {
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.max(1, Math.ceil(rankings.length / pageSize));

  React.useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, rankings]);

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pagedRankings = showPagination
    ? rankings.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : rankings;

  const rows = React.useMemo(() => {
    const nextRows = [];
    let hiddenRunCount = 0;

    pagedRankings.forEach((ranking, index) => {
      const isDisplayed = ranking.displayed !== false;
      if (!isDisplayed) {
        hiddenRunCount += 1;
        return;
      }
      if (hiddenRunCount > 0) {
        nextRows.push({ type: "ellipsis", key: `ellipsis-${index}` });
        hiddenRunCount = 0;
      }
      nextRows.push({ type: "ranking", ranking });
    });

    if (hiddenRunCount > 0) {
      nextRows.push({ type: "ellipsis", key: "ellipsis-tail" });
    }

    return nextRows;
  }, [pagedRankings]);

  return (
    <div
      ref={ref}
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-slate-200 bg-white",
        className
      )}
      {...props}
    >
      <div
        role="list"
        aria-label="Leaderboard rankings"
        className="divide-y divide-slate-100"
      >
        {rows.map((row) => {
          if (row.type === "ellipsis") {
            return (
              <div
                key={row.key}
                role="listitem"
                aria-label="Collapsed leaderboard rows"
                className="flex items-center justify-center px-4 py-2.5 text-slate-300"
              >
                <Ellipsis className="h-4 w-4" />
              </div>
            );
          }

          const ranking = row.ranking;
          const displayName =
            ranking.userName || `User ${ranking.userId.slice(0, 6)}`;
          const showCrown = ranking.rank <= 3;
          const crownColor = crownColorMap[ranking.rank];
          const isCurrentUser = currentUserId === ranking.userId;

          return (
            <div
              key={ranking.userId}
              role="listitem"
              tabIndex={onUserClick ? 0 : undefined}
              onClick={() => onUserClick?.(ranking)}
              onKeyDown={
                onUserClick
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onUserClick(ranking);
                      }
                    }
                  : undefined
              }
              className={cn(
                "flex items-center gap-3 px-3 py-3 sm:px-4",
                isCurrentUser && "bg-[#eef2ff]",
                onUserClick && "cursor-pointer transition-colors hover:bg-slate-50",
                isCurrentUser && onUserClick && "hover:bg-[#e8f0ff]"
              )}
            >
              <div className="flex w-10 shrink-0 items-center gap-1 sm:w-12">
                <span
                  className={cn(
                    "w-5 text-sm font-semibold tabular-nums",
                    isCurrentUser ? "text-[#0055ff]" : "text-slate-900"
                  )}
                >
                  {ranking.rank}
                </span>
                {showCrown ? (
                  <Crown className={cn("h-3.5 w-3.5", crownColor)} aria-hidden />
                ) : null}
              </div>

              {ranking.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ranking.avatarUrl}
                  alt=""
                  className={cn(
                    "h-10 w-10 shrink-0 rounded-full object-cover",
                    isCurrentUser && "ring-2 ring-[#0055ff]/30"
                  )}
                />
              ) : (
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    isCurrentUser
                      ? "bg-[#0055ff] text-white"
                      : "bg-slate-100 text-slate-700"
                  )}
                >
                  {(ranking.userName || ranking.userId).charAt(0).toUpperCase()}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {displayName}
                  </p>
                  {isCurrentUser ? (
                    <span className="shrink-0 rounded-full bg-[#0055ff] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      You
                    </span>
                  ) : null}
                </div>
                {ranking.byline ? (
                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    {ranking.byline}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col items-end gap-0.5">
                {typeof ranking.rankChange === "number" && ranking.rankChange !== 0 ? (
                  <p
                    className={cn(
                      "inline-flex items-center gap-0.5 text-[11px] font-medium",
                      ranking.rankChange > 0 ? "text-emerald-600" : "text-rose-600"
                    )}
                  >
                    {ranking.rankChange > 0 ? (
                      <TrendingUp className="h-3 w-3" aria-hidden />
                    ) : (
                      <TrendingDown className="h-3 w-3" aria-hidden />
                    )}
                    {Math.abs(ranking.rankChange)}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-300">—</p>
                )}
                <p className="text-sm font-semibold tabular-nums text-slate-950">
                  {formatLeaderboardValue(ranking)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {showPagination ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="leaderboard-page-size"
              className="text-xs text-slate-500"
            >
              Show
            </label>
            <select
              id="leaderboard-page-size"
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-[#0055ff]"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-lg border border-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs tabular-nums text-slate-500">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
              className="h-8 w-8 rounded-lg border border-slate-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
});

LeaderboardRankings.displayName = "LeaderboardRankings";

export { LeaderboardRankings };
