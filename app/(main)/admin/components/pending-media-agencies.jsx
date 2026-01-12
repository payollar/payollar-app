"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Building2, Mail, Phone, Globe, MapPin, Radio, Tv, Megaphone, Smartphone, Users, Video, User } from "lucide-react";
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
          <CardTitle className="text-lg md:text-xl font-bold text-white">
            Pending Media Agency Registrations
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
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
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {agency.logoUrl && (
                            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 border-emerald-900/30">
                              <Image
                                src={agency.logoUrl}
                                alt={agency.agencyName}
                                fill
                                className="object-cover"
                                sizes="64px"
                                unoptimized={agency.logoUrl?.startsWith('http')}
                              />
                            </div>
                          )}
                          {agency.user?.imageUrl && (
                            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-muted/20 border-2 border-emerald-900/30">
                              <Image
                                src={agency.user.imageUrl}
                                alt={agency.user.name || "User Profile"}
                                fill
                                className="object-cover"
                                sizes="48px"
                                unoptimized={agency.user.imageUrl?.startsWith('http')}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-base sm:text-lg truncate">{agency.agencyName}</h3>
                            <Badge variant="secondary" className="text-xs">Pending</Badge>
                          </div>
                          <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{agency.contactName}</span>
                            </div>
                            {agency.user && (
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">{agency.user.name || agency.user.email}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate break-all">{agency.email}</span>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
          {selectedAgency && (
            <>
              <DialogHeader>
                <div className="flex flex-col items-center sm:items-start gap-3 sm:gap-4 pb-4 border-b border-emerald-900/20">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {selectedAgency.logoUrl && (
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-4 border-emerald-900/30">
                        <Image
                          src={selectedAgency.logoUrl}
                          alt={selectedAgency.agencyName}
                          fill
                          className="object-cover"
                          sizes="96px"
                          unoptimized={selectedAgency.logoUrl?.startsWith('http')}
                        />
                      </div>
                    )}
                    {selectedAgency.user?.imageUrl && (
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-muted/20 border-4 border-emerald-900/30">
                        <Image
                          src={selectedAgency.user.imageUrl}
                          alt={selectedAgency.user.name || "User Profile"}
                          fill
                          className="object-cover"
                          sizes="80px"
                          unoptimized={selectedAgency.user.imageUrl?.startsWith('http')}
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <DialogTitle className="text-lg sm:text-2xl">{selectedAgency.agencyName}</DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                      {selectedAgency.user && (
                        <span className="block mt-1 break-all">{selectedAgency.user.name || selectedAgency.user.email}</span>
                      )}
                      Registration submitted on {format(new Date(selectedAgency.createdAt), "PPp")}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 sm:space-y-6">
                {/* Agency Information */}
                <div>
                  <h3 className="text-sm sm:text-base font-semibold mb-3">Agency Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
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
                      <div className="sm:col-span-2">
                        <p className="text-muted-foreground">Website</p>
                        <a
                          href={selectedAgency.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-emerald-400 hover:underline break-all"
                        >
                          {selectedAgency.website}
                        </a>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium break-words">
                        {[selectedAgency.city, selectedAgency.region, selectedAgency.country]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                    {selectedAgency.address && (
                      <div className="sm:col-span-2">
                        <p className="text-muted-foreground">Address</p>
                        <p className="font-medium break-words">{selectedAgency.address}</p>
                      </div>
                    )}
                  </div>
                  {selectedAgency.description && (
                    <div className="mt-4">
                      <p className="text-muted-foreground mb-2 text-xs sm:text-sm">Description</p>
                      <p className="text-xs sm:text-sm break-words">{selectedAgency.description}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Media Listings */}
                {selectedAgency.listings && selectedAgency.listings.length > 0 && (
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold mb-3">
                      Media Listings ({selectedAgency.listings.length})
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      {selectedAgency.listings.map((listing) => {
                        const Icon = MEDIA_TYPE_ICONS[listing.listingType] || Building2;
                        return (
                          <Card key={listing.id} className="border-emerald-900/30">
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                                {listing.imageUrl && (
                                  <div className="relative w-full sm:w-16 h-32 sm:h-16 rounded-lg overflow-hidden border-2 border-emerald-900/30 flex-shrink-0">
                                    <Image
                                      src={listing.imageUrl}
                                      alt={listing.name}
                                      fill
                                      className="object-cover"
                                      sizes="64px"
                                      unoptimized={listing.imageUrl?.startsWith('http')}
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                                    <h4 className="font-semibold text-sm sm:text-base truncate">{listing.name}</h4>
                                    <Badge variant="outline" className="text-xs">{listing.listingType}</Badge>
                                  </div>
                                  <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
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

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateStatus(selectedAgency.id, "REJECTED")}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedAgency.id, "VERIFIED")}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
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

