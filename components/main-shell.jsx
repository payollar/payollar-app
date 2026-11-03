"use client";

import { usePathname } from "next/navigation";

/**
 * Route-aware page shell. Prefer client pathname over middleware x-pathname,
 * which is not always readable from server layouts when set only on the response.
 */
export function MainShell({ children }) {
  const pathname = usePathname() || "";

  const isFullBleed =
    pathname.startsWith("/talents") ||
    pathname.startsWith("/campaigns") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/creator") ||
    pathname.startsWith("/client") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/media-agency") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/rate-cards") ||
    pathname.startsWith("/media") ||
    pathname.startsWith("/services") ||
    pathname.startsWith("/clip") ||
    pathname.startsWith("/academy");

  return (
    <div className={isFullBleed ? "w-full" : "container mx-auto my-20"}>
      {children}
    </div>
  );
}
