import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { getDoctorAvailability } from "@/actions/doctor";
import { AvailabilitySettings } from "../_components/availability-settings";

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function CreatorAvailabilityPage() {
  const user = await getCurrentUser();

  if (user?.role !== "CREATOR") {
    redirect("/onboarding");
  }

  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  const availabilityData = await getDoctorAvailability().catch(() => ({ slots: [] }));

  return <AvailabilitySettings slots={availabilityData.slots || []} />;
}
