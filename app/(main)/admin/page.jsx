import { TabsContent } from "@/components/ui/tabs";
import { PendingDoctors } from "./components/pending-doctors";
import { VerifiedDoctors } from "./components/verified-doctors";
import { PendingPayouts } from "./components/pending-payouts";
import { PendingMediaAgencies } from "./components/pending-media-agencies";
import { VerifiedMediaAgencies } from "./components/verified-media-agencies";
import {
  getPendingDoctors,
  getVerifiedDoctors,
  getPendingPayouts,
  getPendingMediaAgencies,
  getVerifiedMediaAgencies,
} from "@/actions/admin";

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Fetch all data in parallel
  const [pendingDoctorsData, verifiedDoctorsData, pendingPayoutsData, pendingAgenciesData, verifiedAgenciesData] =
    await Promise.all([
      getPendingDoctors(),
      getVerifiedDoctors(),
      getPendingPayouts(),
      getPendingMediaAgencies(),
      getVerifiedMediaAgencies(),
    ]);

  return (
    <>
      <TabsContent value="pending" className="border-none p-0">
        <PendingDoctors doctors={pendingDoctorsData.doctors || []} />
      </TabsContent>

      <TabsContent value="doctors" className="border-none p-0">
        <VerifiedDoctors doctors={verifiedDoctorsData.doctors || []} />
      </TabsContent>

      <TabsContent value="payouts" className="border-none p-0">
        <PendingPayouts payouts={pendingPayoutsData.payouts || []} />
      </TabsContent>

      <TabsContent value="media-agencies" className="border-none p-0">
        <div className="space-y-6">
          <PendingMediaAgencies agencies={pendingAgenciesData.agencies || []} />
          <div className="mt-6">
            <VerifiedMediaAgencies agencies={verifiedAgenciesData.agencies || []} />
          </div>
        </div>
      </TabsContent>
    </>
  );
}
