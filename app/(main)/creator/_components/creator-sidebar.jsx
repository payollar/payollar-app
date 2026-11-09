"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import mark from "../../../icon.png";
import {
  LayoutDashboard,
  User,
  BadgeCheck,
  ShoppingBag,
  Calendar,
  ClipboardList,
  FileText,
  MessageCircle,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Wallet,
  Package,
  Trophy,
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
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/auth-client";
import { toast } from "sonner";
import { SidebarWelcomeCreditsPromo } from "./welcome-credits-card";
import {
  formatUnreadBadge,
  useUnreadMessages,
} from "@/hooks/use-unread-messages";
import {
  formatOrdersBadge,
  useActionableOrders,
} from "@/hooks/use-actionable-orders";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/creator",
  },
  {
    title: "Profile",
    icon: User,
    href: "/creator/profile",
  },
  {
    title: "Services",
    icon: BadgeCheck,
    href: "/creator/services",
  },
  {
    title: "Digital Products",
    icon: ShoppingBag,
    href: "/creator/products",
  },
  {
    title: "Orders",
    icon: Calendar,
    href: "/creator/bookings",
  },
  {
    title: "Campaigns",
    icon: FileText,
    href: "/creator/applications",
  },
  {
    title: "Product logistics",
    icon: Package,
    href: "/creator/logistics",
  },
  {
    title: "Reports",
    icon: ClipboardList,
    href: "/creator/reports",
  },
  {
    title: "Disputes",
    icon: Scale,
    href: "/creator/disputes",
  },
  {
    title: "Messages",
    icon: MessageCircle,
    href: "/messages",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/creator/analytics",
  },
  {
    title: "Leaderboard",
    icon: Trophy,
    href: "/creator/leaderboard",
  },
  {
    title: "Earnings",
    icon: Wallet,
    href: "/creator/payouts",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/creator/settings",
  },
];

export function CreatorSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const unreadMessages = useUnreadMessages();
  const unreadLabel = formatUnreadBadge(unreadMessages);
  const actionableOrders = useActionableOrders();
  const ordersLabel = formatOrdersBadge(actionableOrders);

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            // Full page reload avoids client-side transition errors
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

  return (
    <Sidebar
      collapsible="icon"
      className="!border-0 !bg-[#010104] !text-white [&_[data-slot=sidebar-inner]]:!border-0 [&_[data-slot=sidebar-inner]]:!bg-transparent [&_[data-slot=sidebar-inner]]:!text-white [&_[data-slot=sidebar-inner]]:!shadow-none"
    >
      <SidebarHeader className="px-3 pb-1.5 pt-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <Link
          href="/"
          className="flex items-center rounded-xl outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#0055ff]/50"
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
                const isActive = pathname === item.href || 
                  (item.href !== "/creator" && pathname?.startsWith(item.href));
                const isMessages = item.href === "/messages";
                const isOrders = item.href === "/creator/bookings";
                const badgeLabel = isMessages
                  ? unreadLabel
                  : isOrders
                    ? ordersLabel
                    : null;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={
                        badgeLabel ? `${item.title} (${badgeLabel})` : item.title
                      }
                      className={
                        isActive
                          ? "rounded-lg !h-9 !bg-transparent text-[13px] font-medium !text-[#8eb7ff] hover:!bg-white/10 hover:!text-[#8eb7ff] data-[active=true]:!bg-transparent data-[active=true]:!text-[#8eb7ff]"
                          : "rounded-lg !h-9 !bg-transparent text-[13px] !text-white/75 hover:!bg-white/10 hover:!text-white"
                      }
                    >
                      <Link href={item.href} onClick={() => setOpenMobile(false)}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {badgeLabel ? (
                      <SidebarMenuBadge className="!bg-[#0055ff] !text-white peer-hover/menu-button:!text-white peer-data-[active=true]/menu-button:!text-white group-data-[collapsible=icon]:!flex">
                        {badgeLabel}
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
        {/* Compact promo; hide on short laptop viewports so Help/Logout + more nav stay visible */}
        <div className="group-data-[collapsible=icon]:hidden [@media(max-height:760px)]:hidden">
          <SidebarWelcomeCreditsPromo />
        </div>
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Help"
              className="rounded-lg !h-9 !bg-transparent text-[13px] !text-white/75 hover:!bg-white/10 hover:!text-white"
            >
              <Link href="/help" onClick={() => setOpenMobile(false)}>
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
