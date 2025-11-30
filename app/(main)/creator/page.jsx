import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getDoctorAppointments, getDoctorAvailability } from "@/actions/doctor";
import { AvailabilitySettings } from "./_components/availability-settings";
import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { Calendar, Clock, DollarSign, TrendingUp, User as UserIcon, ShoppingBag } from "lucide-react";
import CreatorAppointmentsList from "./_components/appointments-list";
import { getDoctorEarnings, getDoctorPayouts } from "@/actions/payout";
import { CreatorEarnings } from "./_components/doctor-earnings";
import { OverviewPage } from "./_components/overview-page";
import { ProfilePage } from "./_components/profile-page";
import { CreatorProducts } from "./_components/products";
import { getCreatorProducts, getCreatorProductEarnings } from "@/actions/products";

export default async function CreatorDashboardPage() {
  const user = await getCurrentUser();

  if (user?.role !== "DOCTOR") {
    redirect("/onboarding");
  }

  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  const [appointmentsData, availabilityData, earningsData, payoutsData, productsData, productEarningsData] =
    await Promise.all([
      getDoctorAppointments(),
      getDoctorAvailability(),
      getDoctorEarnings(),
      getDoctorPayouts(),
      getCreatorProducts().catch(() => ({ products: [] })),
      getCreatorProductEarnings().catch(() => ({ earnings: {}, recentSales: [] })),
    ]);

  return (
    <Tabs
      defaultValue="profile"
      className="grid grid-cols-1 md:grid-cols-4 gap-6"
    >
      <div className="md:col-span-1 md:sticky md:top-24 md:h-fit">
        <div className="bg-muted/30 border rounded-lg shadow-lg overflow-hidden w-full">
          <div className="overflow-x-auto md:overflow-x-visible scroll-smooth snap-x snap-mandatory md:block scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
            <TabsList className="flex flex-row md:flex-col w-max md:w-full !p-0 !h-auto !bg-transparent !border-0 gap-0">
            <TabsTrigger
              value="overview"
              className="flex-shrink-0 md:w-full md:justify-start px-4 py-3 h-12 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted/50 transition-colors md:rounded-t-lg md:rounded-b-none rounded-lg md:rounded-none border-0 shadow-none snap-start flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4 flex-shrink-0" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex-shrink-0 md:w-full md:justify-start px-4 py-3 h-12 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted/50 transition-colors md:rounded-none rounded-lg border-0 shadow-none snap-start flex items-center gap-2"
            >
              <UserIcon className="h-4 w-4 flex-shrink-0" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="flex-shrink-0 md:w-full md:justify-start px-4 py-3 h-12 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted/50 transition-colors md:rounded-none rounded-lg border-0 shadow-none snap-start flex items-center gap-2"
            >
              <ShoppingBag className="h-4 w-4 flex-shrink-0" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger
              value="earnings"
              className="flex-shrink-0 md:w-full md:justify-start px-4 py-3 h-12 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted/50 transition-colors md:rounded-none rounded-lg border-0 shadow-none snap-start flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4 flex-shrink-0" />
              <span>Earnings</span>
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="flex-shrink-0 md:w-full md:justify-start px-4 py-3 h-12 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted/50 transition-colors md:rounded-none rounded-lg border-0 shadow-none snap-start flex items-center gap-2"
            >
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Bookings</span>
            </TabsTrigger>
            <TabsTrigger
              value="availability"
              className="flex-shrink-0 md:w-full md:justify-start px-4 py-3 h-12 whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted/50 transition-colors md:rounded-b-lg md:rounded-t-none rounded-lg md:rounded-none border-0 shadow-none snap-start flex items-center gap-2"
            >
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>Availability</span>
            </TabsTrigger>
            </TabsList>
          </div>
        </div>
      </div>
      <div className="md:col-span-3">
        <TabsContent value="overview" className="border-none p-0 mt-0">
          <OverviewPage
            earnings={earningsData.earnings || {}}
            payouts={payoutsData.payouts || []}
            initialSkills={[]}
          />
        </TabsContent>
        <TabsContent value="profile" className="border-none p-0 mt-0">
          <ProfilePage user={user} availabilitySlots={availabilityData.slots || []} />
        </TabsContent>
        <TabsContent value="appointments" className="border-none p-0 mt-0">
          <CreatorAppointmentsList
            appointments={appointmentsData.appointments || []}
          />
        </TabsContent>
        <TabsContent value="availability" className="border-none p-0 mt-0">
          <AvailabilitySettings slots={availabilityData.slots || []} />
        </TabsContent>
        <TabsContent value="products" className="border-none p-0 mt-0">
          <CreatorProducts 
            products={productsData.products || []}
            productEarnings={productEarningsData.earnings || {}}
          />
        </TabsContent>
        <TabsContent value="earnings" className="border-none p-0 mt-0">
          <CreatorEarnings
            earnings={productEarningsData.earnings || {}}
            recentSales={productEarningsData.recentSales || []}
            payouts={payoutsData.payouts || []}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
