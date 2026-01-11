"use client";

import { useSession, signOut, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export default function HeaderAuthButtons() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Manually fetch session on mount and when pathname changes
  useEffect(() => {
    if (!mounted) return;

    const fetchSession = async () => {
      setIsCheckingSession(true);
      try {
        const result = await authClient.getSession();
        
        // Better Auth returns { data: { user, session } } or { user, session }
        const sessionResult = result?.data || result;
        
        if (sessionResult?.user) {
          setSessionData(sessionResult);
          if (process.env.NODE_ENV === 'development') {
            console.log('Session detected:', sessionResult.user.email);
          }
        } else {
          setSessionData(null);
          if (process.env.NODE_ENV === 'development') {
            console.log('No session found');
          }
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setSessionData(null);
      } finally {
        setIsCheckingSession(false);
      }
    };

    // Fetch immediately on mount
    fetchSession();

    // Also refetch when pathname changes (after navigation)
    const timer = setTimeout(() => {
      fetchSession();
      refetch(); // Also trigger the hook refetch
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname, mounted, refetch]);

  // Update sessionData when hook session changes
  useEffect(() => {
    if (session?.user) {
      setSessionData(session);
      setIsCheckingSession(false);
    } else if (!isPending && !session?.user && mounted) {
      // Only clear if we're sure there's no session (not pending)
      // But keep existing sessionData if we have it (might be a timing issue)
      if (!sessionData) {
        setSessionData(null);
      }
      setIsCheckingSession(false);
    }
  }, [session, isPending, mounted, sessionData]);

  // Use sessionData if available, otherwise fall back to hook data
  const currentSession = sessionData || session;
  const isLoading = !mounted || isPending || isCheckingSession;

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  // Show loading state while checking session or not mounted
  if (isLoading && !currentSession) {
    return (
      <Button variant="secondary" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  // Show sign in button if no session
  if (!currentSession?.user) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={() => router.push("/sign-in")}
      >
        Sign In
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground hidden md:block">
        {currentSession.user.name || currentSession.user.email}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/profile")}
        className="hidden md:flex items-center gap-2"
      >
        <User className="h-4 w-4" />
        Profile
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden md:inline">Sign Out</span>
      </Button>
    </div>
  );
}
