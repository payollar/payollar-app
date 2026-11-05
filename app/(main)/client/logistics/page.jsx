import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import {
  getAcceptedHiresForLogistics,
  getClientLogisticsShipments,
} from "@/actions/logistics";
import { ClientLogisticsList } from "../_components/logistics-list";

export const dynamic = "force-dynamic";

export default async function ClientLogisticsPage() {
  const user = await getCurrentUser();

  if (user?.role !== "CLIENT" && user?.role !== "MEDIA_AGENCY") {
    redirect("/onboarding");
  }

  const [shipmentsData, hiresData] = await Promise.all([
    getClientLogisticsShipments().catch(() => ({ shipments: [] })),
    getAcceptedHiresForLogistics().catch(() => ({ acceptedHires: [] })),
  ]);

  return (
    <ClientLogisticsList
      shipments={shipmentsData.shipments || []}
      acceptedHires={hiresData.acceptedHires || []}
    />
  );
}
