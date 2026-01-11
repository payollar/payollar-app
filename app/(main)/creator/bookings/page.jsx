import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { getDoctorAppointments } from "@/actions/doctor";
import CreatorAppointmentsList from "../_components/appointments-list";

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

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
    <CreatorAppointmentsList
      appointments={appointmentsData.appointments || []}
    />
  );
}

