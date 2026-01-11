import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { getCreatorServices } from "@/actions/services";
import { CreatorServices } from "../_components/services";

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function CreatorServicesPage() {
  const user = await getCurrentUser();

  if (user?.role !== "CREATOR") {
    redirect("/onboarding");
  }

  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  const servicesData = await getCreatorServices().catch(() => ({ services: [] }));

  return (
    <CreatorServices services={servicesData.services || []} />
  );
}

