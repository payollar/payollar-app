import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { getAgencyMediaNegotiations } from "@/actions/media-negotiate";
import { AgencyNegotiationsDashboard } from "../_components/agency-negotiations";

export const dynamic = "force-dynamic";

export default async function AgencyNegotiationsPage() {
  const user = await getCurrentUser();
  if (user?.role !== "MEDIA_AGENCY") {
    redirect("/onboarding");
  }

  const data = await getAgencyMediaNegotiations().catch(() => ({
    negotiations: [],
  }));

  return (
    <AgencyNegotiationsDashboard negotiations={data.negotiations || []} />
  );
}
