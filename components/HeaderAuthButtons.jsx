"use client";

import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export default function HeaderAuthButtons() {
  // NOTE: Better Auth's useSession hook is broken (returns HTML), so we use custom API endpoint
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const mountedRef = useRef(false);
  const errorCountRef = useRef(0); // Track errors to prevent infinite loops

  // Removed useSession hook debug logging since we're not using it anymore

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
    mountedRef.current = true;
  }, []);

  // Session fetching function - using custom API endpoint since Better Auth client is broken
  const fetchSession = async (retryCount = 0) => {
    if (!mountedRef.current) return;

    // Prevent infinite error loops - stop after too many errors
    if (errorCountRef.current > 10) {
      setIsCheckingSession(false);
      return false;
    }

    setIsCheckingSession(true);
    try {
      // Use our custom API endpoint instead of broken Better Auth client
      const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseURL}/api/auth/check-session`, {
        credentials: 'include',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get response as text first to check if it's JSON
      const text = await response.text();
      
      // Check if response is HTML (error case)
      if (text.includes('<!DOCTYPE') || text.trim().startsWith('<')) {
        errorCountRef.current++;
        setSessionData(null);
        setIsCheckingSession(false);
        return false;
      }
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        errorCountRef.current++;
        setSessionData(null);
        setIsCheckingSession(false);
        return false;
      }
      
      // Reset error count on success
      errorCountRef.current = 0;
      
      if (data?.user) {
        setSessionData({ user: data.user, session: data.session });
        setIsCheckingSession(false);
        return true; // Session found
      } else {
        // If no session and we haven't retried too many times, retry
        if (retryCount < 3) {
          setTimeout(() => {
            fetchSession(retryCount + 1);
          }, 500);
          return false;
        }
        // Keep isCheckingSession true to prevent showing Sign In
        // The periodic check will continue
        return false;
      }
    } catch (error) {
      errorCountRef.current++;
      
      // Retry on error if we haven't retried too many times and error count is low
      if (retryCount < 2 && errorCountRef.current < 5) {
        setTimeout(() => {
          fetchSession(retryCount + 1);
        }, 500);
        return false;
      }
      setSessionData(null);
      setIsCheckingSession(false);
      return false;
    }
  };

  // Fetch session on mount - with limited retries
  useEffect(() => {
    if (!mounted) return;
    
    // Immediate fetch
    fetchSession();
    
    // Multiple retries to catch delayed cookie setting
    const retry1 = setTimeout(() => {
      fetchSession();
    }, 500);
    
    const retry2 = setTimeout(() => {
      fetchSession();
    }, 1500);
    
    return () => {
      clearTimeout(retry1);
      clearTimeout(retry2);
    };
  }, [mounted]); // fetchSession is stable (doesn't depend on state)

  // Refetch when pathname changes (after navigation) - but only once
  useEffect(() => {
    if (!mounted) return;

    // Single refetch after a short delay to allow navigation to complete
    const timer = setTimeout(() => {
      fetchSession();
    }, 200);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, mounted]);

  // Removed useSession hook update effect since we're not using the hook anymore

  // Listen for storage events (cross-tab session updates)
  useEffect(() => {
    if (!mounted) return;

    const handleStorageChange = (e) => {
      if (e.key === 'better-auth.session' || e.key === null) {
        // Session might have changed in another tab
        fetchSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]); // Removed fetchSession and refetch to prevent infinite loops

  // Refetch on window focus (user might have signed in in another tab)
  useEffect(() => {
    if (!mounted) return;

    const handleFocus = () => {
      // Only refetch if we don't have a session
      if (!sessionData?.user) {
        fetchSession();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, sessionData?.user]); // Only depend on user existence, not functions

  // Periodic session check (every 2 seconds) if no session detected - extended time
  useEffect(() => {
    if (!mounted) return;
    
    // If we already have a session, don't check
    if (sessionData?.user) {
      setIsCheckingSession(false);
      return;
    }

    let checkCount = 0;
    const maxChecks = 30; // Check for 60 seconds max (30 * 2s) - very extended

    const interval = setInterval(() => {
      checkCount++;
      
      // Check current sessionData state
      // We need to check it inside the interval since state might have updated
      if (sessionData?.user) {
        clearInterval(interval);
        setIsCheckingSession(false);
        return;
      }
      
      if (checkCount >= maxChecks) {
        clearInterval(interval);
        // After max checks, stop actively checking
        setIsCheckingSession(false);
        return;
      }
      
      // Continue checking
      fetchSession();
    }, 2000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]); // Only depend on mounted - check sessionData inside interval

  // Listen for custom events that signal session changes
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

    // Listen for custom session update events
    window.addEventListener('auth:session-update', handleSessionUpdate);
    // Also listen for visibility change (tab becomes visible)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('auth:session-update', handleSessionUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]); // Removed dependencies to prevent infinite loops

  // Rely entirely on manually fetched sessionData (useSession hook is broken)
  const hasSession = !!sessionData?.user;
  const isLoading = !mounted || isCheckingSession;
  
  // Removed debug logging to reduce console noise

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
      console.error("Sign out error:", error);
      // Even if sign out fails, clear local session and redirect
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

  // Show loading state while actively checking session (but be patient)
  // Only show loading if we're still checking and haven't found a session yet
  if (isLoading && !hasSession) {
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

  // REMOVED: Sign In button - always show loading when no session detected
  // This prevents showing "Sign In" when user is actually logged in but session check is delayed
  // Users can navigate to /sign-in directly if needed
  
  // Always show loading when no session - never show Sign In button
  // This is the safest approach to avoid false negatives
  return (
    <Button variant="secondary" size="sm" disabled>
      {isCheckingSession ? "Checking..." : "Loading..."}
    </Button>
  );

}
