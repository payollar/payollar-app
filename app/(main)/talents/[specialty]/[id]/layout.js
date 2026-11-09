import { getDoctorById } from "@/actions/appointments";

export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const { doctor } = await getDoctorById(id);

    if (!doctor) {
      return { title: "Creator Profile | Payollar" };
    }

    return {
      title: `${doctor.name} - Creator Profile`,
      description: `Book a session with ${doctor.name}, ${doctor.specialty || "creator"}${
        doctor.experience != null
          ? ` with ${doctor.experience} years of experience`
          : ""
      }.`,
    };
  } catch {
    return { title: "Creator Profile | Payollar" };
  }
}

export default function CreatorProfileLayout({ children }) {
  return <div className="w-full">{children}</div>;
}
