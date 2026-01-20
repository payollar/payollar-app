import Link from "next/link";
import Image from "next/image";
import { checkUser } from "@/lib/checkUser";
import HeaderAuthButtons from "./HeaderAuthButtons";
import MobileMenu from "./MobileMenu";
import { headers } from "next/headers";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export default async function Header() {
  let user = null;
  try {
    user = await checkUser();
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Header checkUser error:', error);
    }
    // Continue with null user - don't block the header from rendering
    user = null;
  }
  
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // Check if we're on a dashboard page (has sidebar)
  const isDashboardPage = 
    pathname.startsWith("/creator") ||
    pathname.startsWith("/client") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/media-agency");

  // Role-based nav
  const roleNavItems = [
    { href: "/client", label: "Client Dashboard", show: user?.role === "CLIENT" },
    { href: "/creator", label: "Creator Dashboard", show: user?.role === "CREATOR" },
    { href: "/admin", label: "Admin Dashboard", show: user?.role === "ADMIN" },
    { href: "/media-agency", label: "Media Agency", show: user?.role === "MEDIA_AGENCY" },
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

  // Show media menu only for CLIENT or ADMIN roles (not CREATOR)
  const showMediaMenu = user?.role === "CLIENT" || user?.role === "ADMIN";

  return (
    <header className={`fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-20 overflow-visible ${isDashboardPage ? 'md:left-[15rem] md:w-[calc(100%-15rem)]' : ''}`}>
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between overflow-visible">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Image src="/logo-single.png" alt="Logo" width={160} height={50} />
        </Link>

        {/* Desktop Nav - Show on desktop always, and on mobile for dashboard pages */}
        <div className={`${isDashboardPage ? 'flex' : 'hidden md:flex'} items-center justify-end gap-3 md:gap-6 overflow-visible flex-1 min-w-0`}>
          {/* Media dropdown - only show for CLIENT or ADMIN */}
          {showMediaMenu && (
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                <NavigationMenuItem className="relative">
                  <NavigationMenuTrigger className="whitespace-nowrap">Media</NavigationMenuTrigger>
                  <NavigationMenuContent className="left-0 top-full mt-1.5 z-[100]">
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

          {/* Public */}
          {publicNavItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-xs md:text-sm font-medium hover:text-primary transition whitespace-nowrap">
              {item.label}
            </Link>
          ))}

          {/* Role-based */}
          {roleNavItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-xs md:text-sm font-medium hover:text-primary transition whitespace-nowrap">
              {item.label}
            </Link>
          ))}

          {/* Auth */}
          <HeaderAuthButtons />
        </div>

        {/* Mobile Menu - Only show on non-dashboard pages */}
        {!isDashboardPage && (
          <div className="md:hidden flex items-center gap-2">
            <MobileMenu 
              publicNavItems={publicNavItems} 
              mediaSubItems={showMediaMenu ? mediaSubItems : []} 
              roleNavItems={roleNavItems} 
              user={user} 
            />
          </div>
        )}
      </nav>
    </header>
  );
}
