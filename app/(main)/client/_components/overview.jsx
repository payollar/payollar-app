"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  XCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppointmentCard } from "@/components/appointment-card";

export function ClientOverview({ stats, recentAppointments = [] }) {
  const {
    totalAppointments = 0,
    completedAppointments = 0,
    upcomingAppointments = 0,
    cancelledAppointments = 0,
    appointmentsThisMonth = 0,
  } = stats;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-emerald-900/20 hover:border-emerald-700/40 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-white">{totalAppointments}</p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-900/20 hover:border-emerald-700/40 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Upcoming</p>
                <p className="text-2xl font-bold text-white">{upcomingAppointments}</p>
                <p className="text-xs text-muted-foreground mt-1">Scheduled</p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-full">
                <Clock className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-900/20 hover:border-emerald-700/40 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">This Month</p>
                <p className="text-2xl font-bold text-white">{appointmentsThisMonth}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Bookings this month
                </p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/talents">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white justify-between">
                <span>Browse Talents</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white">Completed</span>
              </div>
              <span className="text-white font-semibold">{completedAppointments}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" />
                <span className="text-white">Upcoming</span>
              </div>
              <span className="text-white font-semibold">{upcomingAppointments}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-400" />
                <span className="text-white">Cancelled</span>
              </div>
              <span className="text-white font-semibold">{cancelledAppointments}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card className="border-emerald-900/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-white">Recent Bookings</CardTitle>
          <Link href="/client?tab=bookings">
            <Button variant="ghost" className="text-emerald-400 hover:text-emerald-300">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentAppointments.length > 0 ? (
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole="CLIENT"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-xl font-medium text-white mb-2">
                No recent bookings
              </h3>
              <p className="text-muted-foreground mb-4">
                Start by browsing our talented creators and booking your first session.
              </p>
              <Link href="/talents">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Browse Talents
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

