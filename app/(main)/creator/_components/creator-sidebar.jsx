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
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/auth-client";
import { toast } from "sonner";
import { SidebarWelcomeCreditsPromo } from "./welcome-credits-card";

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
      <SidebarHeader className="px-3 pb-2 pt-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
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
                const isActive = pathname === item.href || 
                  (item.href !== "/creator" && pathname?.startsWith(item.href));
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
                      <Link href={item.href} onClick={() => setOpenMobile(false)}>
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
          <SidebarWelcomeCreditsPromo />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Help"
              className="rounded-xl !h-10 !bg-transparent !text-white/75 hover:!bg-white/10 hover:!text-white"
            >
              <Link href="/help" onClick={() => setOpenMobile(false)}>
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
