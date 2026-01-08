import Link from "next/link";
import Image from "next/image";
import { Zap } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default async function Header() {
  const user = await checkUser();

  // Role-based nav
  const roleNavItems = [
    { href: "/client", label: "Client Dashboard", show: user?.role === "CLIENT" },
    { href: "/creator", label: "Creator Dashboard", show: user?.role === "CREATOR" },
    { href: "/admin", label: "Admin Dashboard", show: user?.role === "ADMIN" },
    { href: "/onboarding", label: "Complete Profile", show: user?.role === "UNASSIGNED" },
  ].filter(item => item.show);

  // Public nav (always shown)
  const publicNavItems = [
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

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-20">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* <Zap className="h-6 w-6 text-primary" /> */}
          <Image src="/logo-single.png" alt="Logo" width={160} height={50} />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {/* Media dropdown */}
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              <NavigationMenuItem className="relative">
                <NavigationMenuTrigger>Media</NavigationMenuTrigger>
                <NavigationMenuContent className="absolute left-0 top-full mt-1.5 w-[220px] z-50 bg-popover border rounded-md shadow-md">
                  <ul className="grid gap-3 p-4">
                    {mediaSubItems.map((item) => (
                      <li key={item.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={item.href}
                            className="block rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-primary transition-colors"
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

          {/* Public */}
          {publicNavItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium hover:text-primary transition">
              {item.label}
            </Link>
          ))}

          {/* Role-based */}
          {roleNavItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium hover:text-primary transition">
              {item.label}
            </Link>
          ))}

          {/* Auth */}
          <HeaderAuthButtons />
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          <MobileMenu publicNavItems={publicNavItems} mediaSubItems={mediaSubItems} roleNavItems={roleNavItems} user={user} />
        </div>
      </nav>
    </header>
  );
}
