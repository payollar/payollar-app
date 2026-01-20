"use client";

import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export default function HeaderAuthButtons() {
  const router = useRouter();
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

  const fetchSession = async (retryCount = 0) => {
    if (!mountedRef.current) return;

    if (errorCountRef.current > 5) {
      setIsCheckingSession(false);
      return false;
    }

    setIsCheckingSession(true);
    try {
      const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${baseURL}/api/auth/check-session`, {
        credentials: 'include',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      
      if (text.includes('<!DOCTYPE') || text.trim().startsWith('<')) {
        errorCountRef.current++;
        setSessionData(null);
        setIsCheckingSession(false);
        return false;
      }
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
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
      } else {
        if (retryCount < 3) {
          setTimeout(() => {
            fetchSession(retryCount + 1);
          }, 500);
          return false;
        }
        return false;
      }
    } catch (error) {
      errorCountRef.current++;
      
      if (error.name === 'AbortError') {
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
  };

  useEffect(() => {
    if (!mounted) return;
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    if (!mounted || sessionData?.user) return;

    const timer = setTimeout(() => {
      if (mountedRef.current && !sessionData?.user) {
        fetchSession();
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, mounted]);

  // Removed useSession hook update effect since we're not using the hook anymore

  useEffect(() => {
    if (!mounted) return;

    const handleStorageChange = (e) => {
      if (e.key === 'better-auth.session' || e.key === null) {
        fetchSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const handleFocus = () => {
      if (!sessionData?.user) {
        fetchSession();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, sessionData?.user]);

  useEffect(() => {
    if (!mounted || sessionData?.user) {
      setIsCheckingSession(false);
      return;
    }

    let checkCount = 0;
    const maxChecks = 2;

    const interval = setInterval(() => {
      checkCount++;
      
      if (checkCount >= maxChecks) {
        clearInterval(interval);
        setIsCheckingSession(false);
        return;
      }
      
      if (!sessionData?.user) {
        fetchSession();
      } else {
        clearInterval(interval);
        setIsCheckingSession(false);
      }
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, sessionData?.user]);

  useEffect(() => {
    if (!mounted) return;

    const handleSessionUpdate = () => {
      fetchSession();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && !sessionData?.user) {
        fetchSession();
      }
    };

    window.addEventListener('auth:session-update', handleSessionUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('auth:session-update', handleSessionUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const hasSession = !!sessionData?.user;
  const isLoading = !mounted || isCheckingSession;

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            // Clear session data immediately
            setSessionData(null);
            setIsCheckingSession(false);
            
            // Trigger events to notify other components
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event('storage'));
              window.dispatchEvent(new CustomEvent('auth:session-update'));
            }
            
            // Redirect to home
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Sign out error:", error);
      }
      setSessionData(null);
      setIsCheckingSession(false);
      router.push("/");
      router.refresh();
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
