import { getPatientAppointments, getClientStats } from "@/actions/patient";
import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { ClientOverview } from "./_components/overview";
import { getClientCampaigns } from "@/actions/campaigns";

export default async function ClientDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CLIENT") {
    redirect("/onboarding");
  }

  const [appointmentsData, statsData, campaignsData] = await Promise.all([
    getPatientAppointments(),
    getClientStats().catch(() => ({ stats: {}, recentAppointments: [] })),
    getClientCampaigns().catch(() => ({ campaigns: [] })),
  ]);

  return (
    <ClientOverview 
      stats={{
        ...(statsData.stats || {}),
        companyName: user?.name || "TechCorp",
        bookedTalents: appointmentsData.appointments?.length || 0,
        pendingApplications: campaignsData.campaigns?.reduce((acc, c) => acc + (c._count?.applications || 0), 0) || 0,
      }}
      recentAppointments={statsData.recentAppointments || []}
      campaigns={campaignsData.campaigns || []}
    />
  );
}

