"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Polls unread booking-message count for sidebar badges.
 */
export function useUnreadMessages({ intervalMs = 30000 } = {}) {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/unread", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setCount(Number(data?.count) || 0);
    } catch {
      // Keep last known count on transient failures
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh, pathname]);

  useEffect(() => {
    if (!intervalMs || intervalMs < 5000) return undefined;
    const timer = setInterval(refresh, intervalMs);
    return () => clearInterval(timer);
  }, [refresh, intervalMs]);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  return count;
}

export function formatUnreadBadge(count) {
  const n = Number(count) || 0;
  if (n <= 0) return null;
  if (n > 99) return "99+";
  return String(n);
}
