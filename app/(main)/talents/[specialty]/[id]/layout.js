import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDoctorById } from "@/actions/appointments";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

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

  const backHref = `/talents/${encodeURIComponent(String(doctor.specialty ?? "").trim())}`;

  return (
    <div className="mx-auto w-full max-w-[90rem] px-4 md:px-6">
      <div className="mb-8">
        <Button
          asChild
          variant="glass"
          size="sm"
          className="rounded-full border-border/60"
        >
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {doctor.specialty}
          </Link>
        </Button>
      </div>
      {children}
    </div>
  );
}
