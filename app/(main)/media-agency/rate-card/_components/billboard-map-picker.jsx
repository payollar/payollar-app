"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ACCRA = { lat: 5.6037, lng: -0.187 };

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

async function searchPlaces(query) {
  const res = await fetch(
    `/api/geocode/search?q=${encodeURIComponent(query)}`
  );
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
  const [enabled, setEnabled] = useState(
    () => required || (value?.latitude != null && value?.longitude != null)
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);

  const pin = useMemo(() => {
    if (value?.latitude == null || value?.longitude == null) return null;
    return { lat: Number(value.latitude), lng: Number(value.longitude) };
  }, [value]);

  useEffect(() => {
    if (required) setEnabled(true);
    else if (pin) setEnabled(true);
  }, [pin, required]);

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

  const clearPin = () => {
    if (required) {
      toast.message("Billboard sites need a map pin for buyers");
      return;
    }
    onChange?.({ latitude: null, longitude: null });
    setResults([]);
  };

  const handleSearch = async (e) => {
    e?.preventDefault?.();
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    try {
      const hits = await searchPlaces(q);
      setResults(Array.isArray(hits) ? hits : []);
      if (!hits?.length) toast.message("No places found — try a nearby landmark");
    } catch {
      toast.error("Could not search places right now");
    } finally {
      setSearching(false);
    }
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
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search place in Ghana…"
                className="h-10 rounded-xl border-slate-200 bg-white pl-9 shadow-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-slate-200 bg-white"
                disabled={searching}
                onClick={handleSearch}
              >
                {searching ? "Searching…" : "Search"}
              </Button>
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

          {results.length > 0 ? (
            <ul className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {results.map((hit) => (
                <li key={`${hit.place_id}`}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-2 border-b border-slate-100 px-3 py-2.5 text-left text-sm last:border-0 hover:bg-slate-50"
                    onClick={() => {
                      const lat = Number(hit.lat);
                      const lng = Number(hit.lon);
                      setPin(lat, lng, { label: hit.display_name });
                      setResults([]);
                      setQuery(hit.display_name?.split(",")[0] || query);
                    }}
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="line-clamp-2 text-slate-700">
                      {hit.display_name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

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
                  ? "Search, use My location, or click the map to place your site pin"
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
