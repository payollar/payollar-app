"use client";

import { usePathname } from "next/navigation";

export function MainWrapper({ children }) {
  const pathname = usePathname();
  
  // Check if we're on a dashboard page (has sidebar) - don't add padding for these
  const isDashboardPage = 
    pathname?.startsWith("/creator") ||
    pathname?.startsWith("/client") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/media-agency");

  return (
    <main className={isDashboardPage ? "flex-1" : "flex-1 pt-16"}>
      {children}
    </main>
  );
}
