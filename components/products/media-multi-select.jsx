"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Light multi-select for campaign brief fields.
 * Panel portals to body so it is not clipped by parent overflow.
 */
export function MediaMultiSelect({
  options = [],
  values = [],
  onChange,
  placeholder = "Select…",
  searchable = options.length > 8,
  searchPlaceholder = "Search…",
  emptyMessage = "No matches",
  className,
  triggerClassName,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [panelStyle, setPanelStyle] = useState({});
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const searchRef = useRef(null);
  const listId = useId();
  const selected = options.filter((option) => values.includes(option.id));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        (option.hint || "").toLowerCase().includes(q)
    );
  }, [options, query]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePanelPosition = () => {
    const trigger = rootRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const gap = 8;
    const viewportPad = 12;
    const maxPanelHeight = Math.min(360, window.innerHeight - viewportPad * 2);
    const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPad;
    const spaceAbove = rect.top - gap - viewportPad;
    const openUpward = spaceBelow < 220 && spaceAbove > spaceBelow;
    const available = Math.max(160, openUpward ? spaceAbove : spaceBelow);
    const height = Math.min(maxPanelHeight, available);

    setPanelStyle({
      position: "fixed",
      left: Math.max(viewportPad, Math.min(rect.left, window.innerWidth - rect.width - viewportPad)),
      width: Math.min(rect.width, window.innerWidth - viewportPad * 2),
      zIndex: 80,
      maxHeight: height,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + gap, top: "auto" }
        : { top: rect.bottom + gap, bottom: "auto" }),
    });
  };

  useLayoutEffect(() => {
    if (!open) return undefined;
    updatePanelPosition();
    const onScrollOrResize = () => updatePanelPosition();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [open, filtered.length, selected.length]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return undefined;
    }
    const onPointerDown = (event) => {
      const inTrigger = rootRef.current?.contains(event.target);
      const inPanel = panelRef.current?.contains(event.target);
      if (!inTrigger && !inPanel) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => {
      if (searchable) searchRef.current?.focus();
    }, 0);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, searchable]);

  const toggle = (id) => {
    if (values.includes(id)) {
      onChange?.(values.filter((value) => value !== id));
      return;
    }
    onChange?.([...values, id]);
  };

  const remove = (id, event) => {
    event?.stopPropagation();
    onChange?.(values.filter((value) => value !== id));
  };

  const clearAll = (event) => {
    event?.stopPropagation();
    onChange?.([]);
  };

  const panel =
    open && mounted
      ? createPortal(
          <div
            ref={panelRef}
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            style={panelStyle}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]"
          >
            {searchable ? (
              <div className="shrink-0 border-b border-slate-100 p-2">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onClick={(event) => event.stopPropagation()}
                    placeholder={searchPlaceholder}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            ) : null}

            <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5">
              {filtered.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-slate-400">{emptyMessage}</li>
              ) : (
                filtered.map((option) => {
                  const checked = values.includes(option.id);
                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={checked}
                        onClick={() => toggle(option.id)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                          checked ? "bg-slate-50" : "hover:bg-slate-50"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                            checked
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-300 bg-white"
                          )}
                        >
                          {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-slate-900">{option.label}</span>
                          {option.hint ? (
                            <span className="mt-0.5 block text-xs text-slate-400">{option.hint}</span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>

            <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-100 px-3 py-2.5">
              <button
                type="button"
                onClick={clearAll}
                disabled={selected.length === 0}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 disabled:opacity-40"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Done{selected.length > 0 ? ` (${selected.length})` : ""}
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex min-h-11 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm shadow-none transition-colors",
          "hover:border-slate-300 focus-visible:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10",
          open && "border-slate-400 ring-2 ring-slate-900/10",
          triggerClassName
        )}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {selected.length === 0 ? (
            <span className="text-slate-400">{placeholder}</span>
          ) : (
            selected.map((option) => (
              <span
                key={option.id}
                className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800"
              >
                <span className="truncate">{option.label}</span>
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label={`Remove ${option.label}`}
                  onClick={(event) => remove(option.id, event)}
                  className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <X className="h-3 w-3" strokeWidth={2.5} />
                </span>
              </span>
            ))
          )}
        </div>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")}
        />
      </button>
      {panel}
    </div>
  );
}
