import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ClientSidebar } from "./_components/client-sidebar";

export const metadata = {
  title: "Payollar — Client",
  description: "Manage campaigns, bookings, and your talent relationships",
};

export default function ClientDashboardLayout({ children }) {
  return (
    <div className="min-h-dvh w-full bg-[#f4f6fb] md:bg-[radial-gradient(1200px_600px_at_10%_0%,#efe8ff_0%,transparent_55%),radial-gradient(900px_500px_at_100%_100%,#ffe9d6_0%,transparent_50%),#f4f1fb] md:p-5">
      <div className="h-dvh bg-white md:h-[calc(100dvh-2.5rem)] md:rounded-[36px] md:border md:border-white md:bg-white/75 md:p-2.5 md:shadow-[0_30px_80px_rgba(70,50,130,0.12)]">
        <div
          data-client-dashboard-nav=""
          className="relative z-10 h-full w-full overflow-hidden bg-[#010104] md:rounded-[28px]"
        >
          <SidebarProvider className="h-full min-w-0 overflow-hidden bg-[#010104]">
            <ClientSidebar />
            <SidebarInset className="h-full min-h-0 min-w-0 flex-1 !bg-transparent md:p-3">
              <div
                data-theme="light"
                className="client-dashboard-panel flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white text-slate-900 md:rounded-[24px] md:border md:border-white/70"
              >
                <header className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 px-3 md:hidden">
                  <SidebarTrigger className="size-9 shrink-0 text-slate-700 hover:bg-slate-100 hover:text-slate-950" />
                  <span className="text-sm font-semibold text-slate-950">Menu</span>
                </header>
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-[#f4f6fb] px-3 py-3 md:px-6 md:py-5">{children}</div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </div>
    </div>
  );
}
