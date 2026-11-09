import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/notification-bell";
import { cn } from "@/lib/utils";

/**
 * Shared light dashboard frame used by client, creator, and messages routes.
 * Keep this as a plain component (not a route layout) so other layouts can compose it safely.
 *
 * railTone:
 * - "dark" (default): black left rail used by client / creator / media
 * - "light": white / soft gray rail used by admin
 */
export function DashboardShell({ sidebar, children, panelAttr, railTone = "dark" }) {
  const isLightRail = railTone === "light";

  return (
    <div className="min-h-dvh w-full bg-[#f4f6fb] md:bg-[radial-gradient(1200px_600px_at_10%_0%,#efe8ff_0%,transparent_55%),radial-gradient(900px_500px_at_100%_100%,#ffe9d6_0%,transparent_50%),#f4f1fb] md:p-5">
      <div className="h-dvh bg-white md:h-[calc(100dvh-2.5rem)] md:rounded-[36px] md:border md:border-white md:bg-white/75 md:p-2.5 md:shadow-[0_30px_80px_rgba(70,50,130,0.12)]">
        <div
          {...(panelAttr ? { [panelAttr]: "" } : {})}
          className={cn(
            "relative z-10 h-full w-full overflow-hidden md:rounded-[28px]",
            isLightRail ? "bg-[#f4f6fb]" : "bg-[#010104]"
          )}
        >
          <SidebarProvider
            className={cn(
              "h-full min-w-0 overflow-hidden",
              isLightRail ? "bg-[#f4f6fb]" : "bg-[#010104]"
            )}
          >
            {sidebar}
            <SidebarInset className="h-full min-h-0 min-w-0 flex-1 !bg-transparent md:p-3">
              <div
                data-theme="light"
                className={cn(
                  "flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white text-slate-900 md:rounded-[24px] md:border",
                  isLightRail ? "md:border-slate-950" : "md:border-white/70"
                )}
              >
                <header className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 px-3 md:px-4">
                  <SidebarTrigger className="size-9 shrink-0 text-slate-700 hover:bg-slate-100 hover:text-slate-950 md:hidden" />
                  <span className="text-sm font-semibold text-slate-950 md:hidden">
                    Menu
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <NotificationBell />
                  </div>
                </header>
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-[#f4f6fb] px-3 py-3 md:px-6 md:py-5">
                  {children}
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </div>
    </div>
  );
}
