"use client";

import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSessionRefresh } from "@/hooks/use-session-refresh";

export default function HeaderAuthButtons() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const mountedRef = useRef(false);
  const errorCountRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    mountedRef.current = true;
  }, []);

  const fetchSession = useCallback(async (retryCount = 0) => {
    if (!mountedRef.current) return;

    if (errorCountRef.current > 5) {
      setIsCheckingSession(false);
      return false;
    }

    setIsCheckingSession(true);
    try {
      const baseURL = typeof window !== "undefined" ? window.location.origin : "";

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${baseURL}/api/auth/check-session`, {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();

      if (text.includes("<!DOCTYPE") || text.trim().startsWith("<")) {
        errorCountRef.current++;
        setSessionData(null);
        setIsCheckingSession(false);
        return false;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        errorCountRef.current++;
        setSessionData(null);
        setIsCheckingSession(false);
        return false;
      }

      errorCountRef.current = 0;

      if (data?.user) {
        setSessionData({ user: data.user, session: data.session });
        setIsCheckingSession(false);
        return true;
      }

      if (retryCount < 3) {
        setTimeout(() => {
          fetchSession(retryCount + 1);
        }, 500);
        return false;
      }

      setSessionData(null);
      setIsCheckingSession(false);
      return false;
    } catch (error) {
      errorCountRef.current++;

      if (error.name === "AbortError") {
        setSessionData(null);
        setIsCheckingSession(false);
        return false;
      }

      if (retryCount < 1 && errorCountRef.current < 3) {
        setTimeout(() => {
          fetchSession(retryCount + 1);
        }, 1000);
        return false;
      }
      setSessionData(null);
      setIsCheckingSession(false);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchSession();
  }, [mounted, pathname, fetchSession]);

  useEffect(() => {
    if (!mounted) return;

    const handleStorageChange = (e) => {
      if (e.key === "better-auth.session" || e.key === null) {
        fetchSession();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [mounted, fetchSession]);

  useSessionRefresh(fetchSession);

  useEffect(() => {
    if (!mounted) return;

    const handleSessionUpdate = () => {
      fetchSession();
    };

    window.addEventListener("auth:session-update", handleSessionUpdate);
    return () => window.removeEventListener("auth:session-update", handleSessionUpdate);
  }, [mounted, fetchSession]);

  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") fetchSession();
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [mounted, fetchSession]);

  const hasSession = !!sessionData?.user;
  const isLoading = !mounted || isCheckingSession;

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            // Full page reload avoids client-side transition errors
            window.location.href = "/sign-in";
          },
        },
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Sign out error:", error);
      }
      window.location.href = "/sign-in";
    }
  };

  // Show loading while mounting
  if (!mounted) {
    return (
      <Button variant="secondary" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  // Show loading state while actively checking session (limited time)
  if (isLoading && !hasSession && isCheckingSession) {
    return (
      <Button variant="secondary" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  // If we have a session (from manually fetched data), show only sign out button
  if (hasSession && sessionData?.user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden md:inline">Sign Out</span>
      </Button>
    );
  }

  // If no session after checking, show sign in button
  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className="flex items-center gap-2"
    >
      <Link href="/sign-in">
        <User className="h-4 w-4" />
        <span className="hidden md:inline">Sign In</span>
      </Link>
    </Button>
  );

}
