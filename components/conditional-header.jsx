"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";

export default function ConditionalHeader() {
  const pathname = usePathname();
  if (
    pathname === "/" ||
    pathname?.startsWith("/media") ||
    pathname?.startsWith("/onboarding") ||
    pathname?.startsWith("/talents") ||
    pathname?.startsWith("/chat") ||
    pathname?.startsWith("/campaigns") ||
    pathname?.startsWith("/products") ||
    pathname?.startsWith("/creator") ||
    pathname?.startsWith("/client") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/media-agency") ||
    pathname?.startsWith("/sign-in") ||
    pathname?.startsWith("/sign-up") ||
    pathname?.startsWith("/verify-email") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/reset-password")
  )
    return null;
  return <Header />;
}
