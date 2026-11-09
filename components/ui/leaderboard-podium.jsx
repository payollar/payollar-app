"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const podiumVariants = cva("flex items-end justify-center gap-4", {
  variants: {
    size: {
      sm: "gap-2",
      default: "gap-4",
      lg: "gap-6",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const PODIUM_CONFIG = {
  1: {
    icon: Crown,
    color: "text-rank-1",
    bg: "bg-rank-1/60",
    height: "h-32",
    heightSm: "h-24",
    heightLg: "h-40",
  },
  2: {
    icon: Crown,
    color: "text-rank-2",
    bg: "bg-rank-2/30",
    height: "h-24",
    heightSm: "h-20",
    heightLg: "h-32",
  },
  3: {
    icon: Crown,
    color: "text-rank-3",
    bg: "bg-rank-3/50",
    height: "h-20",
    heightSm: "h-16",
    heightLg: "h-28",
  },
};

const LeaderboardPodium = React.forwardRef(function LeaderboardPodium(
  {
    className,
    size,
    rankings,
    showValue = true,
    showAvatar = true,
    medalStyle = "classic",
    ...props
  },
  ref
) {
  const top3 = rankings.slice(0, 3);
  const podiumOrder = [
    top3.find((r) => r.rank === 2),
    top3.find((r) => r.rank === 1),
    top3.find((r) => r.rank === 3),
  ].filter(Boolean);

  if (podiumOrder.length === 0) return null;

  const avatarSize = {
    sm: "h-10 w-10 text-sm",
    default: "h-14 w-14 text-lg",
    lg: "h-20 w-20 text-2xl",
  }[size ?? "default"];

  const iconSize = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6",
  }[size ?? "default"];

  const textSize = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  }[size ?? "default"];

  return (
    <div
      ref={ref}
      className={cn(podiumVariants({ size }), className)}
      role="list"
      aria-label="Top 3 rankings"
      {...props}
    >
      {podiumOrder.map((ranking) => {
        const config = PODIUM_CONFIG[ranking.rank];
        if (!config) return null;

        const displayName =
          ranking.userName || `User ${ranking.userId.slice(0, 6)}`;
        const avatarSrc =
          ranking.avatarUrl ||
          `https://i.pravatar.cc/96?u=${encodeURIComponent(ranking.userId)}`;
        const podiumHeight = {
          sm: config.heightSm,
          default: config.height,
          lg: config.heightLg,
        }[size ?? "default"];
        const Icon = config.icon;

        return (
          <div
            key={ranking.userId}
            role="listitem"
            aria-label={`Rank ${ranking.rank}: ${displayName}${
              showValue ? `, ${ranking.value.toLocaleString()}` : ""
            }`}
            className="flex flex-col items-center"
          >
            <div className="relative mb-2">
              {showAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc}
                  alt=""
                  className={cn("rounded-full object-cover", avatarSize)}
                />
              ) : (
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full",
                    avatarSize,
                    config.bg
                  )}
                >
                  <Icon className={cn(iconSize, config.color)} />
                </div>
              )}
              {medalStyle !== "minimal" ? (
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-background shadow-sm",
                    size === "sm" ? "h-5 w-5" : size === "lg" ? "h-8 w-8" : "h-6 w-6"
                  )}
                >
                  <Icon
                    className={cn(
                      config.color,
                      size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
                    )}
                  />
                </div>
              ) : null}
            </div>

            <span
              className={cn("max-w-24 truncate text-center font-medium", textSize)}
              title={displayName}
            >
              {displayName}
            </span>

            {showValue ? (
              <span
                className={cn(
                  "tabular-nums text-muted-foreground",
                  size === "sm" ? "text-xs" : "text-sm"
                )}
              >
                {ranking.value.toLocaleString()}
              </span>
            ) : null}

            <div
              aria-hidden
              className={cn(
                "mt-2 w-22 rounded-t-lg",
                size === "sm" && "w-20",
                size === "lg" && "w-24",
                podiumHeight,
                config.bg,
                medalStyle === "modern" && "rounded-t-xl"
              )}
            >
              <div
                className={cn(
                  "flex h-8 items-center justify-center font-bold",
                  config.color
                )}
              >
                {ranking.rank}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

LeaderboardPodium.displayName = "LeaderboardPodium";

export { LeaderboardPodium, podiumVariants };
