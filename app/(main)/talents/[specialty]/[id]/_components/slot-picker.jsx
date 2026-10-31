"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function SlotPicker({ days, onSelectSlot }) {
  const firstDayWithSlots = days.find((day) => day.slots.length > 0)?.date || days[0]?.date;
  const [activeDay, setActiveDay] = useState(firstDayWithSlots);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const day = days.find((item) => item.date === activeDay) || days[0];

  return (
    <div className="space-y-5 text-slate-900">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((item) => {
          const open = item.slots.length > 0;
          const selected = item.date === day?.date;
          return (
            <button
              key={item.date}
              type="button"
              disabled={!open}
              onClick={() => {
                setActiveDay(item.date);
                setSelectedSlot(null);
              }}
              className={cn(
                "shrink-0 rounded-2xl border px-3 py-2 text-left",
                selected
                  ? "border-[#6d28d9] bg-[#f5f3ff]"
                  : "border-slate-200 bg-white hover:border-slate-300",
                !open && "cursor-not-allowed opacity-40"
              )}
            >
              <span className="block text-xs text-slate-500">{format(new Date(item.date), "EEE")}</span>
              <span className="block text-sm font-semibold">{format(new Date(item.date), "MMM d")}</span>
              <span className="block text-[11px] text-slate-400">{open ? `${item.slots.length} open` : "Full"}</span>
            </button>
          );
        })}
      </div>

      {day?.slots.length ? (
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{day.displayDate}</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {day.slots.map((slot) => {
              const selected = selectedSlot?.startTime === slot.startTime;
              return (
                <button
                  key={slot.startTime}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm",
                    selected
                      ? "border-[#6d28d9] bg-[#f5f3ff] font-medium text-[#6d28d9]"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {format(new Date(slot.startTime), "h:mm a")}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
          No open times on this day.
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => selectedSlot && onSelectSlot(selectedSlot)}
          disabled={!selectedSlot}
          className="inline-flex items-center gap-1 rounded-xl bg-[#6d28d9] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5b21b6] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Continue
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
