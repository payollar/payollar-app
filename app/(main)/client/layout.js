import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { ClientSidebar } from "./_components/client-sidebar";

export const metadata = {
  title: "Payollar — Client",
  description: "Manage campaigns, bookings, and your talent relationships",
};

export default async function ClientDashboardLayout({ children }) {
  return (
    <div className="relative min-h-dvh w-full bg-background">
      <LandingNavbar />
      <div
        data-client-dashboard-nav=""
        className="relative z-10 w-full min-h-dvh pt-[5.25rem] md:pt-28"
      >
        <SidebarProvider defaultOpen={true}>
          <ClientSidebar />
          <SidebarInset className="relative flex min-h-svh flex-col bg-background">
            <div
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
              aria-hidden
            >
              <div
                className="absolute inset-0 opacity-[0.045] dark:opacity-[0.07]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at center, hsl(var(--foreground)) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="absolute -right-32 top-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
              <div className="absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            </div>
            <header
              data-dashboard-header="true"
              className="flex h-14 shrink-0 items-center border-b border-border/60 bg-background/75 px-3 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55 md:h-16 md:px-4"
            >
              <SidebarTrigger className="size-9 shrink-0" />
            </header>
            <div className="relative flex-1 overflow-auto p-5 md:p-8">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
