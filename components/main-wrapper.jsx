"use client";

import { usePathname } from "next/navigation";

export function MainWrapper({ children }) {
  const pathname = usePathname();
  
  // Dashboard routes: no global header (see ConditionalHeader) — no top padding
  const isDashboardPage =
    pathname?.startsWith("/creator") ||
    pathname?.startsWith("/client") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/media-agency");

  const isHome = pathname === "/";
  const isMediaMarketing = pathname?.startsWith("/media");
  const isServicesMarketplace = pathname?.startsWith("/services");
  const isOnboarding = pathname?.startsWith("/onboarding");
  const isAuthPage =
    pathname?.startsWith("/sign-in") ||
    pathname?.startsWith("/sign-up") ||
    pathname?.startsWith("/verify-email") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/reset-password");

  return (
    <main
      className={
        isHome ||
        isMediaMarketing ||
        isServicesMarketplace ||
        isOnboarding ||
        isDashboardPage ||
        isAuthPage
          ? "flex-1 pt-0"
          : "flex-1 pt-16"
      }
      data-dashboard-layout={isDashboardPage ? "true" : undefined}
    >
      {children}
    </main>
  );
}
