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
import { ClientPageShell, clientCardClass } from "./client-page-shell";

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
      <ClientPageShell eyebrow="Bookings" title="Bookings" description="Your appointments">
        <Card className={clientCardClass}>
          <CardContent className="p-6">
            <div className="py-8 text-center">
              <AlertCircle className="mx-auto mb-3 h-12 w-12 text-destructive" />
              <p className="text-destructive">Error: {error}</p>
            </div>
          </CardContent>
        </Card>
      </ClientPageShell>
    );
  }

  const inputClass = "border-border/60 bg-background text-foreground";

  return (
    <ClientPageShell
      eyebrow="Schedule"
      title="Bookings"
      description="Manage your appointments and consultations."
      actions={
        <Button variant="marketing" className="gap-2" asChild>
          <Link href="/client/talents">
            <Search className="h-4 w-4" />
            Find talents
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={clientCardClass}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Total bookings</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{stats.total}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Calendar className="relative z-10 h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={clientCardClass}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Upcoming</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{stats.upcoming}</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-3">
                <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={clientCardClass}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Completed</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-primary">{stats.completed}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={clientCardClass}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Cancelled</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{stats.cancelled}</p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-3">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by creator name, specialty, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 ${inputClass}`}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className={`w-full sm:w-[180px] ${inputClass}`}>
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
        <TabsList className="grid w-full grid-cols-3 rounded-xl border border-border/60 bg-card/60 p-1">
          <TabsTrigger
            value="upcoming"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Clock className="mr-2 h-4 w-4" />
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Completed ({completed.length})
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <XCircle className="mr-2 h-4 w-4" />
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
            <Card className={clientCardClass}>
              <CardContent className="p-12 text-center">
                <Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                <h3 className="mb-2 text-xl font-medium text-foreground">No upcoming bookings</h3>
                <p className="mb-6 text-muted-foreground">
                  Browse our talented creators and book your next session.
                </p>
                <Button variant="marketing" asChild>
                  <Link href="/client/talents">Browse talents</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className={clientCardClass}>
              <CardContent className="p-12 text-center">
                <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                <h3 className="mb-2 text-xl font-medium text-foreground">No upcoming bookings found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
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
            <Card className={clientCardClass}>
              <CardContent className="p-12 text-center">
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                <h3 className="mb-2 text-xl font-medium text-foreground">No completed bookings yet</h3>
                <p className="text-muted-foreground">Your completed appointments will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className={clientCardClass}>
              <CardContent className="p-12 text-center">
                <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                <h3 className="mb-2 text-xl font-medium text-foreground">No completed bookings found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
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
            <Card className={clientCardClass}>
              <CardContent className="p-12 text-center">
                <XCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                <h3 className="mb-2 text-xl font-medium text-foreground">No cancelled bookings</h3>
                <p className="text-muted-foreground">You haven&apos;t cancelled any appointments.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className={clientCardClass}>
              <CardContent className="p-12 text-center">
                <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                <h3 className="mb-2 text-xl font-medium text-foreground">No cancelled bookings found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Empty State - No appointments at all */}
      {appointments.length === 0 && (
        <Card className={clientCardClass}>
          <CardContent className="p-12 text-center">
            <Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
            <h3 className="mb-2 text-xl font-medium text-foreground">No appointments scheduled</h3>
            <p className="mb-6 text-muted-foreground">
              You don&apos;t have any appointments scheduled yet. Browse our talented creators and book
              your first consultation.
            </p>
            <Button variant="marketing" asChild>
              <Link href="/client/talents">Browse talents</Link>
            </Button>
          </CardContent>
        </Card>
      )}
      </div>
    </ClientPageShell>
  );
}

