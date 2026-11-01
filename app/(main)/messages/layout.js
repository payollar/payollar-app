import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { DashboardShell } from "@/components/dashboard-shell";
import { ClientSidebar } from "../client/_components/client-sidebar";
import { CreatorSidebar } from "../creator/_components/creator-sidebar";

export const metadata = {
  title: "Messages - Payollar",
  description: "Chat with the other person on a booking.",
};

export default async function MessagesLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect_url=/messages");

  const sidebar = user.role === "CLIENT" ? <ClientSidebar /> : <CreatorSidebar />;
  const panelAttr = user.role === "CLIENT" ? "data-client-dashboard-nav" : "data-creator-dashboard-nav";

  return (
    <DashboardShell sidebar={sidebar} panelAttr={panelAttr}>
      {children}
    </DashboardShell>
  );
}
