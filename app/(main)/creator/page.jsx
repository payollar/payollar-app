import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { getDoctorAppointments } from "@/actions/doctor";
import { getDoctorEarnings, getDoctorPayouts } from "@/actions/payout";
import { getCreatorAnalytics } from "@/actions/analytics";
import { listBookingChats } from "@/actions/booking-chat";
import { getCreatorCampaignApplications } from "@/actions/campaigns";
import { getCreatorWelcomeCreditsStatus } from "@/actions/credits";
import { OverviewPage } from "./_components/overview-page";

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function CreatorDashboardPage() {
  const user = await getCurrentUser();

  if (user?.role !== "CREATOR") {
    redirect("/onboarding");
  }

  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  const [
    appointmentsData,
    earningsData,
    payoutsData,
    analytics,
    chats,
    applicationsData,
    welcomeCredits,
  ] = await Promise.all([
    getDoctorAppointments(),
    getDoctorEarnings(),
    getDoctorPayouts(),
    getCreatorAnalytics().catch((err) => {
      console.error("Error fetching creator analytics:", err);
      return null;
    }),
    listBookingChats().catch(() => []),
    getCreatorCampaignApplications().catch(() => ({ applications: [] })),
    getCreatorWelcomeCreditsStatus().catch(() => null),
  ]);

  return (
    <OverviewPage
      user={user}
      earnings={earningsData.earnings || {}}
      payouts={payoutsData.payouts || []}
      appointments={appointmentsData.appointments || []}
      analytics={analytics}
      chats={chats || []}
      applications={applicationsData.applications || []}
      welcomeCredits={welcomeCredits}
    />
  );
}
