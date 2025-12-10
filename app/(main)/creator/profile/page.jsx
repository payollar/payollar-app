import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { getDoctorAvailability } from "@/actions/doctor";
import { ProfilePage } from "../_components/profile-page";

export default async function CreatorProfilePage() {
  const user = await getCurrentUser();

  if (user?.role !== "CREATOR") {
    redirect("/onboarding");
  }

  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  const availabilityData = await getDoctorAvailability();

  return (
    <ProfilePage user={user} availabilitySlots={availabilityData.slots || []} />
  );
}
