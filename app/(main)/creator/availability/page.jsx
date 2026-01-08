import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { getDoctorAvailability } from "@/actions/doctor";
import { AvailabilitySettings } from "../_components/availability-settings";

export default async function CreatorAvailabilityPage() {
  const user = await getCurrentUser();

  if (user?.role !== "CREATOR") {
    redirect("/onboarding");
  }

  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  const availabilityData = await getDoctorAvailability().catch(() => ({ slots: [] }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Availability Settings</h1>
        <p className="text-muted-foreground mt-2">
          Set your daily availability schedule so clients can book sessions with you
        </p>
      </div>
      <AvailabilitySettings slots={availabilityData.slots || []} />
    </div>
  );
}
