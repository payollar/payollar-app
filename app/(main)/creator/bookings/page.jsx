import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { getDoctorAppointments } from "@/actions/doctor";
import CreatorAppointmentsList from "../_components/appointments-list";

export default async function CreatorBookingsPage() {
  const user = await getCurrentUser();

  if (user?.role !== "CREATOR") {
    redirect("/onboarding");
  }

  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  const appointmentsData = await getDoctorAppointments();

  return (
    <div className="p-8 bg-black min-h-screen">
      <CreatorAppointmentsList
        appointments={appointmentsData.appointments || []}
      />
    </div>
  );
}

