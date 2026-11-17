"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LANDING_PUBLIC_NAV } from "@/lib/landing-nav";
import { cn } from "@/lib/utils";

export function DashboardTopNav() {
  const pathname = usePathname();
  const [showMedia, setShowMedia] = useState(false);

  const loadRole = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/check-session", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      const role = data?.user?.role;
      setShowMedia(
        role === "CLIENT" || role === "ADMIN" || role === "MEDIA_AGENCY"
      );
    } catch {
      setShowMedia(false);
    }
  }, []);

  useEffect(() => {
    loadRole();
  }, [loadRole, pathname]);

  const links = [
    ...(showMedia ? [{ href: "/media", label: "Media" }] : []),
    ...LANDING_PUBLIC_NAV.filter((item) => item.href !== "/"),
  ];

  return (
    <nav
      className="pointer-events-none absolute inset-x-0 top-0 hidden h-12 items-center justify-center md:flex"
      aria-label="Primary"
    >
      <div className="pointer-events-auto flex items-center gap-1">
        {links.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex h-8 shrink-0 items-center rounded-full px-3 text-[13px] font-medium transition-colors",
                active
                  ? "bg-slate-100 text-slate-950"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
