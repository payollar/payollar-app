"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  AlertCircle,
  Users,
  CreditCard,
  Radio,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ShieldCheck,
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
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/auth-client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin?tab=dashboard",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/admin?tab=analytics",
  },
  {
    title: "All Users",
    icon: Database,
    href: "/admin?tab=users",
  },
  {
    title: "Pending Verification",
    icon: AlertCircle,
    href: "/admin?tab=pending",
  },
  {
    title: "Talents",
    icon: Users,
    href: "/admin?tab=talents",
  },
  {
    title: "Payouts",
    icon: CreditCard,
    href: "/admin?tab=payouts",
  },
  {
    title: "Media Agencies",
    icon: Radio,
    href: "/admin?tab=media-agencies",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState("dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setCurrentTab(params.get("tab") || "dashboard");
    }
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            router.push("/");
            router.refresh();
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

  const isActive = (href) => {
    if (href === "/admin") {
      return pathname === "/admin" && (!currentTab || currentTab === "dashboard");
    }
    if (href.includes("?tab=")) {
      const tab = href.split("?tab=")[1];
      return pathname === "/admin" && currentTab === tab;
    }
    return pathname === href || (href !== "/admin" && pathname?.startsWith(href));
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className={active ? "bg-primary text-white" : ""}
                    >
                      <Link href={item.href}>
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
      <SidebarFooter className="p-4 border-t border-sidebar-border space-y-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Help">
              <Link href="/help">
                <HelpCircle className="h-4 w-4" />
                <span>Help</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              className="w-full" 
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
