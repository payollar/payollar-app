import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getPatientAppointments, getClientStats } from "@/actions/patient";
import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { Calendar, TrendingUp, User as UserIcon, Sparkles } from "lucide-react";
import { ClientOverview } from "./_components/overview";
import { ClientBookings } from "./_components/bookings";
import { ClientProfile } from "./_components/profile";
import { ClientCampaigns } from "./_components/campaigns";
import { getClientCampaigns } from "@/actions/campaigns";

export default async function ClientDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    redirect("/onboarding");
  }

  const [appointmentsData, statsData, campaignsData] = await Promise.all([
    getPatientAppointments(),
    getClientStats().catch(() => ({ stats: {}, recentAppointments: [] })),
    getClientCampaigns().catch(() => ({ campaigns: [] })),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-900/30 rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.name || "Client"}! 👋
        </h1>
        <p className="text-muted-foreground">
          Manage your bookings and grow your business with our talented creators
        </p>
      </div>

      <Tabs defaultValue="overview" className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-0">
        <div className="md:col-span-1 md:sticky md:top-24 md:h-fit">
          <div className="bg-muted/30 border rounded-lg shadow-lg overflow-hidden w-full">
            <div className="overflow-x-auto md:overflow-x-visible scroll-smooth snap-x snap-mandatory md:block scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              <TabsList className="flex flex-row md:flex-col w-max md:w-full !p-0 !h-auto !bg-transparent !border-0 gap-0">
                <TabsTrigger
                  value="overview"
                  className="flex-shrink-0 md:w-full md:justify-start px-4 py-3 h-12 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white !data-[state=inactive]:!bg-transparent dark:!data-[state=inactive]:!bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted/50 transition-colors md:rounded-t-lg md:rounded-b-none border-0 shadow-none snap-start flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4 flex-shrink-0" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger
                  value="bookings"
                  className="flex-shrink-0 md:w-full md:justify-start px-4 py-3 h-12 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white !data-[state=inactive]:!bg-transparent dark:!data-[state=inactive]:!bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted/50 transition-colors md:rounded-none border-0 shadow-none snap-start flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Bookings</span>
                </TabsTrigger>
                <TabsTrigger
                  value="campaigns"
                  className="flex-shrink-0 md:w-full md:justify-start px-4 py-3 h-12 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white !data-[state=inactive]:!bg-transparent dark:!data-[state=inactive]:!bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted/50 transition-colors md:rounded-none border-0 shadow-none snap-start flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4 flex-shrink-0" />
                  <span>Campaigns</span>
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="flex-shrink-0 md:w-full md:justify-start px-4 py-3 h-12 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white !data-[state=inactive]:!bg-transparent dark:!data-[state=inactive]:!bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted/50 transition-colors md:rounded-b-lg md:rounded-t-none border-0 shadow-none snap-start flex items-center gap-2"
                >
                  <UserIcon className="h-4 w-4 flex-shrink-0" />
                  <span>Profile</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>
        <div className="md:col-span-3">
          <TabsContent value="overview" className="border-none p-0 mt-0">
            <ClientOverview 
              stats={statsData.stats || {}}
              recentAppointments={statsData.recentAppointments || []}
            />
          </TabsContent>
          <TabsContent value="bookings" className="border-none p-0 mt-0">
            <ClientBookings 
              appointments={appointmentsData.appointments || []}
              error={appointmentsData.error}
            />
          </TabsContent>
          <TabsContent value="campaigns" className="border-none p-0 mt-0">
            <ClientCampaigns campaigns={campaignsData.campaigns || []} />
          </TabsContent>
          <TabsContent value="profile" className="border-none p-0 mt-0">
            <ClientProfile user={user} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

