"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Compact page intro for TV/radio planners — replaces the large campaign banner.
 */
export function MediaPlannerIntro({
  title,
  description,
  cartCount = 0,
  cartHref = "/products/media-cart",
  className,
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pb-8",
        className
      )}
    >
      <div className="min-w-0 max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">{description}</p>
        ) : null}
      </div>
      <Button
        asChild
        variant="outline"
        className="h-10 shrink-0 rounded-full border-slate-200 bg-white px-4 text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
      >
        <Link href={cartHref}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Media cart{cartCount > 0 ? ` (${cartCount})` : ""}
        </Link>
      </Button>
    </header>
  );
}
