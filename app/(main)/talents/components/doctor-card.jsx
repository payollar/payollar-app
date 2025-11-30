import { User, Star, MapPin, DollarSign, Check, Clock, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function DoctorCard({ doctor }) {
  // Extract skills from doctor object
  const skills = doctor.skills?.map((skill) => skill.name) || [];
  
  // Check if doctor has available time slots
  const isAvailable = doctor.availabilities && doctor.availabilities.length > 0;
  
  // Mock data - can be enhanced with actual data from appointments/reviews
  const rating = 4.9;
  const reviews = 127;
  
  // Default location and rate - can be added to doctor model later
  const location = "Available Worldwide"; // Can be enhanced with location field
  const rate = "Book to see rates"; // Can calculate from appointments or add rate field
  
  // Experience display
  const experienceText = doctor.experience 
    ? `${doctor.experience} years experience`
    : doctor.specialty || "Talent";

  return (
    <Card className="overflow-hidden border-emerald-900/20 hover:border-emerald-700/40 transition-all bg-white dark:bg-gray-900 rounded-xl shadow-lg">
      {/* Image Section - Takes up top half */}
      <div className="relative w-full h-64 overflow-hidden">
        {doctor.imageUrl ? (
          <Image
            src={doctor.imageUrl}
            alt={doctor.name || "Talent"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-purple-500/20 flex items-center justify-center">
            <User className="h-16 w-16 text-emerald-400/50" />
          </div>
        )}

        {/* Overlay badges */}
        {/* Verified Badge - Top Left */}
        {doctor.verificationStatus === "VERIFIED" && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Check className="h-3 w-3" />
              Verified
            </Badge>
          </div>
        )}

        {/* Available Badge - Top Right */}
        {isAvailable && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Available
            </Badge>
          </div>
        )}

        {/* Rating Badge - Bottom Left */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-black/80 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{rating}</span>
            <span className="text-gray-300">({reviews})</span>
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-6 space-y-4">
        {/* Name */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {doctor.name || "Talent"}
        </h3>

        {/* Profession/Origin */}
        <p className="text-base text-gray-600 dark:text-gray-400">
          {experienceText}
        </p>

        {/* Location and Rate */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-semibold">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <span>{rate}</span>
          </div>
        </div>

        {/* Skills/Genres Tags */}
        {skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 3).map((skill, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 text-xs px-3 py-1 rounded-full"
              >
                {skill}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            asChild
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium"
          >
            <Link href={`/talents/${doctor.specialty}/${doctor.id}`}>
              Book Now
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium"
          >
            <Link href={`/talents/${doctor.specialty}/${doctor.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
