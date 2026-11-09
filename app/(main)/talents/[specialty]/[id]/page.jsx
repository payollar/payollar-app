import { getDoctorById, getAvailableTimeSlots } from "@/actions/appointments";
import { recordCreatorProfileView } from "@/actions/profile-views";
import { DoctorProfile } from "./_components/doctor-profile";
import { redirect } from "next/navigation";

function toClientProps(value) {
  // Ensure Prisma / Date values are plain JSON for the client component tree.
  return JSON.parse(JSON.stringify(value));
}

export default async function CreatorProfilePage({ params }) {
  const { id } = await params;

  try {
    // Fetch creator/talent data and available slots in parallel
    // If slots fail, we'll still show the profile with empty slots
    const [doctorData, slotsData] = await Promise.allSettled([
      getDoctorById(id),
      getAvailableTimeSlots(id).catch(() => ({ days: [] })),
    ]);

    const doctor =
      doctorData.status === "fulfilled" ? doctorData.value?.doctor : null;
    const availableDays =
      slotsData.status === "fulfilled" ? slotsData.value?.days || [] : [];

    if (!doctor) {
      redirect("/talents");
    }

    await recordCreatorProfileView(doctor.id).catch(() => null);

    return (
      <DoctorProfile
        doctor={toClientProps(doctor)}
        availableDays={toClientProps(availableDays)}
      />
    );
  } catch (error) {
    console.error("Error loading creator profile:", error);
    redirect("/talents");
  }
}
