"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Back link + channel label below the global LandingNavbar on /products/* channel pages.
 */
export function ProductsChannelTopBar({
  title,
  icon: Icon,
  backHref = "/products",
  backLabel = "All services",
  className,
  variant = "default",
  showChannelLabel = true,
}) {
  const isLight = variant === "light";

  return (
    <div
      className={cn(
        "mx-auto flex max-w-7xl items-center gap-3 px-4 pb-4 pt-1 sm:px-6 lg:px-8",
        showChannelLabel ? "justify-between" : "justify-start",
        className
      )}
    >
      <Button
        asChild
        variant={isLight ? "outline" : "glass"}
        size="sm"
        className={cn(
          "rounded-full",
          isLight
            ? "border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
            : "border-border/60"
        )}
      >
        <Link href={backHref}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Link>
      </Button>
      {showChannelLabel ? (
        <div
          className={cn(
            "flex min-w-0 items-center gap-2.5 text-sm font-semibold sm:text-base [font-family:var(--font-heading)]",
            isLight ? "text-slate-900" : "text-foreground"
          )}
        >
          {Icon ? (
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1",
                isLight
                  ? "bg-primary/10 text-primary ring-primary/15"
                  : "bg-primary/10 text-primary ring-primary/20"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </span>
          ) : null}
          <span className="truncate">{title}</span>
        </div>
      ) : null}
    </div>
  );
}
