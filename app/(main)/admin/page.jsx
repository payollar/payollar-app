"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { UsersDashboard } from "./components/users-dashboard";
import { PendingDoctors } from "./components/pending-doctors";
import { VerifiedDoctors } from "./components/verified-doctors";
import { PendingPayouts } from "./components/pending-payouts";
import { PendingMediaAgencies } from "./components/pending-media-agencies";
import { VerifiedMediaAgencies } from "./components/verified-media-agencies";
import { AnalyticsDashboard } from "./_components/analytics-dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function AdminPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab") || "dashboard";
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [
          usersRes,
          statsRes,
          pendingDoctorsRes,
          verifiedDoctorsRes,
          pendingPayoutsRes,
          pendingAgenciesRes,
          verifiedAgenciesRes,
          analyticsRes,
        ] = await Promise.all([
          fetch("/api/admin/users?page=1&limit=50").then(r => r.json()),
          fetch("/api/admin/stats").then(r => r.json()),
          fetch("/api/admin/pending-doctors").then(r => r.json()),
          fetch("/api/admin/verified-doctors").then(r => r.json()),
          fetch("/api/admin/pending-payouts").then(r => r.json()),
          fetch("/api/admin/pending-agencies").then(r => r.json()),
          fetch("/api/admin/verified-agencies").then(r => r.json()),
          fetch("/api/admin/analytics").then(r => r.json()),
        ]);

        setData({
          users: usersRes.success ? usersRes : null,
          stats: statsRes.success ? statsRes.stats : null,
          pendingDoctors: pendingDoctorsRes.success ? pendingDoctorsRes : null,
          verifiedDoctors: verifiedDoctorsRes.success ? verifiedDoctorsRes : null,
          pendingPayouts: pendingPayoutsRes.success ? pendingPayoutsRes : null,
          pendingAgencies: pendingAgenciesRes.success ? pendingAgenciesRes : null,
          verifiedAgencies: verifiedAgenciesRes.success ? verifiedAgenciesRes : null,
          analytics: analyticsRes.success ? analyticsRes.analytics : null,
        });
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show analytics dashboard by default or when tab is dashboard/analytics
  if (!tab || tab === "dashboard" || tab === "analytics") {
    return <AnalyticsDashboard analytics={data?.analytics} />;
  }

  // Show users dashboard
  if (tab === "users") {
    return (
      <UsersDashboard
        initialUsers={data?.users?.users || []}
        initialStats={data?.stats || {}}
        initialPagination={data?.users?.pagination || {}}
      />
    );
  }

  // Show pending verification
  if (tab === "pending") {
    return <PendingDoctors doctors={data?.pendingDoctors?.doctors || []} />;
  }

  // Show verified talents
  if (tab === "talents") {
    return <VerifiedDoctors doctors={data?.verifiedDoctors?.doctors || []} />;
  }

  // Show payouts
  if (tab === "payouts") {
    return <PendingPayouts payouts={data?.pendingPayouts?.payouts || []} />;
  }

  // Show media agencies
  if (tab === "media-agencies") {
    return (
      <div className="space-y-6">
        <PendingMediaAgencies agencies={data?.pendingAgencies?.agencies || []} />
        <div className="mt-6">
          <VerifiedMediaAgencies agencies={data?.verifiedAgencies?.agencies || []} />
        </div>
      </div>
    );
  }

  return <AnalyticsDashboard analytics={data?.analytics} />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  );
}
