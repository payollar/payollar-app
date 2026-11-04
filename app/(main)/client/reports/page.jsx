import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { getClientDeliveryReports } from "@/actions/delivery-reports";
import { ClientDeliveryReports } from "../_components/delivery-reports";

export const dynamic = "force-dynamic";

export default async function ClientReportsPage() {
  const user = await getCurrentUser();

  if (user?.role !== "CLIENT" && user?.role !== "MEDIA_AGENCY") {
    redirect("/onboarding");
  }

  const reportsData = await getClientDeliveryReports().catch(() => ({ reports: [] }));

  return <ClientDeliveryReports reports={reportsData.reports || []} />;
}
