import Link from "next/link";
import Image from "next/image";
import { Zap, CreditCard } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import { checkAndAllocateCredits } from "@/actions/credits";
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

  if (user?.role === "PATIENT") {
    await checkAndAllocateCredits(user);
  }

  // Role-based nav
  const roleNavItems = [
    { href: "/appointments", label: "Appointments", show: user?.role === "PATIENT" },
    { href: "/pricing", label: "Pricing", show: user?.role === "PATIENT" },
    { href: "/doctor", label: "Talent Dashboard", show: user?.role === "DOCTOR" },
    { href: "/admin", label: "Admin Dashboard", show: user?.role === "ADMIN" },
    { href: "/onboarding", label: "Complete Profile", show: user?.role === "UNASSIGNED" },
  ].filter(item => item.show);

  // Public nav (always shown)
  const publicNavItems = [
    { href: "/media", label: "For Company" },
    { href: "/", label: "For Creators" },
  ];

  const mediaSubItems = [
    { href: "/products/tv-media", label: "Book TV media" },
    { href: "/products/radio", label: "Book Radio media" },
    { href: "/product/digital-media", label: "Digital Marketing" },
    { href: "/product/billboard-media", label: "Billboard Marketing" },
  ];

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-20">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <Image src="/logo-single.png" alt="Logo" width={160} height={50} />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {/* Media dropdown */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Media</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 w-[200px]">
                    {mediaSubItems.map((item) => (
                      <li key={item.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={item.href}
                            className="block rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-primary"
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

          {/* Credits */}
          {(!user || user?.role !== "ADMIN") && (
            <Link href={user?.role === "PATIENT" ? "/pricing" : "/doctor"}>
              <Badge className="h-9 bg-emerald-900/20 border-emerald-700/30 px-3 py-1 flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">
                  {user
                    ? `${user.credits} ${user.role === "PATIENT" ? "Credits" : "Earned"}`
                    : "Pricing"}
                </span>
              </Badge>
            </Link>
          )}

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
