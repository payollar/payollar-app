"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  formatCompactCount,
  getFrequencyMultiplier,
} from "@/lib/media-planner-pricing";

const FREQUENCY_HINTS = {
  once: "1 airing per time block each day",
  "2x": "Twice within the time block",
  "3x": "Three times within the time block",
  "5x": "Five times within the time block",
  hourly: "Once every hour while the block is on air",
};

const DAY_PRESETS = [
  {
    id: "weekdays",
    label: "Weekdays",
    days: [false, true, true, true, true, true, false],
  },
  {
    id: "weekend",
    label: "Weekend",
    days: [true, false, false, false, false, false, true],
  },
  {
    id: "everyday",
    label: "Every day",
    days: [true, true, true, true, true, true, true],
  },
];

function sameDayPattern(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  return a.every((value, index) => Boolean(value) === Boolean(b[index]));
}

function formatDayRange(weekdays, activeDays) {
  const selected = weekdays.filter((_, index) => activeDays[index]);
  if (selected.length === 0) return "No days selected";
  if (selected.length === 7) return "Every day";
  if (sameDayPattern(activeDays, DAY_PRESETS[0].days)) return "Mon–Fri";
  if (sameDayPattern(activeDays, DAY_PRESETS[1].days)) return "Sat–Sun";
  return selected.join(", ");
}

function frequencyLabel(frequencyOptions, id) {
  return frequencyOptions.find((option) => option.id === id)?.label || id;
}

/**
 * Per-slot frequency + shared active-days controls for the media scheduler.
 */
export function MediaFrequencyStep({
  slots = [],
  frequencyOptions,
  frequencyBySlotId = {},
  onFrequencyChange,
  onApplyFrequencyToAll,
  weekdays,
  activeDays,
  onToggleDay,
  onSetDays,
  dayCount = 1,
  className,
}) {
  const activeCount = activeDays.filter(Boolean).length;
  const daySummary = formatDayRange(weekdays, activeDays);
  const defaultFrequencyId = frequencyOptions[0]?.id || "once";
  const days = Math.max(1, dayCount || 1);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid items-start gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Spot frequency
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Set how often each selected airtime slot should air.
              </p>
            </div>
            {slots.length > 1 && onApplyFrequencyToAll ? (
              <button
                type="button"
                onClick={() =>
                  onApplyFrequencyToAll(
                    frequencyBySlotId[slots[0]?.id] || defaultFrequencyId
                  )
                }
                className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
              >
                Match all to first
              </button>
            ) : null}
          </div>

          {slots.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              Select airtime slots in the previous step to set frequency per spot.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {slots.map((slot) => {
                const value = frequencyBySlotId[slot.id] || defaultFrequencyId;
                const hint = FREQUENCY_HINTS[value];
                const perAiring =
                  slot.impressionsPerAiring != null && Number(slot.impressionsPerAiring) > 0
                    ? Math.round(Number(slot.impressionsPerAiring))
                    : null;
                const multiplier = getFrequencyMultiplier(value, slot.range);
                const slotImpressions =
                  perAiring != null ? Math.round(perAiring * days * multiplier) : null;
                const impressionsLabel = formatCompactCount(slotImpressions);
                const perAiringLabel = formatCompactCount(perAiring);
                return (
                  <div
                    key={slot.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{slot.label}</p>
                        {slot.range ? (
                          <p className="mt-0.5 text-xs text-slate-400">{slot.range}</p>
                        ) : null}
                      </div>
                      <Select
                        value={value}
                        onValueChange={(next) => onFrequencyChange?.(slot.id, next)}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-10 w-full rounded-xl border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 shadow-none sm:w-[11.5rem]",
                            "focus-visible:border-slate-400 focus-visible:ring-slate-900/15"
                          )}
                        >
                          <SelectValue placeholder="Frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencyOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
                      {impressionsLabel ? (
                        <p className="text-xs font-medium tabular-nums text-slate-600">
                          Est. {impressionsLabel} impressions
                          {perAiringLabel ? (
                            <span className="font-normal text-slate-400">
                              {" "}
                              · {perAiringLabel}/airing
                              {slot.impressionsSource !== "agency" ? " · demo" : ""}
                            </span>
                          ) : null}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Active broadcast days
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Spots only run on the days you leave on. Weekday vs weekend
                rates follow this when the rate card has both.
              </p>
            </div>
            <p className="text-xs font-medium tabular-nums text-slate-400">{activeCount}/7 days</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {DAY_PRESETS.map((preset) => {
              const active = sameDayPattern(activeDays, preset.days);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSetDays?.(preset.days.slice())}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900"
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {weekdays.map((label, index) => {
              const on = Boolean(activeDays[index]);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onToggleDay?.(index)}
                  aria-pressed={on}
                  className={cn(
                    "flex h-12 items-center justify-center rounded-2xl text-sm font-semibold transition-all sm:h-14",
                    on
                      ? "bg-slate-900 text-white shadow-[0_8px_18px_rgba(15,23,42,0.2)]"
                      : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/25 focus-visible:ring-offset-2"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Schedule summary
            </p>
            <ul className="mt-2 space-y-1.5">
              {slots.length === 0 ? (
                <li className="text-sm text-slate-500">No spots selected yet</li>
              ) : (
                slots.map((slot) => {
                  const freqId = frequencyBySlotId[slot.id] || defaultFrequencyId;
                  const perAiring =
                    slot.impressionsPerAiring != null && Number(slot.impressionsPerAiring) > 0
                      ? Math.round(Number(slot.impressionsPerAiring))
                      : null;
                  const impressionsLabel =
                    perAiring != null
                      ? formatCompactCount(
                          perAiring * days * getFrequencyMultiplier(freqId, slot.range)
                        )
                      : null;
                  return (
                    <li key={slot.id} className="text-sm text-slate-900">
                      <span className="font-semibold">{slot.label}</span>
                      <span className="text-slate-400"> · </span>
                      <span className="font-medium">
                        {frequencyLabel(frequencyOptions, freqId)}
                      </span>
                      {impressionsLabel ? (
                        <>
                          <span className="text-slate-400"> · </span>
                          <span className="font-medium tabular-nums text-slate-600">
                            ~{impressionsLabel}
                          </span>
                        </>
                      ) : null}
                    </li>
                  );
                })
              )}
            </ul>
            <p className="mt-3 border-t border-slate-200/80 pt-3 text-sm font-semibold text-slate-900">
              Days
              <span className="font-normal text-slate-400"> · </span>
              {daySummary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
