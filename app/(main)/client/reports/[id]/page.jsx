import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { getDeliveryReport } from "@/actions/delivery-reports";
import { ClientDeliveryReportDetail } from "../../_components/delivery-report-detail";

export const dynamic = "force-dynamic";

export default async function ClientReportDetailPage({ params }) {
  const user = await getCurrentUser();

  if (user?.role !== "CLIENT" && user?.role !== "MEDIA_AGENCY") {
    redirect("/onboarding");
  }

  const { id } = await params;

  let data;
  try {
    data = await getDeliveryReport(id);
  } catch {
    notFound();
  }

  if (!data?.report || data.report.clientId !== user.id) {
    notFound();
  }

  return <ClientDeliveryReportDetail report={data.report} />;
}
