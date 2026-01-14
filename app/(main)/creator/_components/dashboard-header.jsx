import Link from "next/link";
import Image from "next/image";
import { checkUser } from "@/lib/checkUser";
import HeaderAuthButtons from "@/components/HeaderAuthButtons";
import MobileMenu from "@/components/MobileMenu";
import { MobileSidebarTrigger } from "./mobile-sidebar-trigger";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export default async function DashboardHeader() {
  const user = await checkUser();

  // Public nav (always shown)
  const publicNavItems = [
    { href: "/store", label: "Store" },
    { href: "/campaigns", label: "Campaigns" },
    { href: "/talents", label: "Find Talents" },
    { href: "/chat", label: "Payollar AI" },
  ];

  const mediaSubItems = [
    { href: "/media", label: "Buy Media" },
    { href: "/media", label: "Buy Media" },
    { href: "/media/packages", label: "Packages" },
    { href: "/media/schedule", label: "Schedule Media" },
  ];

  // Show media menu only for CLIENT or ADMIN roles (not CREATOR)
  const showMediaMenu = user?.role === "CLIENT" || user?.role === "ADMIN";

  return (
    <header className="flex h-16 shrink-0 items-center border-b bg-background/80 backdrop-blur-md">
      <nav className="w-full px-4 flex items-center justify-between">
        {/* Sidebar Toggle - Mobile ONLY - Completely hidden on desktop */}
        <MobileSidebarTrigger />
        
        {/* Logo - Always show, but adjust spacing */}
        <Link href="/" className="flex items-center gap-2 md:ml-0 ml-2">
          <Image src="/logo-single.png" alt="Logo" width={160} height={50} className="hidden md:block" />
        </Link>

        {/* Desktop Navigation - Show on desktop */}
        <div className="hidden md:flex items-center gap-6 flex-1">
          {/* Media dropdown - only show for CLIENT or ADMIN */}
          {showMediaMenu && (
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
          )}

          {/* Public nav items */}
          {publicNavItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="text-sm font-medium hover:text-primary transition"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Auth buttons - Desktop only, positioned on the right */}
        <div className="hidden md:flex items-center">
          <HeaderAuthButtons />
        </div>

        {/* Mobile Menu - Show on mobile */}
        <div className="md:hidden flex items-center gap-2 ml-auto">
          <MobileMenu 
            publicNavItems={publicNavItems} 
            mediaSubItems={showMediaMenu ? mediaSubItems : []} 
            roleNavItems={[]} 
            user={user} 
          />
        </div>
      </nav>
    </header>
  );
}
