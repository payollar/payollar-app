"use client";

import { useEffect } from "react";

/**
 * Re-validates session when the user returns to the tab or window — keeps client
 * auth UI aligned with Better Auth (sessions can expire while the tab stays open).
 */
export function useSessionRefresh(onRefresh) {
  useEffect(() => {
    const run = () => onRefresh();

    const onFocus = () => run();
    const onVisibility = () => {
      if (document.visibilityState === "visible") run();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [onRefresh]);
}
