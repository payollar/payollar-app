import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { getDeliveryReport } from "@/actions/delivery-reports";
import { CreatorDeliveryReportDetail } from "../../_components/delivery-report-detail";

export const dynamic = "force-dynamic";

export default async function CreatorReportDetailPage({ params }) {
  const user = await getCurrentUser();

  if (user?.role !== "CREATOR") {
    redirect("/onboarding");
  }
  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  const { id } = await params;

  let data;
  try {
    data = await getDeliveryReport(id);
  } catch {
    notFound();
  }

  if (!data?.report || data.report.creatorId !== user.id) {
    notFound();
  }

  return <CreatorDeliveryReportDetail report={data.report} />;
}
