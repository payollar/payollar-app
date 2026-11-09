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
  SidebarMenuBadge,
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
import {
  formatUnreadBadge,
  useUnreadMessages,
} from "@/hooks/use-unread-messages";
import {
  formatOrdersBadge,
  useActionableOrders,
} from "@/hooks/use-actionable-orders";

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
          isReportsPath(pathname) &&
          params.section !== "media" &&
          params.section !== "bookings",
      },
      {
        title: "Booking reports",
        href: "/client/reports?section=bookings",
        icon: Users,
        isActive: (pathname, params) =>
          pathname === "/client/reports" && params.section === "bookings",
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
  const unreadMessages = useUnreadMessages();
  const unreadLabel = formatUnreadBadge(unreadMessages);
  const actionableOrders = useActionableOrders();
  const ordersLabel = formatOrdersBadge(actionableOrders);
  const params = {
    section: searchParams?.get("section") || "",
  };

  const routeOpenKeys = {
    reports: isReportsPath(pathname),
  };

  const [openKeys, setOpenKeys] = useState(() => ({
    reports: Boolean(routeOpenKeys.reports),
  }));

  useEffect(() => {
    setOpenKeys((prev) => ({
      reports: prev.reports || routeOpenKeys.reports,
    }));
  }, [routeOpenKeys.reports]);

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
      <SidebarHeader className="px-3 pb-1.5 pt-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
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
            className="h-7 w-auto object-contain group-data-[collapsible=icon]:hidden"
          />
          <Image
            src={mark}
            alt="Payollar"
            width={32}
            height={32}
            className="hidden h-7 w-7 object-contain group-data-[collapsible=icon]:block"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-1 overflow-y-auto overscroll-contain">
        <SidebarGroup className="py-1">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {menuItems.map((item) => {
                const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                const childActive = hasChildren
                  ? item.children.some((child) => child.isActive?.(pathname, params))
                  : false;
                const isOrders = item.key === "orders";
                const isActive =
                  childActive ||
                  (isOrders && isBookingsPath(pathname)) ||
                  pathname === item.href ||
                  (item.href !== "/client" &&
                    !hasChildren &&
                    !isOrders &&
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
                            ? "rounded-lg !h-9 !bg-transparent text-[13px] font-medium !text-[#8eb7ff] hover:!bg-white/10 hover:!text-[#8eb7ff] data-[active=true]:!bg-transparent data-[active=true]:!text-[#8eb7ff]"
                            : "rounded-lg !h-9 !bg-transparent text-[13px] !text-white/75 hover:!bg-white/10 hover:!text-white"
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

                const isMessages = item.href === "/messages";
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={
                        isOrders && ordersLabel
                          ? `${item.title} (${ordersLabel})`
                          : isMessages && unreadLabel
                            ? `${item.title} (${unreadLabel})`
                            : item.title
                      }
                      className={
                        isActive
                          ? "rounded-lg !h-9 !bg-transparent text-[13px] font-medium !text-[#8eb7ff] hover:!bg-white/10 hover:!text-[#8eb7ff] data-[active=true]:!bg-transparent data-[active=true]:!text-[#8eb7ff]"
                          : "rounded-lg !h-9 !bg-transparent text-[13px] !text-white/75 hover:!bg-white/10 hover:!text-white"
                      }
                    >
                      <Link href={item.href} onClick={closeMobile}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {isOrders && ordersLabel ? (
                      <SidebarMenuBadge className="!bg-[#0055ff] !text-white peer-hover/menu-button:!text-white peer-data-[active=true]/menu-button:!text-white group-data-[collapsible=icon]:!flex">
                        {ordersLabel}
                      </SidebarMenuBadge>
                    ) : null}
                    {isMessages && unreadLabel ? (
                      <SidebarMenuBadge className="!bg-[#0055ff] !text-white peer-hover/menu-button:!text-white peer-data-[active=true]/menu-button:!text-white group-data-[collapsible=icon]:!flex">
                        {unreadLabel}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="shrink-0 gap-2 border-t border-white/5 p-2.5 text-white">
        <div className="group-data-[collapsible=icon]:hidden">
          <BorderBeam
            size="sm"
            theme="dark"
            colorVariant="mono"
            strength={0.75}
            borderRadius={14}
            duration={7}
            className="w-full"
          >
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#1a1a1e] via-[#121215] to-[#0a0a0c] px-3 py-2.5">
              <div className="relative flex items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/80">
                  <Megaphone className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">Campaigns</p>
                  <p className="mt-0.5 truncate text-[11px] leading-snug text-white/65">
                    Post a brief and review applications
                  </p>
                </div>
              </div>
              <div className="relative mt-2">
                <MetalFx variant="button" preset="chromatic" theme="dark" strength={0.85}>
                  <Link
                    href="/client/campaigns"
                    onClick={closeMobile}
                    className="inline-flex h-7 w-full items-center justify-center rounded-full bg-slate-950 px-3 text-[11px] font-semibold text-white transition hover:bg-black"
                  >
                    View campaigns
                  </Link>
                </MetalFx>
              </div>
            </div>
          </BorderBeam>
        </div>
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Help"
              className="rounded-lg !h-9 !bg-transparent text-[13px] !text-white/75 hover:!bg-white/10 hover:!text-white"
            >
              <Link href="/help" onClick={closeMobile}>
                <HelpCircle className="h-4 w-4" />
                <span>Help</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-full rounded-lg !h-9 !bg-transparent text-[13px] !text-white/75 hover:!bg-white/10 hover:!text-white"
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
