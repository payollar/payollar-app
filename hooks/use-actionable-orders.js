"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { formatUnreadBadge } from "@/hooks/use-unread-messages";

/**
 * Polls paid bookings that need Orders-page attention
 * (creator deliverable submit / client review).
 */
export function useActionableOrders({ intervalMs = 30000 } = {}) {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/orders/actionable", {
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

export function formatOrdersBadge(count) {
  return formatUnreadBadge(count);
}
