import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { getCreatorLogisticsShipments } from "@/actions/logistics";
import { CreatorLogisticsList } from "../_components/logistics-list";

export const dynamic = "force-dynamic";

export default async function CreatorLogisticsPage() {
  const user = await getCurrentUser();

  if (user?.role !== "CREATOR") {
    redirect("/onboarding");
  }
  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  const shipmentsData = await getCreatorLogisticsShipments().catch(() => ({
    shipments: [],
  }));

  return <CreatorLogisticsList shipments={shipmentsData.shipments || []} />;
}
