// /app/doctors/[id]/_components/doctor-profile.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Calendar,
  Clock,
  Medal,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Award,
  GalleryVertical,
  ShoppingBag,
  ExternalLink,
  DollarSign,
  Link2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SlotPicker } from "./slot-picker";
import { AppointmentForm } from "./appointment-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DoctorProfile({ doctor, availableDays }) {
  const [showBooking, setShowBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const router = useRouter();

  // Calculate total available slots
  const totalSlots = availableDays?.reduce(
    (total, day) => total + day.slots.length,
    0
  );

  const toggleBooking = () => {
    setShowBooking(!showBooking);
    if (!showBooking) {
      // Scroll to booking section when expanding
      setTimeout(() => {
        document.getElementById("booking-section")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBookingComplete = () => {
    router.push("/appointments");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left column - Doctor Photo and Quick Info (fixed on scroll) */}
      <div className="md:col-span-1">
        <div className="md:sticky md:top-24">
          <Card className="border-emerald-900/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 bg-emerald-900/20">
                  {doctor.imageUrl ? (
                    <Image
                      src={doctor.imageUrl}
                      alt={doctor.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-16 w-16 text-emerald-400" />
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-bold text-white mb-1">
                   {doctor.name}
                </h2>

                <Badge
                  variant="outline"
                  className="bg-emerald-900/20 border-emerald-900/30 text-emerald-400 mb-4"
                >
                  {doctor.specialty}
                </Badge>

                <div className="flex items-center justify-center mb-2">
                  <Medal className="h-4 w-4 text-emerald-400 mr-2" />
                  <span className="text-muted-foreground">
                    {doctor.experience} years experience
                  </span>
                </div>

                <Button
                  onClick={toggleBooking}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4"
                >
                  {showBooking ? (
                    <>
                      Hide Booking
                      <ChevronUp className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Book Session
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right column - Doctor Details and Booking Section */}
      <div className="md:col-span-2 space-y-6">
        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">
              About  {doctor.name}
            </CardTitle>
            <CardDescription>
              Professional background and expertise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                <h3 className="text-white font-medium">Bio</h3>
              </div>
              <p className="text-muted-foreground whitespace-pre-line">
                {doctor.description}
              </p>
            </div>

            <Separator className="bg-emerald-900/20" />

             {/* ...your existing profile card */}
      <div className="space-y-4">
      <div className="flex items-center gap-2">
      <Award className="h-5 w-5 text-emerald-400" />
        <h3 className="text-white font-medium">Skills </h3>
        </div>
        {doctor.skills?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {doctor.skills.map((skill) => (
              <Badge key={skill.id} className="bg-emerald-800 text-white">
                {skill.name}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No skills listed yet.</p>
        )}
      </div>

      <Separator className="bg-emerald-900/20" />

<div className="space-y-4">
  <div className="flex items-center gap-2">
    <GalleryVertical className="h-5 w-5 text-emerald-400" />
    <h3 className="text-white font-medium">Portfolio</h3>
  </div>

  {doctor.portfolios?.length > 0 ? (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {doctor.portfolios.map((item) => (
        <div
          key={item.id}
          className="bg-gray-900 border border-gray-700 rounded-lg p-2"
        >
          {item.fileType?.startsWith("image/") ? (
            <img
              src={item.url}
              alt={item.title || "Portfolio item"}
              className="w-full h-40 object-cover rounded"
            />
          ) : item.fileType?.startsWith("video/") ? (
            <video
              src={item.url}
              controls
              preload="metadata"
              className="w-full h-40 rounded object-cover bg-black"
            />
          ) : (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-emerald-400 hover:underline"
            >
              {item.title || "View File"}
            </a>
          )}
        </div>
      ))}
    </div>
  ) : (
    <p className="text-muted-foreground">No portfolio uploaded yet.</p>
  )}
</div>

      <Separator className="bg-emerald-900/20" />

      {/* Portfolio/Social Links Section */}
      {doctor.portfolioUrls && doctor.portfolioUrls.length > 0 && (
        <>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-emerald-400" />
              <h3 className="text-white font-medium">Social Links & Portfolio</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {doctor.portfolioUrls.map((url, index) => {
                // Extract domain name for display
                try {
                  const urlObj = new URL(url);
                  const domain = urlObj.hostname.replace("www.", "");
                  return (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-900/20 border border-emerald-700/30 rounded-lg text-emerald-400 hover:bg-emerald-900/30 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="text-sm font-medium">{domain}</span>
                    </a>
                  );
                } catch {
                  return (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-900/20 border border-emerald-700/30 rounded-lg text-emerald-400 hover:bg-emerald-900/30 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="text-sm font-medium">Link {index + 1}</span>
                    </a>
                  );
                }
              })}
            </div>
          </div>
          <Separator className="bg-emerald-900/20" />
        </>
      )}

      {/* Digital Products Section */}
      {doctor.digitalProducts && doctor.digitalProducts.length > 0 && (
        <>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-400" />
              <h3 className="text-white font-medium">Digital Products</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctor.digitalProducts.map((product) => (
                <Card
                  key={product.id}
                  className="border-emerald-900/20 hover:border-emerald-700/40 transition-all overflow-hidden"
                >
                  <div className="relative h-40 w-full">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-purple-500/20 flex items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-emerald-400/50" />
                      </div>
                    )}
                    {product.category && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-black/60 text-white text-xs">
                          {product.category}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h4 className="font-semibold text-white line-clamp-1">
                      {product.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                        <span className="font-bold text-white">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {product._count?.sales || 0} sales
                      </div>
                    </div>
                    <Button
                      asChild
                      className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <a href={`/store?product=${product.id}`}>
                        <Download className="h-4 w-4 mr-2" />
                        View & Purchase
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <Separator className="bg-emerald-900/20" />
        </>
      )}

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-400" />
                <h3 className="text-white font-medium">Availability</h3>
              </div>
              {totalSlots > 0 ? (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-emerald-400 mr-2" />
                  <p className="text-muted-foreground">
                    {totalSlots} time slots available for booking over the next
                    4 days
                  </p>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No available slots for the next 4 days. Please check back
                    later.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Booking Section - Conditionally rendered */}
        {showBooking && (
          <div id="booking-section">
            <Card className="border-emerald-900/20">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  Book a Session
                </CardTitle>
                <CardDescription>
                  Select a time slot and provide details for your booking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {totalSlots > 0 ? (
                  <>
                    {/* Slot selection step */}
                    {!selectedSlot && (
                      <SlotPicker
                        days={availableDays}
                        onSelectSlot={handleSlotSelect}
                      />
                    )}

                    {/* Appointment form step */}
                    {selectedSlot && (
                      <AppointmentForm
                        doctorId={doctor.id}
                        slot={selectedSlot}
                        onBack={() => setSelectedSlot(null)}
                        onComplete={handleBookingComplete}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-xl font-medium text-white mb-2">
                      No available slots
                    </h3>
                    <p className="text-muted-foreground">
                    This creator doesn&apos;t have any available booking
                    slots for the next 4 days. Please check back later or try
                    another creator.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
