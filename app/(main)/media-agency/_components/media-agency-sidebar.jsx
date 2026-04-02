"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Inbox,
  BarChart3,
  Settings,
  Building2,
  LogOut,
  Package,
  FileCheck,
  HelpCircle,
  ScrollText,
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

const menuItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    href: "/media-agency",
  },
  {
    title: "Custom Packages",
    icon: Package,
    href: "/media-agency/rate-card",
  },
  {
    title: "Smart Rate Card",
    icon: FileText,
    href: "/media-agency/smart-rate-card",
  },
  {
    title: "Requests",
    icon: Inbox,
    href: "/media-agency/requests",
  },
  {
    title: "Terms & Conditions",
    icon: ScrollText,
    href: "/media-agency/terms",
  },
  {
    title: "Transmission Certificates",
    icon: FileCheck,
    href: "/media-agency/transmission-certificates",
  },
  {
    title: "Reporting",
    icon: BarChart3,
    href: "/media-agency/reporting",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/media-agency/settings",
  },
];

export function MediaAgencySidebar() {
  const pathname = usePathname();

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

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="[&_[data-slot=sidebar-inner]]:border-border/50 [&_[data-slot=sidebar-inner]]:bg-sidebar/95 [&_[data-slot=sidebar-inner]]:shadow-sm [&_[data-slot=sidebar-inner]]:backdrop-blur-md"
    >
      <SidebarHeader className="border-b border-sidebar-border/80 p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl outline-none ring-offset-background transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary font-bold text-sm text-primary-foreground shadow-sm ring-1 ring-primary/30">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate font-semibold tracking-tight text-sidebar-foreground">Media agency</p>
            <p className="truncate text-xs text-muted-foreground">Dashboard</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/media-agency" && pathname?.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={
                        isActive
                          ? "rounded-lg bg-primary !text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary hover:!text-primary-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                          : "rounded-lg"
                      }
                    >
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
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
      <SidebarFooter className="space-y-2 border-t border-sidebar-border/80 p-4">
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
            <SidebarMenuButton className="w-full" tooltip="Logout" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
