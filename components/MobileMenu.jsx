"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import HeaderAuthButtons from "./HeaderAuthButtons";

export default function MobileMenu({ publicNavItems, mediaSubItems, roleNavItems, user }) {
  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 flex flex-col p-6">
        {/* Profile Section at Top */}
        <div className="mb-6">
          <HeaderAuthButtons />
        </div>

        {/* Scrollable nav content */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Media dropdown-style */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide mb-2 text-muted-foreground">
              Media
            </p>
            <div className="flex flex-col gap-2 ml-2">
              {mediaSubItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-2 py-1 text-sm hover:bg-muted hover:text-primary transition"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Public Links */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide mb-2 text-muted-foreground">
              Explore
            </p>
            <div className="flex flex-col gap-2 ml-2">
              {publicNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-2 py-1 text-sm hover:bg-muted hover:text-primary transition"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Role-based Links */}
          {roleNavItems.length > 0 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide mb-2 text-muted-foreground">
                Dashboard
              </p>
              <div className="flex flex-col gap-2 ml-2">
                {roleNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-md px-2 py-1 text-sm hover:bg-muted hover:text-primary transition"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
