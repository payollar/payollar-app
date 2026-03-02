"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import HeaderAuthButtons from "./HeaderAuthButtons";
import MobileMenu from "./MobileMenu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

// Public nav (always shown)
const publicNavItems = [
  { href: "/", label: "Home" },
  { href: "/store", label: "Store" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/talents", label: "Find Talents" },
  { href: "/chat", label: "Payollar AI" },
];

const mediaSubItems = [
  { href: "/media", label: "Buy Media" },
  { href: "/media/packages", label: "Packages" },
  { href: "/media/schedule", label: "Schedule Media" },
];

export default function Header() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchUser = async () => {
      try {
        const baseURL = typeof window !== "undefined" ? window.location.origin : "";
        const res = await fetch(`${baseURL}/api/auth/check-session`, {
          credentials: "include",
        });
        const data = await res.json();
        setUser(data?.user ?? null);
      } catch {
        setUser(null);
      }
    };

    fetchUser();
  }, [mounted]);

  // Role-based nav - derived from user
  const roleNavItems = [
    { href: "/client", label: "Client Dashboard", show: user?.role === "CLIENT" },
    { href: "/creator", label: "Creator Dashboard", show: user?.role === "CREATOR" },
    { href: "/admin", label: "Admin Dashboard", show: user?.role === "ADMIN" },
    { href: "/media-agency", label: "Media Agency", show: user?.role === "MEDIA_AGENCY" },
    { href: "/onboarding", label: "Complete Profile", show: user?.role === "UNASSIGNED" },
  ].filter((item) => item.show);

  const showMediaMenu =
    user?.role === "CLIENT" || user?.role === "ADMIN" || user?.role === "MEDIA_AGENCY";

  return (
    <header
      data-main-header="true"
      className="fixed top-0 left-0 right-0 w-full border-b bg-background/95 backdrop-blur-md z-30 shadow-sm"
    >
      <nav className="h-16 flex items-center justify-between relative container mx-auto px-4">
        {/* Logo - no link to avoid overlapping with sidebar toggle on dashboard */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Image src="/logo-single.png" alt="Payollar" width={160} height={50} />
        </div>

        {/* Desktop Nav - Aligned to the right */}
        <div className="hidden md:flex items-center justify-end gap-3 md:gap-6 flex-1 min-w-0 ml-auto">
          {showMediaMenu && (
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                <NavigationMenuItem className="relative">
                  <NavigationMenuTrigger className="whitespace-nowrap">Media</NavigationMenuTrigger>
                  <NavigationMenuContent className="left-0 top-full mt-1.5 z-[100] bg-popover border rounded-md shadow-lg">
                    <ul className="grid gap-1 p-2 w-[200px]">
                      {mediaSubItems.map((item) => (
                        <li key={item.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={item.href}
                              className="block select-none rounded-sm px-3 py-2 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              {item.label}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}

          {publicNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs md:text-sm font-medium hover:text-primary transition whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}

          {roleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs md:text-sm font-medium hover:text-primary transition whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}

          <HeaderAuthButtons />
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          <MobileMenu
            publicNavItems={publicNavItems}
            mediaSubItems={showMediaMenu ? mediaSubItems : []}
            roleNavItems={roleNavItems}
            user={user}
          />
        </div>
      </nav>
    </header>
  );
}
