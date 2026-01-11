import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { getDoctorAppointments } from "@/actions/doctor";
import { getDoctorEarnings, getDoctorPayouts } from "@/actions/payout";
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

  const [appointmentsData, earningsData, payoutsData] = await Promise.all([
    getDoctorAppointments(),
    getDoctorEarnings(),
    getDoctorPayouts(),
  ]);

  return (
    <OverviewPage
      user={user}
      earnings={earningsData.earnings || {}}
      payouts={payoutsData.payouts || []}
      appointments={appointmentsData.appointments || []}
    />
  );
}
