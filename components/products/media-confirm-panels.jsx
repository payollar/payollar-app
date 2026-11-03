"use client";

import { cn } from "@/lib/utils";
import { formatCompactCount } from "@/lib/media-planner-pricing";

export function MediaConfirmPanel({ title, icon: Icon, children, className, footer }) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-6",
        className
      )}
    >
      {(title || Icon) && (
        <div className="mb-5 flex items-center gap-2 text-slate-800">
          {Icon ? <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} /> : null}
          {title ? (
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em]">{title}</h4>
          ) : null}
        </div>
      )}
      {children}
      {footer ? <div className="mt-5 border-t border-slate-100 pt-4">{footer}</div> : null}
    </div>
  );
}

export function MediaConfirmRow({ label, children, last = false }) {
  return (
    <div
      className={cn(
        "grid gap-1 py-3.5 sm:grid-cols-[minmax(8rem,0.4fr)_1fr] sm:items-start sm:gap-6",
        !last && "border-b border-slate-100"
      )}
    >
      <dt className="text-xs font-medium uppercase tracking-wider text-slate-400 sm:pt-0.5">
        {label}
      </dt>
      <dd className="text-sm font-semibold leading-snug text-slate-900 sm:text-right sm:text-[15px]">
        {children}
      </dd>
    </div>
  );
}

export function MediaConfirmTotal({
  amount,
  impressions = 0,
  impressionsDemo = false,
  label = "Total (est.)",
}) {
  const impressionsLabel = formatCompactCount(impressions);

  return (
    <div className="rounded-2xl bg-slate-900 px-4 py-4 text-white sm:px-5">
      <div className="flex items-end justify-between gap-4">
        {impressionsLabel ? (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/55">
              Reach (est.)
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">
              {impressionsLabel}
            </p>
            <p className="mt-0.5 text-xs text-white/45">
              impressions{impressionsDemo ? " · demo" : ""}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/55">{label}</p>
            <p className="mt-1 text-xs text-white/45">VAT + NHIL/GETFund included</p>
          </div>
        )}
        <div className="text-right">
          {impressionsLabel ? (
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/55">{label}</p>
          ) : null}
          <p className="text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
            ₵{Math.round(amount || 0).toLocaleString()}
          </p>
          {impressionsLabel ? (
            <p className="mt-0.5 text-xs text-white/45">VAT + NHIL/GETFund included</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export const mediaConfirmInputClassName =
  "h-11 border-slate-200 bg-white text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-slate-900/15";
