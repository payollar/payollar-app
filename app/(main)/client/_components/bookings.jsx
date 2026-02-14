"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentCard } from "@/components/appointment-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  AlertCircle,
  Search,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

const PAYMENT_ERROR_MESSAGES = {
  missing_reference: "Payment reference was missing.",
  verification_failed: "Payment verification failed.",
  invalid_metadata: "Invalid booking data.",
  user_not_found: "User or talent not found.",
  slot_no_longer_available: "This time slot is no longer available.",
  booking_failed: "Booking could not be completed.",
};

export function ClientBookings({ appointments = [], error, paymentSuccess, paymentError }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    if (paymentSuccess === "1") {
      toast.success("Payment successful! Your booking is confirmed.");
      router.replace("/client/bookings", { scroll: false });
    } else if (paymentError) {
      const message = PAYMENT_ERROR_MESSAGES[paymentError] || "Payment or booking failed.";
      toast.error(message);
      router.replace("/client/bookings", { scroll: false });
    }
  }, [paymentSuccess, paymentError, router]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = appointments.length;
    const upcoming = appointments.filter(
      (apt) => apt.status === "SCHEDULED" && new Date(apt.startTime) > new Date()
    ).length;
    const completed = appointments.filter((apt) => apt.status === "COMPLETED").length;
    const cancelled = appointments.filter((apt) => apt.status === "CANCELLED").length;
    return { total, upcoming, completed, cancelled };
  }, [appointments]);

  // Separate appointments by status
  const upcoming = useMemo(() => {
    return appointments.filter(
      (apt) => apt.status === "SCHEDULED" && new Date(apt.startTime) > new Date()
    );
  }, [appointments]);

  const completed = useMemo(() => {
    return appointments.filter((apt) => apt.status === "COMPLETED");
  }, [appointments]);

  const cancelled = useMemo(() => {
    return appointments.filter((apt) => apt.status === "CANCELLED");
  }, [appointments]);

  // Filter appointments based on search and status
  const getFilteredAppointments = (appointmentList) => {
    return appointmentList.filter((apt) => {
      const matchesSearch =
        searchQuery === "" ||
        apt.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.creator?.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patientDescription?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || apt.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const filteredUpcoming = getFilteredAppointments(upcoming);
  const filteredCompleted = getFilteredAppointments(completed);
  const filteredCancelled = getFilteredAppointments(cancelled);

  if (error) {
    return (
      <Card className="border-emerald-900/20">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-3" />
            <p className="text-red-400">Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Bookings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your appointments and consultations
          </p>
        </div>
        <Link href="/client/talents">
          <Button className="bg-white hover:bg-gray-100 text-gray-900">
            <Search className="h-4 w-4 mr-2" />
            Find Talents
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-white/20 bg-transparent backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground/80 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl"></div>
                <Calendar className="h-10 w-10 text-blue-400 relative z-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/20 bg-transparent backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground/80 mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.upcoming}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl"></div>
                <Clock className="h-10 w-10 text-amber-400 relative z-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/20 bg-transparent backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground/80 mb-1">Completed</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.completed}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl"></div>
                <CheckCircle className="h-10 w-10 text-emerald-400 relative z-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/20 bg-transparent backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground/80 mb-1">Cancelled</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.cancelled}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-red-400/20 rounded-full blur-xl"></div>
                <XCircle className="h-10 w-10 text-red-400 relative z-10" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by creator name, specialty, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-800 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-gray-900/50 border-gray-800 text-white">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs for Bookings */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-900 border-gray-800">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            <Clock className="h-4 w-4 mr-2" />
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            <XCircle className="h-4 w-4 mr-2" />
            Cancelled ({cancelled.length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Tab */}
        <TabsContent value="upcoming" className="space-y-4 mt-6">
          {filteredUpcoming.length > 0 ? (
            <div className="space-y-4">
              {filteredUpcoming.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole="CLIENT"
                />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <Card className="border-gray-800">
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-medium text-white mb-2">
                  No upcoming bookings
                </h3>
                <p className="text-muted-foreground mb-6">
                  Browse our talented creators and book your next session.
                </p>
                <Link href="/client/talents">
                  <Button className="bg-white hover:bg-gray-100 text-gray-900">
                    Browse Talents
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-800">
              <CardContent className="p-12 text-center">
                <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-medium text-white mb-2">
                  No upcoming bookings found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="space-y-4 mt-6">
          {filteredCompleted.length > 0 ? (
            <div className="space-y-4">
              {filteredCompleted.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole="CLIENT"
                />
              ))}
            </div>
          ) : completed.length === 0 ? (
            <Card className="border-gray-800">
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-medium text-white mb-2">
                  No completed bookings yet
                </h3>
                <p className="text-muted-foreground">
                  Your completed appointments will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-800">
              <CardContent className="p-12 text-center">
                <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-medium text-white mb-2">
                  No completed bookings found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cancelled Tab */}
        <TabsContent value="cancelled" className="space-y-4 mt-6">
          {filteredCancelled.length > 0 ? (
            <div className="space-y-4">
              {filteredCancelled.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole="CLIENT"
                />
              ))}
            </div>
          ) : cancelled.length === 0 ? (
            <Card className="border-gray-800">
              <CardContent className="p-12 text-center">
                <XCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-medium text-white mb-2">
                  No cancelled bookings
                </h3>
                <p className="text-muted-foreground">
                  You haven't cancelled any appointments.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-800">
              <CardContent className="p-12 text-center">
                <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-medium text-white mb-2">
                  No cancelled bookings found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Empty State - No appointments at all */}
      {appointments.length === 0 && (
        <Card className="border-gray-800">
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">
              No appointments scheduled
            </h3>
            <p className="text-muted-foreground mb-6">
              You don't have any appointments scheduled yet. Browse our talented creators
              and book your first consultation.
            </p>
            <Link href="/client/talents">
              <Button className="bg-white hover:bg-gray-100 text-gray-900">
                Browse Talents
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

