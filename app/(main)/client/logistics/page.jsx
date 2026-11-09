import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import {
  getLogisticsStartSources,
  getClientLogisticsShipments,
} from "@/actions/logistics";
import { ClientLogisticsList } from "../_components/logistics-list";

export const dynamic = "force-dynamic";

export default async function ClientLogisticsPage() {
  const user = await getCurrentUser();

  if (user?.role !== "CLIENT" && user?.role !== "MEDIA_AGENCY") {
    redirect("/onboarding");
  }

  const [shipmentsData, sourcesData] = await Promise.all([
    getClientLogisticsShipments().catch(() => ({ shipments: [] })),
    getLogisticsStartSources().catch(() => ({
      sources: [],
      acceptedHires: [],
      bookings: [],
    })),
  ]);

  return (
    <ClientLogisticsList
      shipments={shipmentsData.shipments || []}
      sources={sourcesData.sources || []}
      acceptedHires={sourcesData.acceptedHires || []}
    />
  );
}
