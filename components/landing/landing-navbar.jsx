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
import {
  LandingThemeToggle,
  useLandingTheme,
} from "@/components/landing/landing-theme";
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
  const { theme: landingTheme } = useLandingTheme();
  const isHome = pathname === "/";
  const homeIsLight = isHome && landingTheme === "light";
  const isHelp = pathname?.startsWith("/help");
  const isContactSupport = pathname?.startsWith("/contact-support");
  const isLegalPage =
    pathname?.startsWith("/privacy") || pathname?.startsWith("/terms");
  const isMediaAgencyAuth =
    pathname?.startsWith("/media-agency/sign-in") ||
    pathname?.startsWith("/media-agency/sign-up");
  const isVerifyEmail = pathname?.startsWith("/verify-email");
  const isLightSurface =
    pathname?.startsWith("/products") ||
    pathname?.startsWith("/rate-cards") ||
    pathname?.startsWith("/media") ||
    isContactSupport ||
    isLegalPage ||
    isMediaAgencyAuth ||
    isVerifyEmail;
  /** Light pill only on select soft pages; verify-email uses dark pill for contrast */
  const useLightPill =
    homeIsLight ||
    isHelp ||
    isContactSupport ||
    isLegalPage ||
    isMediaAgencyAuth;
  const useDarkPill = !useLightPill;
  const linkClass = useDarkPill
    ? "inline-flex h-9 items-center whitespace-nowrap rounded-full px-3 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
    : "inline-flex h-9 items-center whitespace-nowrap rounded-full px-3 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-900/[0.04] hover:text-slate-950";

  return (
    <div className="relative w-full">
      <header
        className={cn(
          "fixed top-4 inset-x-0 z-[100] mx-auto max-w-5xl px-3 transition-all duration-300 ease-in-out md:px-4",
          isOpen ? "min-h-[calc(100dvh-2rem)]" : "h-14"
        )}
      >
        <div
          className={cn(
            "relative flex h-full flex-col overflow-hidden rounded-2xl border backdrop-blur-xl lg:rounded-full",
            useDarkPill
              ? isLightSurface
                ? "border-slate-900/10 bg-[#0b1220]/92 shadow-[0_12px_40px_-16px_rgba(15,23,42,0.45)]"
                : "border-white/10 bg-background/40 shadow-lg shadow-black/20"
              : "border-slate-200/90 bg-white/90 shadow-[0_14px_40px_-18px_rgba(15,23,42,0.22)]"
          )}
        >
          <div className="flex h-14 w-full shrink-0 items-center px-3 sm:px-4">
            <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
              <Link
                href="/"
                className="flex h-9 shrink-0 items-center transition-opacity hover:opacity-90"
              >
                <Image
                  src="/icons/Payollar-logo.png"
                  alt="Payollar"
                  width={132}
                  height={32}
                  className={cn(
                    "h-7 w-auto object-contain",
                    !useDarkPill && "brightness-0"
                  )}
                  priority
                />
              </Link>

              <nav className="ml-1 hidden items-center gap-0.5 lg:flex">
                {showMediaMenu && (
                  <Link href="/media" className={linkClass}>
                    Media
                  </Link>
                )}
                {links.map((item) => (
                  <Link key={item.href} href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
              {isHome ? <LandingThemeToggle /> : null}
              {!isSignedIn && (
                <Link href="/onboarding" className="hidden sm:block">
                  <Button
                    variant={useLightPill ? "default" : "marketingWhite"}
                    size="sm"
                    className={cn(
                      "hidden h-9 rounded-full px-4 md:inline-flex",
                      useLightPill &&
                        "bg-[#0055ff] text-white hover:bg-[#003ecc]"
                    )}
                  >
                    Get started
                  </Button>
                </Link>
              )}
              {isSignedIn && dashboardNav ? (
                <>
                  <div
                    className={cn(
                      "mx-1.5 hidden h-4 w-px sm:block",
                      useDarkPill ? "bg-white/15" : "bg-slate-200"
                    )}
                    aria-hidden
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "hidden h-9 rounded-full px-2.5 sm:inline-flex",
                      useDarkPill
                        ? "text-white/85 hover:!bg-white/10 hover:!text-white focus-visible:!text-white [&_svg]:text-white"
                        : "text-slate-600 hover:bg-slate-900/[0.04] hover:text-slate-950"
                    )}
                    asChild
                  >
                    <Link
                      href={dashboardNav.href}
                      className="inline-flex items-center gap-1.5 text-inherit"
                    >
                      <LayoutDashboard className="size-3.5 shrink-0" />
                      <span className="text-[13px] font-medium">
                        {dashboardNav.label}
                      </span>
                    </Link>
                  </Button>
                </>
              ) : null}
              <div
                className={cn(
                  "flex items-center [&_button]:h-9 [&_button]:rounded-full [&_button]:px-2.5 [&_a]:rounded-full",
                  useDarkPill
                    ? "[&_button]:text-white/80 [&_a]:text-white/80 [&_button:hover]:bg-white/10 [&_button:hover]:text-white"
                    : "[&_button]:text-slate-600 [&_a]:text-slate-600 [&_button:hover]:bg-slate-900/[0.04] [&_button:hover]:text-slate-950"
                )}
              >
                <HeaderAuthButtons />
              </div>
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "h-9 w-9 rounded-full lg:hidden",
                  useDarkPill
                    ? "text-white hover:bg-white/10"
                    : "text-slate-800 hover:bg-slate-900/5"
                )}
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
            useDarkPill={useDarkPill}
          />
        </div>
      </header>
    </div>
  );
}
