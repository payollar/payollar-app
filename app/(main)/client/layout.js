import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ClientSidebar } from "./_components/client-sidebar";

export const metadata = {
  title: "Payollar — Client",
  description: "Manage campaigns, bookings, and your talent relationships",
};

export default function ClientDashboardLayout({ children }) {
  return (
    <div className="min-h-dvh w-full bg-[radial-gradient(1200px_600px_at_10%_0%,#efe8ff_0%,transparent_55%),radial-gradient(900px_500px_at_100%_100%,#ffe9d6_0%,transparent_50%),#f4f1fb] p-3 md:p-5">
      <div className="h-[calc(100dvh-1.5rem)] rounded-[36px] border border-white bg-white/75 p-2 shadow-[0_30px_80px_rgba(70,50,130,0.12)] md:h-[calc(100dvh-2.5rem)] md:p-2.5">
        <div
          data-client-dashboard-nav=""
          className="relative z-10 h-full w-full overflow-hidden rounded-[28px] bg-[#010104]"
        >
          <SidebarProvider className="h-full overflow-hidden bg-[#010104]">
            <ClientSidebar />
            <SidebarInset className="h-full min-h-0 flex-1 !bg-transparent p-2 md:p-3">
              <div
                data-theme="light"
                className="client-dashboard-panel flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-white/70 bg-white text-slate-900"
              >
                <header className="flex h-12 shrink-0 items-center px-3 md:hidden">
                  <SidebarTrigger className="size-9 shrink-0 text-slate-700 hover:bg-slate-100 hover:text-slate-950" />
                </header>
                <div className="flex min-h-0 flex-1 flex-col overflow-auto px-4 py-4 md:px-6 md:py-5">{children}</div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </div>
    </div>
  );
}
