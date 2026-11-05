import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { getClientDeliveryReports } from "@/actions/delivery-reports";
import { getClientMediaLibrary } from "@/actions/client-media";
import { ClientDeliveryReports } from "../_components/delivery-reports";

export const dynamic = "force-dynamic";

export default async function ClientReportsPage({ searchParams }) {
  const user = await getCurrentUser();

  if (user?.role !== "CLIENT" && user?.role !== "MEDIA_AGENCY") {
    redirect("/onboarding");
  }

  const params = searchParams ? await searchParams : {};
  const initialSection = params.section === "media" ? "media" : "campaign";

  const [reportsData, mediaData] = await Promise.all([
    getClientDeliveryReports().catch(() => ({ reports: [] })),
    user.role === "CLIENT"
      ? getClientMediaLibrary().catch(() => ({
          bookings: [],
          certificates: [],
          reports: [],
        }))
      : Promise.resolve({ bookings: [], certificates: [], reports: [] }),
  ]);

  return (
    <ClientDeliveryReports
      reports={reportsData.reports || []}
      mediaBookings={mediaData.bookings || []}
      mediaCertificates={mediaData.certificates || []}
      mediaReports={mediaData.reports || []}
      initialSection={initialSection}
    />
  );
}
