"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UploadButton } from "@uploadthing/react";
import { Check, Star, Loader2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { updateCreatorProfile } from "@/actions/doctor";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function ProfilePage({ user, availabilitySlots = [] }) {
  const { getToken } = useAuth();
  const router = useRouter();
  
  const [fullName, setFullName] = useState(user?.name || "");
  const [professionalTitle, setProfessionalTitle] = useState(
    user?.specialty || ""
  );
  const [bio, setBio] = useState(
    user?.description || ""
  );
  const [profileImage, setProfileImage] = useState(user?.imageUrl || null);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);

  // Mock rating and reviews
  const rating = 4.9;
  const reviewCount = 128;

  // Fetch skills on component mount
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setIsLoadingSkills(true);
        const token = await getToken();
        const res = await fetch("/api/skills", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSkills(data);
        }
      } catch (error) {
        console.error("Failed to fetch skills:", error);
        toast.error("Failed to load skills");
      } finally {
        setIsLoadingSkills(false);
      }
    };

    fetchSkills();
  }, [getToken]);

  // Add a new skill
  const addSkill = async () => {
    if (!newSkill.trim()) return;
    
    try {
      const token = await getToken();
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newSkill }),
      });

      if (res.ok) {
        const skill = await res.json();
        setSkills((prev) => [...prev, skill]);
        setNewSkill("");
        toast.success("Skill added successfully");
      } else {
        throw new Error("Failed to add skill");
      }
    } catch (error) {
      console.error("Failed to add skill:", error);
      toast.error("Failed to add skill");
    }
  };

  // Delete a skill
  const deleteSkill = async (id) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/skills?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (res.ok) {
        setSkills((prev) => prev.filter((s) => s.id !== id));
        toast.success("Skill removed successfully");
      } else {
        throw new Error("Failed to delete skill");
      }
    } catch (error) {
      console.error("Failed to delete skill:", error);
      toast.error("Failed to remove skill");
    }
  };

  // Handle profile save
  const handleSaveProfile = async () => {
    if (!fullName.trim() || !bio.trim()) {
      toast.error("Name and bio are required");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", fullName.trim());
      formData.append("specialty", professionalTitle.trim());
      formData.append("description", bio.trim());
      if (profileImage) {
        formData.append("imageUrl", profileImage);
      }

      const result = await updateCreatorProfile(formData);
      
      if (result?.success) {
        toast.success("Profile updated successfully!");
        router.refresh(); // Refresh to show updated data
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Process availability slots to show daily schedule
  const getDailyAvailability = () => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const availability = {};
    
    // If there's a slot, apply it to all days
    if (availabilitySlots.length > 0) {
      const slot = availabilitySlots[0];
      const startTime = format(new Date(slot.startTime), "h:mm a");
      const endTime = format(new Date(slot.endTime), "h:mm a");
      
      days.forEach(day => {
        availability[day] = {
          available: true,
          time: `${startTime} - ${endTime}`
        };
      });
    } else {
      // Default to unavailable
      days.forEach(day => {
        availability[day] = {
          available: false,
          time: null
        };
      });
    }

    return availability;
  };

  const dailyAvailability = getDailyAvailability();

  return (
    <div className="space-y-8">
      {/* Profile Summary and Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Profile Summary */}
        <Card className="bg border-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Profile Picture */}
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-800">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt={fullName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <span className="text-4xl text-gray-500">{fullName.charAt(0) || "U"}</span>
                  </div>
                )}
              </div>

              {/* Name and Title */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{fullName || "Your Name"}</h2>
                <p className="text-gray-400 text-sm">{professionalTitle || "Professional Title"}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : i < rating
                          ? "text-yellow-400 fill-yellow-400 opacity-50"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white font-medium">{rating}</span>
                <span className="text-gray-400 text-sm">({reviewCount} reviews)</span>
              </div>

              {/* Skills/Categories */}
              <div className="w-full">
                <p className="text-gray-400 text-xs uppercase mb-2">SKILLS & EXPERTISE</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {isLoadingSkills ? (
                    <p className="text-gray-500 text-sm">Loading skills...</p>
                  ) : skills.length > 0 ? (
                    skills.map((skill) => (
                      <Badge
                        key={skill.id}
                        className="bg-purple-600/20 text-purple-400 border-purple-600/30 px-3 py-1"
                      >
                        {skill.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No skills added yet</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Profile Information Form */}
        <Card className="bg border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Profile Information</CardTitle>
            <p className="text-gray-400 text-sm">Update your public profile details.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Alex Chen"
              />
            </div>

            {/* Specialty */}
            <div className="space-y-2">
              <Label htmlFor="professionalTitle" className="text-gray-300">Specialty / Professional Title</Label>
              <Input
                id="professionalTitle"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="e.g., Content Creator, Musician, Actor"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-300">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="bg-gray-800 border-gray-700 text-white resize-none"
                placeholder="Helping brands create authentic connections..."
              />
            </div>

            {/* Profile Picture Upload */}
            <div className="space-y-2">
              <Label className="text-gray-300">Profile Picture</Label>
              <div className="space-y-3">
                {profileImage && (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700">
                    <Image
                      src={profileImage}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <UploadButton
                  endpoint="profileImage"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]?.url) {
                      setProfileImage(res[0].url);
                      toast.success("Profile picture uploaded successfully");
                    }
                  }}
                  onUploadError={(error) => {
                    console.error("Upload error:", error);
                    toast.error(`Upload failed: ${error.message}`);
                  }}
                />
              </div>
            </div>

            {/* Skills Management */}
            <div className="space-y-2">
              <Label className="text-gray-300">Skills & Expertise</Label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      className="bg-purple-600/20 text-purple-400 border-purple-600/30 px-3 py-1 flex items-center gap-2"
                    >
                      {skill.name}
                      <button
                        onClick={() => deleteSkill(skill.id)}
                        className="ml-1 hover:text-red-400 transition-colors"
                        aria-label={`Remove ${skill.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add a skill (e.g., Video Editing, Voice Acting)..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <Button
                    onClick={addSkill}
                    disabled={!newSkill.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving || !fullName.trim() || !bio.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Availability Schedule */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Availability Schedule</CardTitle>
          <p className="text-gray-400 text-sm">Set your working hours and availability.</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(dailyAvailability).map(([day, { available, time }]) => (
              <div
                key={day}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  {available ? (
                    <Check className="h-5 w-5 text-green-400" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-600" />
                  )}
                  <span className="text-white font-medium">{day}</span>
                </div>
                {available && time ? (
                  <span className="text-gray-400">{time}</span>
                ) : (
                  <span className="text-gray-500">Not available</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

