"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import mark from "../../../icon.png";
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
  Package,
  Percent,
  Truck,
  Megaphone,
  BadgeCheck,
  Scale,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const mainItems = [
  { title: "Overview", icon: LayoutDashboard, href: "/admin?tab=dashboard" },
  { title: "Analytics", icon: BarChart3, href: "/admin?tab=analytics" },
  { title: "All users", icon: Database, href: "/admin?tab=users" },
  { title: "Talents", icon: Users, href: "/admin?tab=talents" },
];

const operationsItems = [
  { title: "Verification", icon: AlertCircle, href: "/admin?tab=pending" },
  { title: "Disputes", icon: Scale, href: "/admin?tab=disputes" },
  { title: "Campaigns", icon: Megaphone, href: "/admin?tab=campaigns" },
  { title: "Logistics", icon: Truck, href: "/admin?tab=logistics" },
  { title: "Negotiations", icon: Percent, href: "/admin?tab=negotiations" },
  { title: "Payouts", icon: CreditCard, href: "/admin?tab=payouts" },
  { title: "Marketplace", icon: Package, href: "/admin?tab=marketplace" },
];

const channelItems = [
  { title: "Media agencies", icon: Radio, href: "/admin?tab=media-agencies" },
];

function itemClass(active) {
  return active
    ? "relative rounded-xl !h-10 !bg-slate-100 font-medium !text-slate-950 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-full before:bg-slate-950 hover:!bg-slate-100 hover:!text-slate-950 data-[active=true]:!bg-slate-100 data-[active=true]:!text-slate-950"
    : "rounded-xl !h-10 !bg-transparent !text-slate-500 hover:!bg-slate-100 hover:!text-slate-950";
}

function NavGroup({ label, items, isActive, onNavigate }) {
  return (
    <SidebarGroup className="!gap-1 !p-0">
      {label ? (
        <SidebarGroupLabel className="!h-7 !px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </SidebarGroupLabel>
      ) : null}
      <SidebarGroupContent>
        <SidebarMenu className="!gap-0.5">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.title}
                  className={itemClass(active)}
                >
                  <Link href={item.href} onClick={onNavigate}>
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setOpenMobile } = useSidebar();
  const { data: session } = useSession();
  const currentTab = searchParams?.get("tab") || "dashboard";
  const userName = session?.user?.name || "Admin";
  const userEmail = session?.user?.email || "admin@payollar.com";
  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "A";

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

  const isActive = (href) => {
    if (href === "/admin/settings") return pathname === "/admin/settings";
    if (href.includes("?tab=")) {
      const tab = href.split("?tab=")[1];
      return pathname === "/admin" && currentTab === tab;
    }
    return pathname === href;
  };

  const closeMobile = () => setOpenMobile(false);

  return (
    <Sidebar
      collapsible="icon"
      className="!border-0 !bg-[#f4f6fb] !text-slate-950 [&_[data-slot=sidebar-inner]]:!border-0 [&_[data-slot=sidebar-inner]]:!bg-transparent [&_[data-slot=sidebar-inner]]:!text-slate-950 [&_[data-slot=sidebar-inner]]:!shadow-none"
    >
      <SidebarHeader className="px-3 pb-2 pt-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <Link
          href="/admin"
          onClick={closeMobile}
          className="flex items-center gap-2.5 rounded-xl outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-slate-950/20"
        >
          <Image
            src="/icons/Payollar-logo.png"
            alt="Payollar"
            width={148}
            height={36}
            priority
            className="h-8 w-auto object-contain brightness-0 group-data-[collapsible=icon]:hidden"
          />
          <Image
            src={mark}
            alt="Payollar"
            width={32}
            height={32}
            className="hidden h-8 w-8 rounded-lg object-cover group-data-[collapsible=icon]:block"
          />
        </Link>
        <p className="mt-2 px-0.5 text-[11px] text-slate-400 group-data-[collapsible=icon]:hidden">
          Admin console
        </p>
      </SidebarHeader>

      <SidebarContent className="gap-5 px-2 pb-2">
        <NavGroup items={mainItems} isActive={isActive} onNavigate={closeMobile} />
        <NavGroup
          label="Operations"
          items={operationsItems}
          isActive={isActive}
          onNavigate={closeMobile}
        />
        <NavGroup
          label="Channels"
          items={channelItems}
          isActive={isActive}
          onNavigate={closeMobile}
        />
      </SidebarContent>

      <SidebarFooter className="mt-auto gap-2 border-t border-slate-200/80 p-3 text-slate-950">
        <SidebarMenu className="!gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Settings"
              isActive={isActive("/admin/settings")}
              className={itemClass(isActive("/admin/settings"))}
            >
              <Link href="/admin/settings" onClick={closeMobile}>
                <Settings className="h-4 w-4 shrink-0" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Support" className={itemClass(false)}>
              <Link href="/help" onClick={closeMobile}>
                <HelpCircle className="h-4 w-4 shrink-0" />
                <span>Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={cn(itemClass(false), "w-full")}
              tooltip="Logout"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:shadow-none">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="flex items-center gap-1 truncate text-sm font-semibold text-slate-950">
              <span className="truncate">{userName}</span>
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-slate-950" />
            </p>
            <p className="truncate text-[11px] text-slate-500">{userEmail}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
