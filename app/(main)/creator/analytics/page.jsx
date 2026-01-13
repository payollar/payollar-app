import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { getCreatorAnalytics } from "@/actions/analytics";
import { CreatorAnalyticsClient } from "../_components/creator-analytics";

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function CreatorAnalyticsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CREATOR") {
    redirect("/onboarding");
  }

  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  let analyticsData = {
    productSales: {
      totalRevenue: 0,
      totalEarnings: 0,
      totalPlatformFees: 0,
      totalSales: 0,
      thisMonthRevenue: 0,
      thisMonthEarnings: 0,
      thisMonthSales: 0,
      lastMonthRevenue: 0,
      lastMonthEarnings: 0,
      revenueTrend: 0,
      earningsTrend: 0,
      availableForPayout: 0,
    },
    appointments: {
      total: 0,
      completed: 0,
      scheduled: 0,
      cancelled: 0,
      thisMonth: 0,
      lastMonth: 0,
      trend: 0,
    },
    monthlyData: [],
    topProducts: [],
    categoryBreakdown: [],
    recentSales: [],
    recentAppointments: [],
  };

  try {
    analyticsData = await getCreatorAnalytics();
  } catch (error) {
    console.error("Error fetching analytics:", error);
    // Continue with default data
  }

  return <CreatorAnalyticsClient analytics={analyticsData} user={user} />;
}
