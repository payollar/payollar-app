import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function initials(name) {
  return String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function BookingRequestRow({
  href,
  clientName,
  clientEmail,
  statusLabel,
  statusClassName,
  amountLabel,
  summary,
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex w-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 text-left shadow-sm transition",
        "hover:border-slate-300 hover:bg-slate-50/70 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950/15"
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-semibold text-white">
        {initials(clientName)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-slate-950 sm:text-base">
            {clientName}
          </h3>
          <Badge
            variant="outline"
            className={cn("rounded-full", statusClassName)}
          >
            {statusLabel}
          </Badge>
        </div>
        <p className="mt-0.5 truncate text-sm text-slate-500">{clientEmail}</p>
        {summary ? (
          <p className="mt-1 truncate text-xs text-slate-400">{summary}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-3 pl-1">
        {amountLabel ? (
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold tabular-nums text-slate-950 sm:text-base">
              {amountLabel}
            </p>
            <p className="text-[11px] text-slate-400">Total</p>
          </div>
        ) : null}
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition group-hover:border-slate-300 group-hover:text-slate-700">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
