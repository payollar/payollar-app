"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@uploadthing/react";
import { Save, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateCreatorProfile } from "@/actions/doctor";
import { CreatorPageShell, creatorCardClass } from "./creator-page-shell";

export function CreatorProfile({ user }) {
  const router = useRouter();
  
  const [fullName, setFullName] = useState(user?.name || "");
  const [specialty, setSpecialty] = useState(user?.specialty || "");
  const [description, setDescription] = useState(user?.description || "");
  const [profileImage, setProfileImage] = useState(user?.imageUrl || null);
  const [isSaving, setIsSaving] = useState(false);

  // Handle profile save
  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", fullName.trim());
      if (specialty) {
        formData.append("specialty", specialty.trim());
      }
      formData.append("description", description.trim());
      if (profileImage) {
        formData.append("imageUrl", profileImage);
      }

      const result = await updateCreatorProfile(formData);
      
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
    <CreatorPageShell
      eyebrow="Settings"
      title="Account"
      description="Update your creator profile and account details."
    >
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className={creatorCardClass}>
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
                <h2 className="mb-1 text-2xl font-semibold text-foreground">
                  {fullName || "Your Name"}
                </h2>
                <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
                {specialty && (
                  <p className="mt-1 text-sm text-primary">{specialty}</p>
                )}
              </div>

              {/* Account Type */}
              <div className="w-full">
                <p className="text-gray-400 text-xs uppercase mb-2">Account Type</p>
                <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  Creator account
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Profile Information Form */}
        <Card className={creatorCardClass}>
          <CardHeader>
            <CardTitle className="text-foreground">Profile information</CardTitle>
            <p className="text-gray-400 text-sm">
              Update your account details and profile information.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-300">Full Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border-border/60 bg-background"
                placeholder="Your Name"
              />
            </div>

            {/* Specialty */}
            <div className="space-y-2">
              <Label htmlFor="specialty" className="text-gray-300">Specialty</Label>
              <Input
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="border-border/60 bg-background"
                placeholder="e.g., Musician, Actor, Influencer"
              />
            </div>

            {/* Description/Bio */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">Bio/Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-border/60 bg-background"
                placeholder="Tell us about yourself..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                This will be displayed on your public profile
              </p>
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
            <div className="space-y-2">
              <Label className="text-gray-300">Profile Picture</Label>
              <div className="space-y-3">
                {profileImage && (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700">
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
                  </div>
                )}
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
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving || !fullName.trim() || !description.trim()}
              variant="marketing"
              className="w-full"
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
      <Card className={creatorCardClass}>
        <CardHeader>
          <CardTitle className="text-foreground">Account information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="font-medium text-foreground">
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
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Account status</p>
              <p className="font-medium text-foreground">Active</p>
            </div>
          </div>
          {user?.verificationStatus && (
            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 p-4">
              <div>
                <p className="text-sm text-muted-foreground">Verification</p>
                <p className="font-medium capitalize text-foreground">
                  {user.verificationStatus.toLowerCase()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </CreatorPageShell>
  );
}
