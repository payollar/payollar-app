"use client";

import { usePathname } from "next/navigation";

export function MainWrapper({ children }) {
  const pathname = usePathname();
  
  // Dashboard pages have their own sidebar layout; both use pt-16 for main header space
  const isDashboardPage = 
    pathname?.startsWith("/creator") ||
    pathname?.startsWith("/client") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/media-agency");

  return (
    <main
      className="flex-1 pt-16"
      data-dashboard-layout={isDashboardPage ? "true" : undefined}
    >
      {children}
    </main>
  );
}
