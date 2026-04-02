"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Calendar,
  BarChart3,
  FolderOpen,
  Settings,
  HelpCircle,
  LogOut,
  Wallet,
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
  { title: "Dashboard", icon: LayoutDashboard, href: "/client" },
  { title: "Browse talents", icon: Search, href: "/client/talents" },
  { title: "Bookings", icon: Calendar, href: "/client/bookings" },
  { title: "Campaigns", icon: BarChart3, href: "/client/campaigns" },
  { title: "Media library", icon: FolderOpen, href: "/client/media" },
  { title: "Payouts", icon: Wallet, href: "/client/payouts" },
  { title: "Settings", icon: Settings, href: "/client/settings" },
];

export function ClientSidebar() {
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
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm ring-1 ring-primary/30">
            P
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
              Client
            </p>
            <p className="truncate text-xs text-muted-foreground">Payollar</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/client" && pathname?.startsWith(item.href));
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
            <SidebarMenuButton className="w-full" tooltip="Log out" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
