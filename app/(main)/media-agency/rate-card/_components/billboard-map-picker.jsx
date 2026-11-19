"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { Loader2, MapPin, Navigation, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ACCRA = { lat: 5.6037, lng: -0.187 };
const DEBOUNCE_MS = 350;

const MapCanvas = dynamic(() => import("./billboard-map-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[240px] items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
      Loading map…
    </div>
  ),
});

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `/api/geocode/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.display_name || null;
  } catch {
    return null;
  }
}

async function searchPlaces(query, { suggest = false, signal } = {}) {
  const params = new URLSearchParams({ q: query });
  if (suggest) params.set("suggest", "1");
  const res = await fetch(`/api/geocode/search?${params}`, { signal });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Search failed");
  return Array.isArray(data.results) ? data.results : [];
}

/**
 * Live map pin for billboard listings.
 * value: { latitude, longitude } | null
 * required: when true, map stays open and a pin is required for buyers' map view
 */
export function BillboardMapPicker({
  value,
  onChange,
  onLocationLabel,
  required = false,
  className,
}) {
  const listId = useId();
  const wrapRef = useRef(null);
  const abortRef = useRef(null);
  const skipDebounceRef = useRef(false);

  const [enabled, setEnabled] = useState(
    () => required || (value?.latitude != null && value?.longitude != null)
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [noHits, setNoHits] = useState(false);

  const pin = useMemo(() => {
    if (value?.latitude == null || value?.longitude == null) return null;
    return { lat: Number(value.latitude), lng: Number(value.longitude) };
  }, [value]);

  useEffect(() => {
    if (required) setEnabled(true);
    else if (pin) setEnabled(true);
  }, [pin, required]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const setPin = useCallback(
    async (lat, lng, { label, skipReverse = false } = {}) => {
      onChange?.({ latitude: lat, longitude: lng });
      if (label) {
        onLocationLabel?.(label);
        return;
      }
      if (skipReverse) return;
      const place = await reverseGeocode(lat, lng);
      if (place) onLocationLabel?.(place);
    },
    [onChange, onLocationLabel]
  );

  const pickResult = useCallback(
    (hit) => {
      const lat = Number(hit.lat);
      const lng = Number(hit.lon);
      skipDebounceRef.current = true;
      setPin(lat, lng, { label: hit.display_name });
      setQuery(hit.display_name?.split(",")[0] || query);
      setResults([]);
      setOpen(false);
      setActiveIndex(-1);
      setNoHits(false);
    },
    [query, setPin]
  );

  const runSearch = useCallback(async (raw, { suggest = true } = {}) => {
    const q = String(raw || "").trim();
    if (q.length < 2) {
      abortRef.current?.abort();
      setResults([]);
      setSearching(false);
      setNoHits(false);
      setOpen(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSearching(true);
    setNoHits(false);

    try {
      const hits = await searchPlaces(q, {
        suggest,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setResults(hits);
      setActiveIndex(hits.length ? 0 : -1);
      setOpen(true);
      setNoHits(hits.length === 0);
      if (!suggest && !hits.length) {
        toast.message("No places found — try a nearby landmark");
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      setResults([]);
      setOpen(true);
      setNoHits(true);
      if (!suggest) toast.error("Could not search places right now");
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false;
      return;
    }
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setNoHits(false);
      setOpen(false);
      setSearching(false);
      return;
    }

    const t = setTimeout(() => {
      runSearch(q, { suggest: true });
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  const clearPin = () => {
    if (required) {
      toast.message("Billboard sites need a map pin for buyers");
      return;
    }
    onChange?.({ latitude: null, longitude: null });
    setResults([]);
    setOpen(false);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location is not supported in this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setEnabled(true);
        await setPin(latitude, longitude);
        setLocating(false);
        toast.success("Pinned your current location");
      },
      () => {
        setLocating(false);
        toast.error("Could not read your location — allow access or drop a pin");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const showDropdown =
    open && (searching || results.length > 0 || noHits);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Label className="text-sm font-medium text-slate-700">
            Map location{" "}
            {required ? <span className="text-[#0055ff]">*</span> : null}
          </Label>
          <p className="mt-0.5 text-xs text-slate-400">
            {required
              ? "Required — drop a pin so buyers can map this billboard site."
              : "Optional — drop a pin so buyers can see the exact site."}
          </p>
        </div>
        {!required ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-full border-slate-200"
            onClick={() => {
              if (enabled) {
                setEnabled(false);
                onChange?.({ latitude: null, longitude: null });
                setResults([]);
                setOpen(false);
              } else {
                setEnabled(true);
                if (!pin) setPin(ACCRA.lat, ACCRA.lng, { skipReverse: true });
              }
            }}
          >
            <MapPin className="mr-1.5 h-3.5 w-3.5" />
            {enabled ? "Hide map" : "Use map"}
          </Button>
        ) : null}
      </div>

      {enabled ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-[#f7f8fc] p-3 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1" ref={wrapRef}>
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => {
                  if (results.length || noHits || query.trim().length >= 2) {
                    setOpen(true);
                  }
                }}
                placeholder="Start typing a place in Ghana…"
                role="combobox"
                aria-expanded={showDropdown}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={
                  activeIndex >= 0
                    ? `${listId}-option-${activeIndex}`
                    : undefined
                }
                className="h-10 rounded-xl border-slate-200 bg-white pl-9 pr-9 shadow-none"
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    if (!results.length) return;
                    setOpen(true);
                    setActiveIndex((i) =>
                      i < results.length - 1 ? i + 1 : 0
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    if (!results.length) return;
                    setOpen(true);
                    setActiveIndex((i) =>
                      i > 0 ? i - 1 : results.length - 1
                    );
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (open && activeIndex >= 0 && results[activeIndex]) {
                      pickResult(results[activeIndex]);
                    } else {
                      runSearch(query, { suggest: false });
                    }
                  } else if (e.key === "Escape") {
                    setOpen(false);
                  }
                }}
              />
              {searching ? (
                <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
              ) : query ? (
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Clear search"
                  onClick={() => {
                    skipDebounceRef.current = true;
                    setQuery("");
                    setResults([]);
                    setOpen(false);
                    setNoHits(false);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}

              {showDropdown ? (
                <ul
                  id={listId}
                  role="listbox"
                  className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-200/60"
                >
                  {searching && results.length === 0 ? (
                    <li className="px-3 py-2.5 text-sm text-slate-400">
                      Searching…
                    </li>
                  ) : null}
                  {!searching && noHits && results.length === 0 ? (
                    <li className="px-3 py-2.5 text-sm text-slate-400">
                      No places found — try a landmark or area name
                    </li>
                  ) : null}
                  {results.map((hit, index) => (
                    <li
                      key={`${hit.place_id}`}
                      id={`${listId}-option-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                    >
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm",
                          index === activeIndex
                            ? "bg-[#eef2ff] text-slate-950"
                            : "text-slate-700 hover:bg-slate-50"
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => pickResult(hit)}
                      >
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="line-clamp-2">{hit.display_name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-slate-200 bg-white"
                disabled={locating}
                onClick={useMyLocation}
              >
                <Navigation className="mr-1.5 h-4 w-4" />
                {locating ? "…" : "My location"}
              </Button>
            </div>
          </div>

          <MapCanvas
            center={pin || ACCRA}
            pin={pin}
            onPick={(lat, lng) => setPin(lat, lng)}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <p>
              {pin
                ? `${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)} · click map to move pin`
                : required
                  ? "Type to search, use My location, or click the map to place your site pin"
                  : "Click the map to drop a pin"}
            </p>
            {pin && !required ? (
              <button
                type="button"
                onClick={clearPin}
                className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-rose-600"
              >
                <X className="h-3 w-3" />
                Clear pin
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
