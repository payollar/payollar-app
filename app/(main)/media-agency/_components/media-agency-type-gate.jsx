"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MediaTypePicker } from "@/components/media/media-type-picker";
import {
  clearStoredMediaAgencyType,
  mediaAgencyTypeLabel,
  readStoredMediaAgencyType,
} from "@/lib/media-agency-type";

/**
 * Blocks the dashboard until primaryMediaType is set (Google / legacy agencies).
 */
export function MediaAgencyTypeGate({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [needsType, setNeedsType] = useState(false);
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = readStoredMediaAgencyType();
        if (stored && !cancelled) setSelected(stored);

        const res = await fetch("/api/media-agency/me");
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (res.status === 404) {
          // No agency row yet — CompleteAgencyProfile handles that
          setNeedsType(false);
          return;
        }

        if (res.ok && data.success) {
          const hasType = Boolean(data.agency?.primaryMediaType);
          setNeedsType(!hasType);
          if (!hasType && stored) setSelected(stored);
        } else {
          setNeedsType(false);
        }
      } catch {
        if (!cancelled) setNeedsType(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    if (!selected) {
      toast.error("Choose your media type");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/media-agency/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primaryMediaType: selected }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save media type");
      }
      clearStoredMediaAgencyType();
      toast.success(
        `${mediaAgencyTypeLabel(selected)} dashboard ready`
      );
      setNeedsType(false);
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!needsType) return children;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#0055ff]">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              One quick step
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              What do you sell?
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              Pick one media type. Listings, rate cards, and tools will match it —
              a TV agency won’t get radio workflows.
            </p>
          </div>
        </div>

        <MediaTypePicker
          value={selected}
          onChange={setSelected}
          disabled={saving}
          tone="dashboard"
        />

        <Button
          type="button"
          className="mt-6 h-11 w-full rounded-full bg-[#0055ff] text-white hover:bg-[#0046d4]"
          disabled={saving || !selected}
          onClick={handleSave}
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Continue to dashboard
        </Button>
      </div>
    </div>
  );
}
