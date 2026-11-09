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
  1: "text-rank-1",
  2: "text-rank-2",
  3: "text-rank-3",
};

const pageSizeOptions = [10, 25, 50, 100];

function formatLeaderboardValue(value) {
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
  }, [pageSize]);

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
      className={cn("w-full rounded-xl border border-border bg-card", className)}
      {...props}
    >
      <div role="list" aria-label="Leaderboard rankings" className="divide-y divide-border">
        {rows.map((row) => {
          if (row.type === "ellipsis") {
            return (
              <div
                key={row.key}
                role="listitem"
                aria-label="Collapsed leaderboard rows"
                className="flex items-center justify-center px-4 py-2 text-muted-foreground"
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
                "flex items-center gap-2 px-4 py-2",
                isCurrentUser && "rounded-md border-2 border-primary bg-muted",
                onUserClick && "cursor-pointer transition-colors hover:bg-muted/40"
              )}
            >
              <div className="flex w-12 items-center gap-1">
                <span className="w-5 text-sm font-semibold tabular-nums text-foreground">
                  {ranking.rank}
                </span>
                {showCrown ? (
                  <Crown className={cn("h-4 w-4", crownColor)} aria-hidden />
                ) : null}
              </div>

              {ranking.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ranking.avatarUrl}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                  {(ranking.userName || ranking.userId).charAt(0).toUpperCase()}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                {ranking.byline ? (
                  <p className="truncate text-xs text-muted-foreground">{ranking.byline}</p>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col items-end gap-0.5">
                {typeof ranking.rankChange === "number" && ranking.rankChange !== 0 ? (
                  <p
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium",
                      ranking.rankChange > 0 ? "text-emerald-600" : "text-rose-600"
                    )}
                  >
                    {ranking.rankChange > 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" aria-hidden />
                    )}
                    {Math.abs(ranking.rankChange)}
                  </p>
                ) : null}
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {formatLeaderboardValue(ranking.value)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {showPagination ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <label htmlFor="leaderboard-page-size" className="text-sm text-muted-foreground">
              Show
            </label>
            <select
              id="leaderboard-page-size"
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="rounded-md border border-border bg-background px-2 py-1 text-sm text-muted-foreground"
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
              className="rounded-md border"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md border"
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
