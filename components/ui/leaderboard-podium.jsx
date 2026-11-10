"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const podiumVariants = cva("flex w-full items-end justify-center", {
  variants: {
    size: {
      sm: "gap-2",
      default: "gap-3 sm:gap-5",
      lg: "gap-3 sm:gap-6",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const PODIUM_CONFIG = {
  1: {
    icon: Crown,
    color: "text-amber-500",
    bar: "bg-gradient-to-b from-amber-300 to-amber-400/80",
    ring: "ring-amber-300/70",
    height: "h-32",
    heightSm: "h-24",
    heightLg: "h-40",
  },
  2: {
    icon: Crown,
    color: "text-slate-400",
    bar: "bg-gradient-to-b from-slate-200 to-slate-300/90",
    ring: "ring-slate-300/80",
    height: "h-24",
    heightSm: "h-20",
    heightLg: "h-32",
  },
  3: {
    icon: Crown,
    color: "text-orange-500",
    bar: "bg-gradient-to-b from-orange-200 to-orange-300/85",
    ring: "ring-orange-300/70",
    height: "h-20",
    heightSm: "h-16",
    heightLg: "h-28",
  },
};

function formatValue(ranking) {
  if (ranking.displayValue != null) return ranking.displayValue;
  if (typeof ranking.value === "number") return ranking.value.toLocaleString();
  return "—";
}

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
    lg: "h-16 w-16 text-xl sm:h-20 sm:w-20 sm:text-2xl",
  }[size ?? "default"];

  const iconSize = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-5 w-5 sm:h-6 sm:w-6",
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
        const avatarSrc = ranking.avatarUrl || null;
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
              showValue ? `, ${formatValue(ranking)}` : ""
            }`}
            className="flex w-[30%] max-w-[11rem] flex-col items-center sm:w-36"
          >
            <div className="relative mb-2">
              {showAvatar ? (
                avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarSrc}
                    alt=""
                    className={cn(
                      "rounded-full object-cover ring-2 ring-offset-2 ring-offset-white",
                      config.ring,
                      avatarSize
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700 ring-2 ring-offset-2 ring-offset-white",
                      config.ring,
                      avatarSize
                    )}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )
              ) : (
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full",
                    avatarSize,
                    config.bar
                  )}
                >
                  <Icon className={cn(iconSize, config.color)} />
                </div>
              )}
              {medalStyle !== "minimal" ? (
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100",
                    size === "sm" ? "h-5 w-5" : "h-6 w-6 sm:h-7 sm:w-7"
                  )}
                >
                  <Icon
                    className={cn(
                      config.color,
                      size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5 sm:h-4 sm:w-4"
                    )}
                  />
                </div>
              ) : null}
            </div>

            <p
              className="w-full truncate text-center text-sm font-semibold text-slate-950"
              title={displayName}
            >
              {displayName}
            </p>
            {ranking.specialty ? (
              <p className="mt-0.5 w-full truncate text-center text-[11px] text-slate-400">
                {ranking.specialty}
              </p>
            ) : null}

            {showValue ? (
              <p className="mt-1 text-sm font-semibold tabular-nums text-slate-700">
                {formatValue(ranking)}
              </p>
            ) : null}

            <div
              aria-hidden
              className={cn(
                "mt-3 w-full max-w-[6.5rem] rounded-t-2xl sm:max-w-[7.5rem]",
                podiumHeight,
                config.bar
              )}
            >
              <div
                className={cn(
                  "flex h-9 items-center justify-center text-sm font-bold",
                  config.color
                )}
              >
                #{ranking.rank}
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
