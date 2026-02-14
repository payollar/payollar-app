"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadButton } from "@uploadthing/react";
import { Save, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateClientProfile } from "@/actions/patient";

export function ClientProfile({ user }) {
  const router = useRouter();
  
  const [fullName, setFullName] = useState(user?.name || "");
  const [profileImage, setProfileImage] = useState(user?.imageUrl || null);
  const [isSaving, setIsSaving] = useState(false);

  // Handle profile save
  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", fullName.trim());
      if (profileImage) {
        formData.append("imageUrl", profileImage);
      }

      const result = await updateClientProfile(formData);
      
      if (result?.success) {
        toast.success("Profile updated successfully!");
        router.refresh();
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

  return (
    <div className="space-y-8">
      {/* Profile Summary and Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Profile Summary */}
        <Card className="bg-gray-900 border-gray-800">
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
                    unoptimized={true}
                    onError={() => {
                      toast.error("Failed to load profile image");
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <User className="h-12 w-12 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {fullName || "Your Name"}
                </h2>
                <p className="text-gray-400 text-sm">{user?.email || ""}</p>
              </div>

              {/* Account Type */}
              <div className="w-full">
                <p className="text-gray-400 text-xs uppercase mb-2">Account Type</p>
                <div className="bg-emerald-900/20 text-emerald-200 px-4 py-2 rounded-full text-sm font-semibold">
                  Client Account
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Profile Information Form */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Profile Information</CardTitle>
            <p className="text-gray-400 text-sm">
              Update your account details and profile information.
            </p>
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
                placeholder="Your Name"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email Address</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-gray-800/50 border-gray-700 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact support if you need to update your email.
              </p>
            </div>

            {/* Profile Picture Upload */}
            <div className="space-y-3">
              <Label className="text-gray-300">Profile Picture</Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative group">
                  {profileImage ? (
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-gray-700 flex-shrink-0">
                      <Image
                        key={profileImage}
                        src={profileImage}
                        alt="Profile"
                        fill
                        className="object-cover"
                        unoptimized={true}
                        onError={() => {
                          toast.error("Failed to load profile image");
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-xs text-center px-2">Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-800 flex items-center justify-center border-2 border-gray-700 flex-shrink-0">
                      <User className="h-12 w-12 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full sm:w-auto space-y-2">
                  <UploadButton
                    endpoint="profileImage"
                    onClientUploadComplete={(res) => {
                      try {
                        let imageUrl = null;
                        
                        if (Array.isArray(res) && res.length > 0) {
                          const file = res[0];
                          imageUrl = file?.key ? `https://utfs.io/f/${file.key}` : file?.url || file?.serverData?.url;
                        } else if (res && typeof res === 'object' && !Array.isArray(res)) {
                          imageUrl = res.key ? `https://utfs.io/f/${res.key}` : res.url || res.serverData?.url;
                        }
                        
                        if (imageUrl) {
                          setProfileImage(imageUrl);
                          toast.success("Profile picture uploaded successfully");
                        } else {
                          toast.error("Upload completed but URL not found");
                        }
                      } catch (error) {
                        console.error("Error processing upload:", error);
                        toast.error("Error processing upload");
                      }
                    }}
                    onUploadError={(error) => {
                      console.error("Upload error:", error);
                      toast.error(`Upload failed: ${error.message || "Please try again."}`);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: Square image, max 4MB. JPG, PNG, or GIF.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving || !fullName.trim()}
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

      {/* Account Information */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <div>
              <p className="text-gray-400 text-sm">Member Since</p>
              <p className="text-white font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <div>
              <p className="text-gray-400 text-sm">Account Status</p>
              <p className="text-white font-medium">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

