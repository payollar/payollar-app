"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  FileText,
  Megaphone,
  Package,
  Percent,
  Radio,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { UsersDashboard } from "./components/users-dashboard";
import { PendingDoctors } from "./components/pending-doctors";
import { VerifiedDoctors } from "./components/verified-doctors";
import { PendingPayouts } from "./components/pending-payouts";
import { PendingMediaAgencies } from "./components/pending-media-agencies";
import { VerifiedMediaAgencies } from "./components/verified-media-agencies";
import { DisputesDashboard } from "./components/disputes-dashboard";
import {
  AdminFeaturePanel,
  AnalyticsDashboard,
} from "./_components/analytics-dashboard";

function money(value) {
  return `GH₵ ${Number(value || 0).toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

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
          disputesRes,
        ] = await Promise.all([
          fetch("/api/admin/users?page=1&limit=50").then((r) => r.json()),
          fetch("/api/admin/stats").then((r) => r.json()),
          fetch("/api/admin/pending-doctors").then((r) => r.json()),
          fetch("/api/admin/verified-doctors").then((r) => r.json()),
          fetch("/api/admin/pending-payouts").then((r) => r.json()),
          fetch("/api/admin/pending-agencies").then((r) => r.json()),
          fetch("/api/admin/verified-agencies").then((r) => r.json()),
          fetch("/api/admin/analytics").then((r) => r.json()),
          fetch("/api/admin/disputes").then((r) => r.json()),
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
          disputes: disputesRes.success ? disputesRes : null,
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
      <div className="-m-3 min-h-full bg-[#f4f6fb] p-3 md:-m-6 md:p-5">
        <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
            />
          ))}
        </div>
      </div>
    );
  }

  const analytics = data?.analytics;

  if (!tab || tab === "dashboard") {
    return <AnalyticsDashboard analytics={analytics} focus="overview" />;
  }

  if (tab === "analytics") {
    return <AnalyticsDashboard analytics={analytics} focus="analytics" />;
  }

  if (tab === "users") {
    return (
      <div className="-m-3 min-h-full bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:p-5">
        <UsersDashboard
          initialUsers={data?.users?.users || []}
          initialStats={data?.stats || {}}
          initialPagination={data?.users?.pagination || {}}
        />
      </div>
    );
  }

  if (tab === "pending") {
    return (
      <div className="-m-3 min-h-full bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:p-5">
        <PendingDoctors doctors={data?.pendingDoctors?.doctors || []} />
      </div>
    );
  }

  if (tab === "talents") {
    return (
      <div className="-m-3 min-h-full bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:p-5">
        <VerifiedDoctors doctors={data?.verifiedDoctors?.doctors || []} />
      </div>
    );
  }

  if (tab === "payouts") {
    return (
      <div className="-m-3 min-h-full bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:p-5">
        <PendingPayouts payouts={data?.pendingPayouts?.payouts || []} />
      </div>
    );
  }

  if (tab === "disputes") {
    return (
      <DisputesDashboard
        initialDisputes={data?.disputes?.disputes || []}
        initialStats={data?.disputes?.stats || {}}
      />
    );
  }

  if (tab === "media-agencies") {
    const pending = data?.pendingAgencies?.agencies || [];
    const verified = data?.verifiedAgencies?.agencies || [];
    return (
      <div className="-m-3 min-h-full space-y-4 bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:space-y-5 md:p-5">
        <div>
          <h1 className="text-lg font-semibold text-slate-950 md:text-xl">
            Media agencies
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review registrations and manage verified media partners.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-medium text-slate-500">Pending</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
              {pending.length}
            </p>
            <p className="mt-1 text-xs text-slate-400">Awaiting review</p>
          </section>
          <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-medium text-slate-500">Verified</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
              {verified.length}
            </p>
            <p className="mt-1 text-xs text-slate-400">Live on platform</p>
          </section>
          <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-medium text-slate-500">Total listings</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
              {[...pending, ...verified].reduce(
                (sum, agency) =>
                  sum + (agency.listings?.length || agency._count?.listings || 0),
                0
              )}
            </p>
            <p className="mt-1 text-xs text-slate-400">Across all agencies</p>
          </section>
        </div>
        <PendingMediaAgencies agencies={pending} />
        <VerifiedMediaAgencies agencies={verified} />
      </div>
    );
  }

  if (tab === "campaigns") {
    return (
      <AdminFeaturePanel
        title="Campaigns & delivery"
        description="Campaign pipeline, applications, and submitted delivery reports."
        metrics={[
          {
            icon: Megaphone,
            label: "Active campaigns",
            value: analytics?.campaigns?.active || 0,
            hint: `${analytics?.campaigns?.total || 0} total campaigns`,
          },
          {
            icon: FileText,
            label: "Pending applications",
            value: analytics?.applications?.pending || 0,
            hint: "Waiting on brands / agencies",
          },
          {
            icon: FileText,
            label: "Accepted hires",
            value: analytics?.applications?.accepted || 0,
            hint: "Ready for delivery or logistics",
          },
          {
            icon: FileText,
            label: "Reports submitted",
            value: analytics?.delivery?.submitted || 0,
            hint: "Delivery reports in review",
          },
        ]}
        links={[
          { href: "/admin?tab=logistics", label: "View logistics" },
          { href: "/admin?tab=talents", label: "View talents" },
        ]}
      />
    );
  }

  if (tab === "logistics") {
    return (
      <AdminFeaturePanel
        title="Product logistics"
        description="Self-managed kit shipments across gift and returnable flows."
        metrics={[
          {
            icon: Truck,
            label: "Total shipments",
            value: analytics?.logistics?.total || 0,
            hint: "All logistics records",
          },
          {
            icon: Truck,
            label: "Need attention",
            value: analytics?.logistics?.attention || 0,
            hint: "Problems or return requests",
          },
          {
            icon: Truck,
            label: "Return requests",
            value: analytics?.logistics?.returns || 0,
            hint: "Creators requesting returns",
          },
          {
            icon: Package,
            label: "Accepted hires",
            value: analytics?.applications?.accepted || 0,
            hint: "Source applications for kits",
          },
        ]}
        links={[
          { href: "/admin?tab=campaigns", label: "Campaigns" },
          { href: "/admin?tab=dashboard", label: "Back to dashboard" },
        ]}
      />
    );
  }

  if (tab === "negotiations") {
    return (
      <AdminFeaturePanel
        title="Media negotiations"
        description="Discount threads between clients and media stations."
        metrics={[
          {
            icon: Percent,
            label: "Total negotiations",
            value: analytics?.negotiations?.total || 0,
            hint: "All media discount threads",
          },
          {
            icon: Percent,
            label: "Open / countered",
            value: analytics?.negotiations?.open || 0,
            hint: "Needs station or client action",
          },
          {
            icon: Package,
            label: "Pending bookings",
            value: analytics?.mediaBookings?.pending || 0,
            hint: "Listing + rate-card requests",
          },
          {
            icon: Radio,
            label: "Published rate cards",
            value: analytics?.mediaBookings?.publishedRateCards || 0,
            hint: `${analytics?.mediaBookings?.totalRateCards || 0} total rate cards`,
          },
        ]}
        links={[
          { href: "/admin?tab=media-agencies", label: "Media agencies" },
          { href: "/admin?tab=marketplace", label: "Marketplace" },
        ]}
      />
    );
  }

  if (tab === "marketplace") {
    return (
      <AdminFeaturePanel
        title="Digital marketplace"
        description="Product listings, completed sales, fees, and creator earnings."
        metrics={[
          {
            icon: ShoppingBag,
            label: "Active products",
            value: analytics?.products?.active || 0,
            hint: `${analytics?.products?.total || 0} total products`,
          },
          {
            icon: Package,
            label: "Completed sales",
            value: analytics?.marketplace?.completed || 0,
            hint: money(analytics?.marketplace?.revenue),
          },
          {
            icon: Package,
            label: "Pending sales",
            value: analytics?.marketplace?.pending || 0,
            hint: "Awaiting completion",
          },
          {
            icon: CreditCard,
            label: "Platform fees",
            value: money(analytics?.marketplace?.platformFees),
            hint: `${money(analytics?.marketplace?.creatorEarnings)} to creators`,
          },
        ]}
        links={[
          { href: "/admin?tab=payouts", label: "Credit payouts" },
          { href: "/admin?tab=dashboard", label: "Back to dashboard" },
        ]}
      />
    );
  }

  return <AnalyticsDashboard analytics={analytics} focus="overview" />;
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="-m-3 min-h-full bg-[#f4f6fb] p-3 md:-m-6 md:p-5">
          <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
              />
            ))}
          </div>
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
