import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { getLogisticsShipment } from "@/actions/logistics";
import {
  getLogisticsDemoShipment,
  isLogisticsDemoId,
} from "@/lib/logistics-demo";
import { CreatorLogisticsDetail } from "../../_components/logistics-detail";

export const dynamic = "force-dynamic";

export default async function CreatorLogisticsDetailPage({ params }) {
  const user = await getCurrentUser();

  if (user?.role !== "CREATOR") {
    redirect("/onboarding");
  }
  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  const { id } = await params;

  if (isLogisticsDemoId(id)) {
    const demo = getLogisticsDemoShipment(id);
    if (!demo) notFound();
    return <CreatorLogisticsDetail shipment={demo} isDemo />;
  }

  const data = await getLogisticsShipment(id).catch(() => null);

  if (!data?.shipment || data.role !== "CREATOR") {
    notFound();
  }

  return <CreatorLogisticsDetail shipment={data.shipment} />;
}
