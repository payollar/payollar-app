"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Inbox,
  BarChart3,
  Settings,
  Building2,
  LogOut,
  DollarSign,
  FileCheck,
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
    title: "Rate Card",
    icon: DollarSign,
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
    icon: FileText,
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
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-2 px-2 py-4">
          <Building2 className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="font-semibold text-sm">Media Agency</h2>
            <p className="text-xs text-muted-foreground">Dashboard</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
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
      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} className="text-destructive">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
