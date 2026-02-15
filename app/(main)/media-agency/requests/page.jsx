import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Inbox, CheckCircle, XCircle, Clock, FileText, Upload } from "lucide-react";
import { updateBookingStatus } from "./actions";
import Link from "next/link";

export default async function MediaAgencyRequestsPage() {
  const user = await checkUser();

  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
    include: {
      bookings: {
        orderBy: { createdAt: "desc" },
        include: {
          listing: true,
        },
      },
      rateCardBookings: {
        orderBy: { createdAt: "desc" },
        include: {
          rateCard: {
            select: {
              id: true,
              title: true,
              listingType: true,
              location: true,
            },
          },
          row: {
            include: {
              table: {
                include: {
                  section: {
                    select: {
                      title: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!mediaAgency) {
    redirect("/media-agency/settings");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Booking Requests</h1>
        <p className="text-muted-foreground">
          Manage and respond to booking requests from clients
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {mediaAgency.bookings.length === 0 && mediaAgency.rateCardBookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Inbox className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No booking requests</p>
              <p className="text-sm">Requests from clients will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Media Booking Requests */}
              {mediaAgency.bookings.map((booking) => (
                <div
                  key={`media-${booking.id}`}
                  className="border rounded-lg p-6 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{booking.clientName}</h3>
                      <p className="text-sm text-muted-foreground">{booking.clientEmail}</p>
                      {booking.clientPhone && (
                        <p className="text-sm text-muted-foreground">{booking.clientPhone}</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        booking.status === "PENDING" ? "secondary" :
                        booking.status === "CONFIRMED" ? "default" :
                        booking.status === "COMPLETED" ? "outline" :
                        "destructive"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Listing</p>
                      <p className="text-sm text-muted-foreground">{booking.listing.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Package</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.packageName || "Custom Package"}
                      </p>
                    </div>
                    {booking.duration && (
                      <div>
                        <p className="text-sm font-medium mb-1">Duration</p>
                        <p className="text-sm text-muted-foreground">{booking.duration}</p>
                      </div>
                    )}
                    {booking.slots && (
                      <div>
                        <p className="text-sm font-medium mb-1">Number of Spots</p>
                        <p className="text-sm text-muted-foreground">{booking.slots}</p>
                      </div>
                    )}
                    {booking.startDate && (
                      <div>
                        <p className="text-sm font-medium mb-1">Start Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {booking.endDate && (
                      <div>
                        <p className="text-sm font-medium mb-1">End Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {booking.totalAmount && (
                      <div>
                        <p className="text-sm font-medium mb-1">Total Amount</p>
                        <p className="text-lg font-semibold">₵{booking.totalAmount.toFixed(2)}</p>
                      </div>
                    )}
                  </div>

                  {booking.notes && (
                    <div>
                      <p className="text-sm font-medium mb-1">Notes</p>
                      <p className="text-sm text-muted-foreground">{booking.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Requested on {new Date(booking.createdAt).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      {booking.status === "PENDING" && (
                        <>
                          <form action={updateBookingStatus}>
                            <input type="hidden" name="bookingId" value={booking.id} />
                            <input type="hidden" name="bookingType" value="MEDIA" />
                            <input type="hidden" name="status" value="CONFIRMED" />
                            <Button type="submit" size="sm" variant="default">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirm
                            </Button>
                          </form>
                          <form action={updateBookingStatus}>
                            <input type="hidden" name="bookingId" value={booking.id} />
                            <input type="hidden" name="bookingType" value="MEDIA" />
                            <input type="hidden" name="status" value="CANCELLED" />
                            <Button type="submit" size="sm" variant="destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                          </form>
                        </>
                      )}
                      {(booking.status === "CONFIRMED" || booking.status === "COMPLETED") && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            asChild
                          >
                            <Link href={`/media-agency/transmission-certificates?bookingId=${booking.id}&bookingType=MEDIA`}>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Certificate
                            </Link>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            asChild
                          >
                            <Link href={`/media-agency/reporting?bookingId=${booking.id}&bookingType=MEDIA`}>
                              <FileText className="h-4 w-4 mr-2" />
                              Create Report
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Rate Card Booking Requests */}
              {mediaAgency.rateCardBookings.map((booking) => (
                <div
                  key={`ratecard-${booking.id}`}
                  className="border rounded-lg p-6 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{booking.clientName}</h3>
                      <p className="text-sm text-muted-foreground">{booking.clientEmail}</p>
                      {booking.clientPhone && (
                        <p className="text-sm text-muted-foreground">{booking.clientPhone}</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        booking.status === "PENDING" ? "secondary" :
                        booking.status === "CONFIRMED" ? "default" :
                        booking.status === "COMPLETED" ? "outline" :
                        "destructive"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Rate Card</p>
                      <p className="text-sm text-muted-foreground">{booking.rateCard.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Section</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.row?.table?.section?.title || "N/A"}
                      </p>
                    </div>
                    {booking.snapshotDescription && (
                      <div>
                        <p className="text-sm font-medium mb-1">Description</p>
                        <p className="text-sm text-muted-foreground">{booking.snapshotDescription}</p>
                      </div>
                    )}
                    {booking.quantity && (
                      <div>
                        <p className="text-sm font-medium mb-1">Quantity</p>
                        <p className="text-sm text-muted-foreground">{booking.quantity}</p>
                      </div>
                    )}
                    {booking.startDate && (
                      <div>
                        <p className="text-sm font-medium mb-1">Start Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {booking.endDate && (
                      <div>
                        <p className="text-sm font-medium mb-1">End Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {booking.totalAmount && (
                      <div>
                        <p className="text-sm font-medium mb-1">Total Amount</p>
                        <p className="text-lg font-semibold">₵{booking.totalAmount.toFixed(2)}</p>
                      </div>
                    )}
                    {booking.snapshotPrice && (
                      <div>
                        <p className="text-sm font-medium mb-1">Unit Price</p>
                        <p className="text-sm text-muted-foreground">₵{booking.snapshotPrice.toFixed(2)}</p>
                      </div>
                    )}
                  </div>

                  {booking.notes && (
                    <div>
                      <p className="text-sm font-medium mb-1">Notes</p>
                      <p className="text-sm text-muted-foreground">{booking.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Requested on {new Date(booking.createdAt).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      {booking.status === "PENDING" && (
                        <>
                          <form action={updateBookingStatus}>
                            <input type="hidden" name="bookingId" value={booking.id} />
                            <input type="hidden" name="bookingType" value="RATE_CARD" />
                            <input type="hidden" name="status" value="CONFIRMED" />
                            <Button type="submit" size="sm" variant="default">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirm
                            </Button>
                          </form>
                          <form action={updateBookingStatus}>
                            <input type="hidden" name="bookingId" value={booking.id} />
                            <input type="hidden" name="bookingType" value="RATE_CARD" />
                            <input type="hidden" name="status" value="CANCELLED" />
                            <Button type="submit" size="sm" variant="destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                          </form>
                        </>
                      )}
                      {(booking.status === "CONFIRMED" || booking.status === "COMPLETED") && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            asChild
                          >
                            <Link href={`/media-agency/transmission-certificates?bookingId=${booking.id}&bookingType=RATE_CARD`}>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Certificate
                            </Link>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            asChild
                          >
                            <Link href={`/media-agency/reporting?bookingId=${booking.id}&bookingType=RATE_CARD`}>
                              <FileText className="h-4 w-4 mr-2" />
                              Create Report
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>
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
