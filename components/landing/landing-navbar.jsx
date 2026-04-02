"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import HeaderAuthButtons from "@/components/HeaderAuthButtons";
import LandingMobileMenu from "@/components/landing/landing-mobile-menu";
import { LANDING_PUBLIC_NAV, getDashboardNavForRole } from "@/lib/landing-nav";
import { useSessionRefresh } from "@/hooks/use-session-refresh";

export function LandingNavbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const fetchUser = useCallback(async () => {
    try {
      const baseURL =
        typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseURL}/api/auth/check-session`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      setUser(data?.user ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchUser();
  }, [mounted, pathname, fetchUser]);

  useSessionRefresh(fetchUser);

  useEffect(() => {
    if (!mounted) return;
    const onAuthUpdate = () => {
      fetchUser();
    };
    window.addEventListener("auth:session-update", onAuthUpdate);
    return () => window.removeEventListener("auth:session-update", onAuthUpdate);
  }, [mounted, fetchUser]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const showMediaMenu =
    user?.role === "CLIENT" ||
    user?.role === "ADMIN" ||
    user?.role === "MEDIA_AGENCY";

  const isSignedIn = !!user;
  const dashboardNav = user?.role ? getDashboardNavForRole(user.role) : null;

  const links = LANDING_PUBLIC_NAV.filter((l) => l.href !== "/");

  return (
    <div className="relative w-full">
      <header
        className={cn(
          "fixed top-4 inset-x-0 mx-auto max-w-6xl px-2 md:px-6 z-[100] transition-all duration-300 ease-in-out",
          isOpen ? "min-h-[calc(100dvh-2rem)]" : "h-14 md:h-16"
        )}
      >
        <div className="backdrop-blur-xl rounded-xl lg:rounded-full border border-white/10 h-full flex flex-col overflow-hidden relative bg-background/40 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between w-full px-3 md:px-4 min-h-14 md:min-h-16 shrink-0">
            <Link
              href="/"
              className="group shrink-0 transition-opacity hover:opacity-90"
            >
              <span
                className="text-[1.35rem] font-semibold tracking-tight text-foreground md:text-2xl [font-family:var(--font-heading)]"
              >
                Payollar
              </span>
            </Link>

            <div className="lg:flex items-center hidden gap-0.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[55%]">
              {showMediaMenu && (
                <Link
                  href="/media"
                  className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
                >
                  Media
                </Link>
              )}
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium px-3 py-1.5 rounded-full text-foreground/70 hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              {!isSignedIn && (
                <Link href="/onboarding" className="hidden sm:block">
                  <Button
                    variant="marketingWhite"
                    size="sm"
                    className="hidden md:inline-flex rounded-full"
                  >
                    Get started
                  </Button>
                </Link>
              )}
              {isSignedIn && dashboardNav && (
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                  <Link
                    href={dashboardNav.href}
                    className="flex max-w-[11rem] items-center gap-1.5 truncate md:max-w-none"
                  >
                    <LayoutDashboard className="size-4 shrink-0" />
                    <span className="truncate text-xs font-medium md:text-sm">
                      {dashboardNav.label}
                    </span>
                  </Link>
                </Button>
              )}
              <div className="flex items-center [&_button]:rounded-full [&_a]:rounded-full">
                <HeaderAuthButtons />
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="lg:hidden rounded-full"
                onClick={() => setIsOpen((o) => !o)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
              >
                {isOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </Button>
            </div>
          </div>

          <LandingMobileMenu
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            links={[...LANDING_PUBLIC_NAV]}
            showMediaMenu={showMediaMenu}
            dashboardNav={dashboardNav}
            isSignedIn={isSignedIn}
          />
        </div>
      </header>
    </div>
  );
}
