"use client";

import { useEffect } from "react";
import Link from "next/link";
import { isChunkLoadError, reloadOnceForChunkError } from "@/lib/chunk-reload";

export default function TalentProfileError({ error, reset }) {
  useEffect(() => {
    if (isChunkLoadError(error)) {
      reloadOnceForChunkError();
    }
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
        Couldn’t load this profile
      </h2>
      <p className="max-w-md text-sm text-slate-600 dark:text-slate-300">
        The page assets may be out of date after an update. Refresh, or go back to talents.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (!reloadOnceForChunkError()) reset();
          }}
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-950"
        >
          Refresh
        </button>
        <Link
          href="/talents"
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-950 dark:border-slate-700 dark:text-white"
        >
          Back to talents
        </Link>
      </div>
    </div>
  );
}
