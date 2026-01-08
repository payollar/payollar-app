import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { getPatientAppointments } from "@/actions/patient";
import { ClientBookings } from "../_components/bookings";

export default async function ClientBookingsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CLIENT") {
    redirect("/onboarding");
  }

  const appointmentsData = await getPatientAppointments();

  return (
    <ClientBookings 
      appointments={appointmentsData.appointments || []}
      error={appointmentsData.error}
    />
  );
}
