"use client";

import Link from "next/link";
import Image from "next/image";
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
  const isLightSurface =
    pathname?.startsWith("/products") ||
    pathname?.startsWith("/rate-cards") ||
    pathname?.startsWith("/media");

  return (
    <div className="relative w-full">
      <header
        className={cn(
          "fixed top-4 inset-x-0 mx-auto max-w-6xl px-2 md:px-6 z-[100] transition-all duration-300 ease-in-out",
          isOpen ? "min-h-[calc(100dvh-2rem)]" : "h-14 md:h-16"
        )}
      >
        <div
          className={cn(
            "relative flex h-full flex-col overflow-hidden rounded-xl border backdrop-blur-xl lg:rounded-full",
            // Dark floating pill on light product pages keeps the white logo readable
            isLightSurface
              ? "border-slate-900/10 bg-[#0b1220]/92 shadow-[0_12px_40px_-16px_rgba(15,23,42,0.45)]"
              : "border-white/10 bg-background/40 shadow-lg shadow-black/20"
          )}
        >
          <div className="flex min-h-14 w-full shrink-0 items-center justify-between px-3 md:min-h-16 md:px-4">
            <Link
              href="/"
              className="group shrink-0 transition-opacity hover:opacity-90"
            >
              <Image
                src="/icons/Payollar-logo.png"
                alt="Payollar"
                width={148}
                height={36}
                className="h-8 w-auto object-contain md:h-9"
                priority
              />
            </Link>

            <div className="absolute top-1/2 left-1/2 hidden max-w-[55%] -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 lg:flex">
              {showMediaMenu && (
                <Link
                  href="/media"
                  className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Media
                </Link>
              )}
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-2 md:gap-3">
              {!isSignedIn && (
                <Link href="/onboarding" className="hidden sm:block">
                  <Button
                    variant="marketingWhite"
                    size="sm"
                    className="hidden rounded-full md:inline-flex"
                  >
                    Get started
                  </Button>
                </Link>
              )}
              {isSignedIn && dashboardNav && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden h-9 rounded-full border border-white/40 bg-white/5 px-3.5 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)] hover:border-white/70 hover:bg-white/10 sm:inline-flex"
                  asChild
                >
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
              <div className="flex items-center [&_button]:rounded-full [&_a]:rounded-full [&_button]:text-white [&_a]:text-white">
                <HeaderAuthButtons />
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full text-white hover:bg-white/10 lg:hidden"
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
