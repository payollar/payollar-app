"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import mark from "../../../icon.png";
import {
  LayoutDashboard,
  Search,
  Calendar,
  ClipboardList,
  MessageCircle,
  BarChart3,
  FolderOpen,
  Settings,
  HelpCircle,
  LogOut,
  Wallet,
  Megaphone,
  Clapperboard,
  ChevronDown,
  Users,
  ListOrdered,
  Package,
  Scale,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/auth-client";
import { toast } from "sonner";
import { BorderBeam } from "border-beam";
import { MetalFx } from "metal-fx";
import { cn } from "@/lib/utils";

function isBookingsPath(pathname) {
  return (
    pathname === "/client/bookings" || pathname?.startsWith("/client/bookings/")
  );
}

function isReportsPath(pathname) {
  return (
    pathname === "/client/reports" || pathname?.startsWith("/client/reports/")
  );
}

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/client" },
  { title: "Browse talents", icon: Search, href: "/client/talents" },
  {
    title: "Orders",
    icon: Calendar,
    href: "/client/bookings",
    key: "orders",
    children: [
      {
        title: "All orders",
        href: "/client/bookings",
        icon: ListOrdered,
        isActive: (pathname, params) =>
          isBookingsPath(pathname) &&
          !["CAMPAIGN", "MEDIA", "TALENT"].includes(params.category || ""),
      },
      {
        title: "Campaign orders",
        href: "/client/bookings?category=CAMPAIGN",
        icon: Megaphone,
        isActive: (pathname, params) =>
          isBookingsPath(pathname) && params.category === "CAMPAIGN",
      },
      {
        title: "Media orders",
        href: "/client/bookings?category=MEDIA",
        icon: Clapperboard,
        isActive: (pathname, params) =>
          isBookingsPath(pathname) && params.category === "MEDIA",
      },
      {
        title: "Talent orders",
        href: "/client/bookings?category=TALENT",
        icon: Users,
        isActive: (pathname, params) =>
          isBookingsPath(pathname) && params.category === "TALENT",
      },
    ],
  },
  { title: "Messages", icon: MessageCircle, href: "/messages" },
  { title: "Disputes", icon: Scale, href: "/client/disputes" },
  { title: "Campaigns", icon: BarChart3, href: "/client/campaigns" },
  { title: "Product logistics", icon: Package, href: "/client/logistics" },
  {
    title: "Reports",
    icon: ClipboardList,
    href: "/client/reports",
    key: "reports",
    children: [
      {
        title: "Campaign reports",
        href: "/client/reports",
        icon: Megaphone,
        isActive: (pathname, params) =>
          isReportsPath(pathname) && params.section !== "media",
      },
      {
        title: "Media proof of airing",
        href: "/client/reports?section=media",
        icon: Clapperboard,
        isActive: (pathname, params) =>
          pathname === "/client/reports" && params.section === "media",
      },
    ],
  },
  { title: "Media bookings", icon: FolderOpen, href: "/client/media" },
  { title: "Payouts", icon: Wallet, href: "/client/payouts" },
  { title: "Settings", icon: Settings, href: "/client/settings" },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setOpenMobile } = useSidebar();
  const params = {
    section: searchParams?.get("section") || "",
    category: searchParams?.get("category") || "",
  };

  const routeOpenKeys = {
    orders: isBookingsPath(pathname),
    reports: isReportsPath(pathname),
  };

  const [openKeys, setOpenKeys] = useState(() => ({
    orders: Boolean(routeOpenKeys.orders),
    reports: Boolean(routeOpenKeys.reports),
  }));

  useEffect(() => {
    setOpenKeys((prev) => ({
      orders: prev.orders || routeOpenKeys.orders,
      reports: prev.reports || routeOpenKeys.reports,
    }));
  }, [routeOpenKeys.orders, routeOpenKeys.reports]);

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            window.location.href = "/sign-in";
          },
          onError: (ctx) => {
            toast.error(ctx.error?.message || "Failed to sign out");
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("An error occurred while signing out");
    }
  };

  const closeMobile = () => setOpenMobile(false);

  const toggleOpen = (key) => {
    setOpenKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Sidebar
      collapsible="icon"
      className="!border-0 !bg-[#010104] !text-white [&_[data-slot=sidebar-inner]]:!border-0 [&_[data-slot=sidebar-inner]]:!bg-transparent [&_[data-slot=sidebar-inner]]:!text-white [&_[data-slot=sidebar-inner]]:!shadow-none"
    >
      <SidebarHeader className="px-3 pb-2 pt-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <Link
          href="/"
          className="flex items-center rounded-xl outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-slate-950/50"
        >
          <Image
            src="/icons/Payollar-logo.png"
            alt="Payollar"
            width={148}
            height={36}
            priority
            className="h-8 w-auto object-contain group-data-[collapsible=icon]:hidden"
          />
          <Image
            src={mark}
            alt="Payollar"
            width={32}
            height={32}
            className="hidden h-8 w-8 object-contain group-data-[collapsible=icon]:block"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                const childActive = hasChildren
                  ? item.children.some((child) => child.isActive?.(pathname, params))
                  : false;
                const isActive =
                  childActive ||
                  pathname === item.href ||
                  (item.href !== "/client" &&
                    !hasChildren &&
                    pathname?.startsWith(item.href));
                const expanded = hasChildren
                  ? Boolean(openKeys[item.key] || routeOpenKeys[item.key])
                  : false;

                if (hasChildren) {
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        type="button"
                        isActive={isActive}
                        tooltip={item.title}
                        onClick={() => toggleOpen(item.key)}
                        className={
                          isActive
                            ? "rounded-xl !h-10 !bg-transparent font-medium !text-[#8eb7ff] hover:!bg-white/10 hover:!text-[#8eb7ff] data-[active=true]:!bg-transparent data-[active=true]:!text-[#8eb7ff]"
                            : "rounded-xl !h-10 !bg-transparent !text-white/75 hover:!bg-white/10 hover:!text-white"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{item.title}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 shrink-0 opacity-70 transition group-data-[collapsible=icon]:hidden",
                            expanded && "rotate-180"
                          )}
                        />
                      </SidebarMenuButton>
                      {expanded ? (
                        <SidebarMenuSub className="!mx-3.5 !border-white/10">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const subActive = Boolean(
                              child.isActive?.(pathname, params)
                            );
                            return (
                              <SidebarMenuSubItem key={child.href}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={subActive}
                                  className={
                                    subActive
                                      ? "!bg-white/10 !text-[#8eb7ff] hover:!bg-white/15 hover:!text-[#8eb7ff]"
                                      : "!text-white/65 hover:!bg-white/10 hover:!text-white"
                                  }
                                >
                                  <Link href={child.href} onClick={closeMobile}>
                                    {ChildIcon ? (
                                      <ChildIcon className="h-3.5 w-3.5" />
                                    ) : null}
                                    <span>{child.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      ) : null}
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={
                        isActive
                          ? "rounded-xl !h-10 !bg-transparent font-medium !text-[#8eb7ff] hover:!bg-white/10 hover:!text-[#8eb7ff] data-[active=true]:!bg-transparent data-[active=true]:!text-[#8eb7ff]"
                          : "rounded-xl !h-10 !bg-transparent !text-white/75 hover:!bg-white/10 hover:!text-white"
                      }
                    >
                      <Link href={item.href} onClick={closeMobile}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-3 p-3 text-white">
        <div className="group-data-[collapsible=icon]:hidden">
          <BorderBeam
            size="md"
            theme="dark"
            colorVariant="mono"
            strength={0.9}
            borderRadius={16}
            duration={7}
            className="w-full"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1e] via-[#121215] to-[#0a0a0c] p-4">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl"
              />
              <p className="relative text-sm font-semibold text-white">Campaigns</p>
              <p className="relative mt-1 text-xs leading-relaxed text-white/70">
                Post a brief and review the applications that come in.
              </p>
              <div className="relative mt-3 inline-flex">
                <MetalFx variant="button" preset="chromatic" theme="dark" strength={0.9}>
                  <Link
                    href="/client/campaigns"
                    onClick={closeMobile}
                    className="inline-flex h-8 items-center rounded-full bg-slate-950 px-3.5 text-xs font-semibold text-white transition hover:bg-black"
                  >
                    View campaigns
                  </Link>
                </MetalFx>
              </div>
            </div>
          </BorderBeam>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Help"
              className="rounded-xl !h-10 !bg-transparent !text-white/75 hover:!bg-white/10 hover:!text-white"
            >
              <Link href="/help" onClick={closeMobile}>
                <HelpCircle className="h-4 w-4" />
                <span>Help</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-full rounded-xl !h-10 !bg-transparent !text-white/75 hover:!bg-white/10 hover:!text-white"
              tooltip="Logout"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
