import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { getLogisticsShipment } from "@/actions/logistics";
import {
  getLogisticsDemoShipment,
  isLogisticsDemoId,
} from "@/lib/logistics-demo";
import { ClientLogisticsDetail } from "../../_components/logistics-detail";

export const dynamic = "force-dynamic";

export default async function ClientLogisticsDetailPage({ params }) {
  const user = await getCurrentUser();

  if (user?.role !== "CLIENT" && user?.role !== "MEDIA_AGENCY") {
    redirect("/onboarding");
  }

  const { id } = await params;

  if (isLogisticsDemoId(id)) {
    const demo = getLogisticsDemoShipment(id);
    if (!demo) notFound();
    return <ClientLogisticsDetail shipment={demo} isDemo />;
  }

  const data = await getLogisticsShipment(id).catch(() => null);

  if (!data?.shipment || data.role !== "CLIENT") {
    notFound();
  }

  return <ClientLogisticsDetail shipment={data.shipment} />;
}
