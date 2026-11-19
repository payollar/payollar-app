"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Clock, Check, X } from "lucide-react";
import {
  formatTimeRangeFromClocks,
  parseTimeRangeParts,
} from "@/lib/rate-card-time-range";
import { cn } from "@/lib/utils";

/**
 * Compact cell + floating time picker (portal).
 * Keeps table column width stable — the panel never expands the cell.
 */
export function TimeRangeCell({
  value,
  emptyHint = "Choose time range",
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
}) {
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [coords, setCoords] = useState(null);
  const parsed = parseTimeRangeParts(value);
  const [start, setStart] = useState(parsed.start || "06:00");
  const [end, setEnd] = useState(parsed.end || "10:00");

  useEffect(() => {
    if (!isEditing) return;
    const next = parseTimeRangeParts(value);
    setStart(next.start || "06:00");
    setEnd(next.end || "10:00");
  }, [isEditing, value]);

  useLayoutEffect(() => {
    if (!isEditing || !triggerRef.current) {
      setCoords(null);
      return;
    }

    const place = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const panelWidth = 280;
      const panelHeight = 200;
      const gap = 6;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let left = rect.left;
      if (left + panelWidth > vw - 12) left = Math.max(12, vw - panelWidth - 12);
      if (left < 12) left = 12;

      let top = rect.bottom + gap;
      if (top + panelHeight > vh - 12) {
        top = Math.max(12, rect.top - panelHeight - gap);
      }

      setCoords({ top, left, width: panelWidth });
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) return;

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel?.();
      }
    };

    const onPointerDown = (e) => {
      const t = e.target;
      if (panelRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      onCancel?.();
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [isEditing, onCancel]);

  const isEmpty = !value || !String(value).trim();
  const preview = formatTimeRangeFromClocks(start, end);

  const apply = () => {
    const formatted = formatTimeRangeFromClocks(start, end);
    if (!formatted) return;
    onSave?.(formatted);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={onStartEdit}
        className={cn(
          "flex min-h-[36px] w-full items-center gap-2 rounded px-3 py-2 text-left text-sm transition hover:bg-muted/30",
          isEmpty ? "text-muted-foreground/50" : "text-foreground",
          isEditing && "bg-muted/40 ring-1 ring-[#0055ff]/30"
        )}
      >
        <Clock
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            isEmpty ? "opacity-30" : "text-[#0055ff]"
          )}
        />
        <span className={cn("truncate", isEmpty && "opacity-40")}>
          {isEmpty ? emptyHint : value}
        </span>
      </button>

      {isEditing &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Choose airtime window"
            className="fixed z-[200] rounded-xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15"
            style={{
              top: coords.top,
              left: coords.left,
              width: coords.width,
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                apply();
              }
            }}
          >
            <p className="mb-2.5 text-xs font-medium text-slate-500">
              Choose airtime window
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label
                  htmlFor="tr-start"
                  className="text-[11px] text-slate-500"
                >
                  Starts
                </Label>
                <input
                  id="tr-start"
                  type="time"
                  step={900}
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 outline-none focus:border-[#0055ff] focus:ring-2 focus:ring-[#0055ff]/20"
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="tr-end" className="text-[11px] text-slate-500">
                  Ends
                </Label>
                <input
                  id="tr-end"
                  type="time"
                  step={900}
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 outline-none focus:border-[#0055ff] focus:ring-2 focus:ring-[#0055ff]/20"
                />
              </div>
            </div>
            {preview ? (
              <p className="mt-2 text-center text-xs font-medium text-slate-600">
                {preview}
              </p>
            ) : null}
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-full px-3 text-slate-500"
                onClick={onCancel}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 rounded-full bg-[#0055ff] px-3 text-white hover:bg-[#0046d4]"
                onClick={apply}
                disabled={!preview}
              >
                <Check className="mr-1 h-3.5 w-3.5" />
                Apply
              </Button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

/** @deprecated use TimeRangeCell */
export function TimeRangeCellDisplay(props) {
  return (
    <TimeRangeCell
      value={props.value}
      emptyHint={props.emptyHint}
      isEditing={false}
      onStartEdit={props.onClick}
    />
  );
}

/** @deprecated use TimeRangeCell */
export function TimeRangeCellEditor() {
  return null;
}
