"use client";

import { usePathname } from "next/navigation";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { cn } from "@/lib/utils";

/** Shared landing marketing navbar + content area below fixed header (matches /campaigns). */
export function AuthChrome({ children }) {
  const pathname = usePathname();
  const isMediaAgencyAuth =
    pathname?.startsWith("/media-agency/sign-in") ||
    pathname?.startsWith("/media-agency/sign-up");

  return (
    <div
      className={cn(
        "relative flex min-h-dvh flex-col",
        isMediaAgencyAuth ? "bg-[#f4f6fb]" : "bg-transparent"
      )}
    >
      <LandingNavbar />
      <div className="relative z-10 flex w-full flex-1 flex-col pt-[5.25rem] md:pt-28">
        {children}
      </div>
    </div>
  );
}
