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
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, Globe, MapPin, Radio, Tv, Megaphone, Smartphone, Users, Video, Eye, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

const MEDIA_TYPE_ICONS = {
  TV: Tv,
  RADIO: Radio,
  BILLBOARD: Megaphone,
  DIGITAL: Smartphone,
  INFLUENCER_MARKETING: Users,
  VIDEO_CLIPPING: Video,
};

export function VerifiedMediaAgencies({ agencies }) {
  const [selectedAgency, setSelectedAgency] = useState(null);

  const handleViewDetails = (agency) => {
    setSelectedAgency(agency);
  };

  return (
    <div>
      <Card className="bg-muted/20 border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl font-bold text-white">
            Verified Media Agencies
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            All approved media agencies and their listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agencies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No verified media agencies yet.
            </div>
          ) : (
            <div className="space-y-4">
              {agencies.map((agency) => (
                <Card key={agency.id} className="border-emerald-900/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex flex-col gap-2">
                          {agency.logoUrl && (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-emerald-900/30 flex-shrink-0">
                              <Image
                                src={agency.logoUrl}
                                alt={agency.agencyName}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          {agency.user?.imageUrl && (
                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted/20 border-2 border-emerald-900/30 flex-shrink-0">
                              <Image
                                src={agency.user.imageUrl}
                                alt={agency.user.name || "User Profile"}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{agency.agencyName}</h3>
                            <Badge className="bg-emerald-600">Verified</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {agency.user && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>{agency.user.name || agency.user.email}</span>
                              </div>
                            )}
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
                                <span>{[agency.city, agency.region].filter(Boolean).join(", ")}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 flex gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Listings: </span>
                              <span className="font-medium">{agency._count?.listings || agency.listings?.length || 0}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Bookings: </span>
                              <span className="font-medium">{agency._count?.bookings || 0}</span>
                            </div>
                          </div>
                          {agency.listings && agency.listings.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-2">Active Listings:</p>
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
                            Verified: {format(new Date(agency.updatedAt), "PPp")}
                          </p>
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={() => handleViewDetails(agency)}
                          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
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
      <Dialog open={!!selectedAgency} onOpenChange={() => setSelectedAgency(null)}>
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
                  </div>
                  {selectedAgency.description && (
                    <div className="mt-4">
                      <p className="text-muted-foreground mb-2 text-xs sm:text-sm">Description</p>
                      <p className="text-xs sm:text-sm break-words">{selectedAgency.description}</p>
                    </div>
                  )}
                </div>

                {/* Media Listings */}
                {selectedAgency.listings && selectedAgency.listings.length > 0 && (
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold mb-3">
                      Active Media Listings ({selectedAgency.listings.length})
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
                                    <Badge className="bg-emerald-600 text-xs">{listing.status}</Badge>
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

