"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSessionRefresh } from "@/hooks/use-session-refresh";

/** Session user for landing page sections (matches LandingNavbar / check-session). */
export function useLandingSessionUser() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  const fetchUser = useCallback(async () => {
    try {
      const base = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${base}/api/auth/check-session`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      setUser(data?.user ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    fetchUser();
  }, [mounted, pathname, fetchUser]);

  useSessionRefresh(fetchUser);

  useEffect(() => {
    if (!mounted) return;
    const onAuth = () => fetchUser();
    window.addEventListener("auth:session-update", onAuth);
    return () => window.removeEventListener("auth:session-update", onAuth);
  }, [mounted, fetchUser]);

  return { user, isSignedIn: !!user };
}
