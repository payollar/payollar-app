"use client";

import { useEffect } from "react";
import { isChunkLoadError, reloadOnceForChunkError } from "@/lib/chunk-reload";

/**
 * Recovers from Next.js version skew after a deploy:
 * old tabs request hashed chunks the new deployment no longer has.
 */
export function ChunkLoadRecovery() {
  useEffect(() => {
    const onError = (event) => {
      if (isChunkLoadError(event?.error) || isChunkLoadError(event?.message)) {
        reloadOnceForChunkError();
      }
    };

    const onRejection = (event) => {
      if (isChunkLoadError(event?.reason)) {
        event.preventDefault?.();
        reloadOnceForChunkError();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
