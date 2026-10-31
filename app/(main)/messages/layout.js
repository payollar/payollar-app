import { getCurrentUser } from "@/actions/onboarding";
import CreatorDashboardLayout from "../creator/layout";
import ClientDashboardLayout from "../client/layout";

export const metadata = {
  title: "Messages - Payollar",
  description: "Chat with the other person on a booking.",
};

export default async function MessagesLayout({ children }) {
  const user = await getCurrentUser().catch(() => null);
  const Shell = user?.role === "CLIENT" ? ClientDashboardLayout : CreatorDashboardLayout;

  return <Shell>{children}</Shell>;
}
