import { getPatientAppointments, getClientStats } from "@/actions/patient";
import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { ClientOverview } from "./_components/overview";
import { getClientCampaigns } from "@/actions/campaigns";
import { listBookingChats } from "@/actions/booking-chat";

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function ClientDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CLIENT") {
    redirect("/onboarding");
  }

  const [appointmentsData, statsData, campaignsData, chats] = await Promise.all([
    getPatientAppointments(),
    getClientStats().catch(() => ({ stats: {}, recentAppointments: [] })),
    getClientCampaigns().catch(() => ({ campaigns: [] })),
    listBookingChats().catch(() => []),
  ]);

  return (
    <ClientOverview
      stats={{
        ...(statsData.stats || {}),
        companyName: user?.name || "",
      }}
      recentAppointments={statsData.recentAppointments || []}
      appointments={appointmentsData.appointments || []}
      campaigns={campaignsData.campaigns || []}
      chats={chats || []}
    />
  );
}

