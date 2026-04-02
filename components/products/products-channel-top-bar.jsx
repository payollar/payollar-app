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
}) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 pb-4 pt-1 sm:px-6 lg:px-8",
        className
      )}
    >
      <Button asChild variant="glass" size="sm" className="rounded-full border-border/60">
        <Link href={backHref}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Link>
      </Button>
      <div className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-foreground sm:text-base [font-family:var(--font-heading)]">
        {Icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>
        ) : null}
        <span className="truncate">{title}</span>
      </div>
    </div>
  );
}
