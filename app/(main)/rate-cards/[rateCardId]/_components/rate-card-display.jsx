"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { BookOpen, Building2, Clock } from "lucide-react";

export function RateCardDisplay({ rateCard }) {
  const [selectedRow, setSelectedRow] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    quantity: 1,
    startDate: null,
    endDate: null,
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCellValue = (value, column) => {
    if (!value) return "-";

    switch (column.dataType) {
      case "CURRENCY":
        return `₵${parseFloat(value).toLocaleString()}`;
      case "NUMBER":
        return parseFloat(value).toLocaleString();
      case "BOOLEAN":
        return value === "true" ? "Yes" : "No";
      default:
        return value;
    }
  };

  const getCellValue = (row, columnId) => {
    const cell = row.cells?.find((c) => c.columnId === columnId);
    return cell?.value || "";
  };

  const isRowBookable = (row, table) => {
    if (!row.isBookable) return false;

    // Check if all required booking columns have values
    const requiredColumns = table.columns.filter((col) => col.isRequiredForBooking);
    for (const column of requiredColumns) {
      const value = getCellValue(row, column.id);
      if (!value || value.trim() === "") {
        return false;
      }
    }

    return true;
  };

  const handleBooking = async () => {
    if (!selectedRow) return;

    if (!bookingForm.clientName || !bookingForm.clientEmail) {
      toast.error("Name and email are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/media-agency/rate-cards/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowId: selectedRow.id,
          rateCardId: rateCard.id,
          ...bookingForm,
          startDate: bookingForm.startDate
            ? format(bookingForm.startDate, "yyyy-MM-dd")
            : null,
          endDate: bookingForm.endDate
            ? format(bookingForm.endDate, "yyyy-MM-dd")
            : null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Booking request submitted successfully!");
        setSelectedRow(null);
        setBookingForm({
          clientName: "",
          clientEmail: "",
          clientPhone: "",
          quantity: 1,
          startDate: null,
          endDate: null,
          notes: "",
        });
      } else {
        toast.error(data.error || "Failed to submit booking");
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast.error("Failed to submit booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{rateCard.title}</h1>
              {rateCard.description && (
                <p className="text-muted-foreground text-lg">{rateCard.description}</p>
              )}
            </div>
            {rateCard.agency.logoUrl && (
              <img
                src={rateCard.agency.logoUrl}
                alt={rateCard.agency.agencyName}
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{rateCard.agency.agencyName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Last updated: {format(new Date(rateCard.lastUpdated), "PPP")}</span>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {rateCard.sections?.map((section) => (
            <div key={section.id}>
              <h2 className="text-2xl font-bold mb-6">{section.title}</h2>

              {section.tables?.map((table) => (
                <Card key={table.id} className="mb-8">
                  {table.title && (
                    <CardHeader>
                      <CardTitle>{table.title}</CardTitle>
                    </CardHeader>
                  )}
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            {table.columns.map((column) => (
                              <th
                                key={column.id}
                                className="p-3 text-left font-semibold bg-muted/50"
                              >
                                {column.name}
                                {column.isRequiredForBooking && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </th>
                            ))}
                            <th className="p-3 text-left font-semibold bg-muted/50 w-32">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows
                            .filter((row) => isRowBookable(row, table))
                            .map((row) => (
                              <tr key={row.id} className="border-b hover:bg-muted/30">
                                {table.columns.map((column) => (
                                  <td key={column.id} className="p-3">
                                    {formatCellValue(getCellValue(row, column.id), column)}
                                  </td>
                                ))}
                                <td className="p-3">
                                  <Dialog open={isDialogOpen && selectedRow?.id === row.id} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          setSelectedRow(row);
                                          setIsDialogOpen(true);
                                          setBookingForm({
                                            clientName: "",
                                            clientEmail: "",
                                            clientPhone: "",
                                            quantity: 1,
                                            startDate: null,
                                            endDate: null,
                                            notes: "",
                                          });
                                        }}
                                      >
                                        <BookOpen className="h-4 w-4 mr-2" />
                                        Book
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>Book Service</DialogTitle>
                                        <DialogDescription>
                                          Fill in your details to request a booking
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4 mt-4">
                                        {/* Row Details Preview */}
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="text-lg">Service Details</CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="grid grid-cols-2 gap-4">
                                              {table.columns.map((column) => {
                                                const value = getCellValue(row, column.id);
                                                if (!value) return null;
                                                return (
                                                  <div key={column.id}>
                                                    <Label className="text-xs text-muted-foreground">
                                                      {column.name}
                                                    </Label>
                                                    <p className="font-medium">
                                                      {formatCellValue(value, column)}
                                                    </p>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </CardContent>
                                        </Card>

                                        {/* Booking Form */}
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label htmlFor="clientName">
                                              Your Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                              id="clientName"
                                              value={bookingForm.clientName}
                                              onChange={(e) =>
                                                setBookingForm({
                                                  ...bookingForm,
                                                  clientName: e.target.value,
                                                })
                                              }
                                              required
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor="clientEmail">
                                              Email <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                              id="clientEmail"
                                              type="email"
                                              value={bookingForm.clientEmail}
                                              onChange={(e) =>
                                                setBookingForm({
                                                  ...bookingForm,
                                                  clientEmail: e.target.value,
                                                })
                                              }
                                              required
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor="clientPhone">Phone</Label>
                                            <Input
                                              id="clientPhone"
                                              value={bookingForm.clientPhone}
                                              onChange={(e) =>
                                                setBookingForm({
                                                  ...bookingForm,
                                                  clientPhone: e.target.value,
                                                })
                                              }
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor="quantity">Quantity</Label>
                                            <Input
                                              id="quantity"
                                              type="number"
                                              min="1"
                                              value={bookingForm.quantity}
                                              onChange={(e) =>
                                                setBookingForm({
                                                  ...bookingForm,
                                                  quantity: parseInt(e.target.value) || 1,
                                                })
                                              }
                                            />
                                          </div>
                                        </div>
                                        <div>
                                          <Label htmlFor="notes">Additional Notes</Label>
                                          <Textarea
                                            id="notes"
                                            value={bookingForm.notes}
                                            onChange={(e) =>
                                              setBookingForm({
                                                ...bookingForm,
                                                notes: e.target.value,
                                              })
                                            }
                                            rows={3}
                                          />
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setIsDialogOpen(false);
                                              setSelectedRow(null);
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            onClick={async () => {
                                              await handleBooking();
                                              // Close dialog after successful booking
                                              if (!isSubmitting) {
                                                setIsDialogOpen(false);
                                                setSelectedRow(null);
                                              }
                                            }}
                                            disabled={isSubmitting}
                                          >
                                            {isSubmitting ? "Submitting..." : "Submit Booking"}
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      {table.rows.filter((row) => isRowBookable(row, table)).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No bookable services available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
