import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Inbox, FileText, BarChart3, TrendingUp, Calendar } from "lucide-react";

export default async function MediaAgencyDashboard() {
  const user = await checkUser();

  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  // Get media agency profile
  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
    include: {
      listings: {
        where: { status: "ACTIVE" },
      },
      bookings: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          listing: true,
        },
      },
      _count: {
        select: {
          listings: true,
          bookings: true,
        },
      },
    },
  });

  // If no media agency profile exists, show a message instead of redirecting
  // This allows users to see the dashboard structure even if profile is pending
  if (!mediaAgency) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your media agency dashboard
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Profile Setup Required</h3>
              <p className="text-muted-foreground mb-4">
                Your media agency profile is being set up. Please complete your profile in settings.
              </p>
              <Button asChild>
                <Link href="/media-agency/settings">Go to Settings</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const totalListings = mediaAgency._count.listings;
  const totalBookings = mediaAgency._count.bookings;
  const pendingBookings = mediaAgency.bookings.filter(b => b.status === "PENDING").length;
  const confirmedBookings = mediaAgency.bookings.filter(b => b.status === "CONFIRMED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {mediaAgency.contactName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalListings}</div>
            <p className="text-xs text-muted-foreground">
              {mediaAgency.listings.length} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              All time bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">
              Active campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Booking Requests</CardTitle>
          <CardDescription>
            Latest booking requests from clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mediaAgency.bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No booking requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mediaAgency.bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{booking.clientName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {booking.listing.name} • {booking.packageName || "Custom Package"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                      booking.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                      booking.status === "COMPLETED" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {booking.status}
                    </span>
                    {booking.totalAmount && (
                      <p className="text-sm font-medium mt-1">
                        ₵{booking.totalAmount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
