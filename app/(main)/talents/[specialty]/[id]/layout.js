import { getDoctorById } from "@/actions/appointments";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;

  const { doctor } = await getDoctorById(id);
  return {
    title: `${doctor.name} - Creator Profile`,
    description: `Book a session with ${doctor.name}, ${doctor.specialty} creator with ${doctor.experience} years of experience.`,
  };
}

export default async function CreatorProfileLayout({ children, params }) {
  const { id } = await params;
  const { doctor } = await getDoctorById(id);

  if (!doctor) redirect("/talents");

  return <div className="w-full">{children}</div>;
}
