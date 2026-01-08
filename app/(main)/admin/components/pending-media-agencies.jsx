"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Building2, Mail, Phone, Globe, MapPin, Radio, Tv, Megaphone, Smartphone, Users, Video } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { updateMediaAgencyStatus } from "@/actions/admin";
import useFetch from "@/hooks/use-fetch";
import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const MEDIA_TYPE_ICONS = {
  TV: Tv,
  RADIO: Radio,
  BILLBOARD: Megaphone,
  DIGITAL: Smartphone,
  INFLUENCER_MARKETING: Users,
  VIDEO_CLIPPING: Video,
};

export function PendingMediaAgencies({ agencies }) {
  const [selectedAgency, setSelectedAgency] = useState(null);
  const router = useRouter();

  const {
    loading,
    data,
    fn: submitStatusUpdate,
  } = useFetch(updateMediaAgencyStatus);

  const handleViewDetails = (agency) => {
    setSelectedAgency(agency);
  };

  const handleCloseDialog = () => {
    setSelectedAgency(null);
  };

  const handleUpdateStatus = async (agencyId, status) => {
    if (loading) return;

    const formData = new FormData();
    formData.append("agencyId", agencyId);
    formData.append("status", status);

    await submitStatusUpdate(formData);
  };

  useEffect(() => {
    if (data && data?.success) {
      toast.success("Media agency status updated successfully");
      handleCloseDialog();
      router.refresh();
    }
  }, [data, router]);

  return (
    <div>
      <Card className="bg-muted/20 border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">
            Pending Media Agency Registrations
          </CardTitle>
          <CardDescription>
            Review and approve media agency applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agencies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending media agency registrations at this time.
            </div>
          ) : (
            <div className="space-y-4">
              {agencies.map((agency) => (
                <Card key={agency.id} className="border-emerald-900/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {agency.logoUrl && (
                          <img
                            src={agency.logoUrl}
                            alt={agency.agencyName}
                            className="w-16 h-16 rounded-lg object-cover border border-border"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{agency.agencyName}</h3>
                            <Badge variant="secondary">Pending</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              <span>{agency.contactName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{agency.email}</span>
                            </div>
                            {agency.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{agency.phone}</span>
                              </div>
                            )}
                            {(agency.city || agency.region) && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{[agency.city, agency.region, agency.country].filter(Boolean).join(", ")}</span>
                              </div>
                            )}
                            {agency.website && (
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                <a
                                  href={agency.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:underline"
                                >
                                  {agency.website}
                                </a>
                              </div>
                            )}
                          </div>
                          {agency.listings && agency.listings.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-2">
                                {agency.listings.length} Media Listing{agency.listings.length !== 1 ? "s" : ""}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {agency.listings.map((listing) => {
                                  const Icon = MEDIA_TYPE_ICONS[listing.listingType] || Building2;
                                  return (
                                    <Badge key={listing.id} variant="outline" className="flex items-center gap-1">
                                      <Icon className="w-3 h-3" />
                                      {listing.name}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Submitted: {format(new Date(agency.createdAt), "PPp")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(agency)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!selectedAgency} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedAgency && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  {selectedAgency.logoUrl && (
                    <img
                      src={selectedAgency.logoUrl}
                      alt={selectedAgency.agencyName}
                      className="w-20 h-20 rounded-lg object-cover border border-border"
                    />
                  )}
                  <div>
                    <DialogTitle className="text-2xl">{selectedAgency.agencyName}</DialogTitle>
                    <DialogDescription>
                      Registration submitted on {format(new Date(selectedAgency.createdAt), "PPp")}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Agency Information */}
                <div>
                  <h3 className="font-semibold mb-3">Agency Information</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Contact Person</p>
                      <p className="font-medium">{selectedAgency.contactName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedAgency.email}</p>
                    </div>
                    {selectedAgency.phone && (
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedAgency.phone}</p>
                      </div>
                    )}
                    {selectedAgency.website && (
                      <div>
                        <p className="text-muted-foreground">Website</p>
                        <a
                          href={selectedAgency.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-emerald-400 hover:underline"
                        >
                          {selectedAgency.website}
                        </a>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">
                        {[selectedAgency.city, selectedAgency.region, selectedAgency.country]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                    {selectedAgency.address && (
                      <div>
                        <p className="text-muted-foreground">Address</p>
                        <p className="font-medium">{selectedAgency.address}</p>
                      </div>
                    )}
                  </div>
                  {selectedAgency.description && (
                    <div className="mt-4">
                      <p className="text-muted-foreground mb-2">Description</p>
                      <p className="text-sm">{selectedAgency.description}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Media Listings */}
                {selectedAgency.listings && selectedAgency.listings.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">
                      Media Listings ({selectedAgency.listings.length})
                    </h3>
                    <div className="space-y-4">
                      {selectedAgency.listings.map((listing) => {
                        const Icon = MEDIA_TYPE_ICONS[listing.listingType] || Building2;
                        return (
                          <Card key={listing.id} className="border-emerald-900/30">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                {listing.imageUrl && (
                                  <img
                                    src={listing.imageUrl}
                                    alt={listing.name}
                                    className="w-16 h-16 rounded-lg object-cover border border-border"
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Icon className="w-5 h-5 text-emerald-400" />
                                    <h4 className="font-semibold">{listing.name}</h4>
                                    <Badge variant="outline">{listing.listingType}</Badge>
                                  </div>
                                  <div className="space-y-1 text-sm text-muted-foreground">
                                    {listing.network && (
                                      <p><span className="font-medium">Network:</span> {listing.network}</p>
                                    )}
                                    <p><span className="font-medium">Location:</span> {listing.location}</p>
                                    {listing.frequency && (
                                      <p><span className="font-medium">Frequency:</span> {listing.frequency}</p>
                                    )}
                                    {listing.reach && (
                                      <p><span className="font-medium">Reach:</span> {listing.reach}</p>
                                    )}
                                    {listing.priceRange && (
                                      <p><span className="font-medium">Price Range:</span> {listing.priceRange}</p>
                                    )}
                                    {listing.description && (
                                      <p className="mt-2">{listing.description}</p>
                                    )}
                                    {listing.demographics && listing.demographics.length > 0 && (
                                      <div className="mt-2">
                                        <p className="font-medium mb-1">Demographics:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {listing.demographics.map((demo, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                              {demo}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {listing.timeSlots && listing.timeSlots.length > 0 && (
                                      <div className="mt-2">
                                        <p className="font-medium mb-1">Time Slots:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {listing.timeSlots.map((slot, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs">
                                              {slot}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateStatus(selectedAgency.id, "REJECTED")}
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedAgency.id, "VERIFIED")}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

