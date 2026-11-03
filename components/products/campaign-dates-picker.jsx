"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_SHORT = ["M", "T", "W", "T", "F", "S", "S"];

function startOfDay(value) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

function getCalendarDays(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  // Monday-first grid to match the reference calendar
  const startPad = (first.getDay() + 6) % 7;
  const days = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function isInRange(day, start, end) {
  if (!day || !start) return false;
  const t = startOfDay(day).getTime();
  const s = startOfDay(start).getTime();
  if (!end) return t === s;
  const e = startOfDay(end).getTime();
  const lo = Math.min(s, e);
  const hi = Math.max(s, e);
  return t >= lo && t <= hi;
}

function isEndpoint(day, start, end) {
  if (!day || !start) return false;
  if (isSameDay(day, start)) return true;
  if (end && isSameDay(day, end)) return true;
  return false;
}

function formatLong(date) {
  if (!date) return "Not selected";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function dayCountInclusive(start, end) {
  if (!start) return 0;
  if (!end) return 1;
  const s = startOfDay(start).getTime();
  const e = startOfDay(end).getTime();
  return Math.max(1, Math.round(Math.abs(e - s) / 86400000) + 1);
}

/**
 * Minimal campaign date range picker — large day/month header, soft card, brand accent.
 */
export function CampaignDatesPicker({
  calendarMonth,
  onCalendarMonthChange,
  campaignStart,
  campaignEnd,
  onDayClick,
  onQuickSelect,
  className,
}) {
  const days = getCalendarDays(calendarMonth.year, calendarMonth.month);
  const focusDate = campaignEnd || campaignStart;
  const heroDay = focusDate ? startOfDay(focusDate).getDate() : "—";
  const heroMonth = focusDate
    ? MONTHS[startOfDay(focusDate).getMonth()]
    : MONTHS[calendarMonth.month];
  const totalDays = dayCountInclusive(campaignStart, campaignEnd);

  // Visual progress: filled segments scale with selected length (cap at 8)
  const progressSegments = 8;
  const filled = campaignStart ? Math.min(progressSegments, Math.max(1, totalDays)) : 0;

  const shiftMonth = (delta) => {
    const next = new Date(calendarMonth.year, calendarMonth.month + delta, 1);
    onCalendarMonthChange({ year: next.getFullYear(), month: next.getMonth() });
  };

  return (
    <div className={cn("grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] lg:gap-6", className)}>
      <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[2.75rem] font-semibold leading-none tracking-tight text-slate-900 sm:text-5xl">
              {heroDay}
            </p>
            <p className="mt-2 text-base font-medium text-slate-400 sm:text-lg">{heroMonth}</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 ring-1 ring-slate-200">
            <CalendarDays className="h-5 w-5" strokeWidth={1.75} />
          </div>
        </div>

        <div className="mb-5 flex gap-1.5" aria-hidden>
          {Array.from({ length: progressSegments }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                index < filled ? "bg-slate-900" : "bg-slate-200"
              )}
            />
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold text-slate-700 sm:text-base">
            {MONTHS[calendarMonth.month]} {calendarMonth.year}
          </p>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-y-2 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-slate-300">
          {WEEKDAY_SHORT.map((day, index) => (
            <div key={`${day}-${index}`}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day, index) => {
            const inRange = isInRange(day, campaignStart, campaignEnd);
            const endpoint = isEndpoint(day, campaignStart, campaignEnd);
            return (
              <button
                key={index}
                type="button"
                disabled={!day}
                onClick={() => day && onDayClick(day)}
                className={cn(
                  "mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition-colors sm:h-11 sm:w-11 sm:text-[15px]",
                  !day && "invisible pointer-events-none",
                  day && !inRange && "text-slate-600 hover:bg-slate-50",
                  day && inRange && !endpoint && "bg-slate-100 text-slate-800",
                  day &&
                    endpoint &&
                    "bg-slate-900 text-white shadow-[0_8px_18px_rgba(15,23,42,0.22)]"
                )}
              >
                {day ? day.getDate() : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-6">
        <div className="flex items-center gap-2 text-slate-800">
          <CalendarDays className="h-4 w-4" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em]">Campaign window</p>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Start</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-slate-950">
              {campaignStart ? formatLong(campaignStart) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">End</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-slate-950">
              {campaignStart
                ? formatLong(campaignEnd || campaignStart)
                : "—"}
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Total days (inclusive)
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-slate-950">
            {totalDays}
          </p>
        </div>

        <div className="mt-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Quick select</p>
          <p className="mt-1 text-xs text-slate-400">
            From {campaignStart ? "your start date" : "today"} — tap a preset to fill the range.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { label: "1 week", days: 7 },
              { label: "2 weeks", days: 14 },
              { label: "1 month", days: 30 },
              { label: "3 months", days: 90 },
            ].map(({ label, days: count }) => (
              <button
                key={label}
                type="button"
                onClick={() => onQuickSelect?.(count)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-100 hover:text-slate-950"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function createCampaignDayClickHandler(campaignStart, campaignEnd, setCampaignStart, setCampaignEnd) {
  return (day) => {
    if (!day) return;
    const next = startOfDay(day);
    if (!campaignStart || (campaignStart && campaignEnd)) {
      setCampaignStart(next);
      setCampaignEnd(null);
      return;
    }
    const start = startOfDay(campaignStart);
    if (next.getTime() < start.getTime()) {
      setCampaignStart(next);
      setCampaignEnd(start);
    } else {
      setCampaignEnd(next);
    }
  };
}

export function createQuickSelectHandler(campaignStart, setCampaignStart, setCampaignEnd, setCalendarMonth) {
  return (inclusiveDays) => {
    const start = startOfDay(campaignStart || new Date());
    const end = addDays(start, inclusiveDays - 1);
    setCampaignStart(start);
    setCampaignEnd(end);
    setCalendarMonth?.({ year: start.getFullYear(), month: start.getMonth() });
  };
}
