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
import { ClientPageShell, clientCardClass } from "./client-page-shell";
import { uploadThingResultToUrl } from "@/lib/utils";

const inputClass = "border-border/60 bg-background text-foreground";

export function ClientProfile({ user }) {
  const router = useRouter();

  const [fullName, setFullName] = useState(user?.name || "");
  const [profileImage, setProfileImage] = useState(user?.imageUrl || null);
  const [isSaving, setIsSaving] = useState(false);

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
    <ClientPageShell
      eyebrow="Account"
      title="Settings"
      description="Update your profile and how you appear to creators."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className={clientCardClass}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border border-border/60 bg-muted">
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
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="mb-1 text-2xl font-bold text-foreground">
                  {fullName || "Your name"}
                </h2>
                <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
              </div>

              <div className="w-full">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Account type
                </p>
                <div className="rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  Client
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={clientCardClass}>
          <CardHeader>
            <CardTitle className="text-foreground">Profile information</CardTitle>
            <p className="text-sm text-muted-foreground">
              Update your account details and profile photo.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-muted-foreground">
                Full name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className={`${inputClass} cursor-not-allowed opacity-70`}
              />
              <p className="text-xs text-muted-foreground">
                Email can&apos;t be changed here. Contact support if you need to update it.
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-muted-foreground">Profile picture</Label>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <div className="group relative">
                  {profileImage ? (
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-2 border-border/60 sm:h-32 sm:w-32">
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
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="px-2 text-center text-xs text-white">Upload to change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-2 border-border/60 bg-muted sm:h-32 sm:w-32">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="w-full flex-1 space-y-2 sm:w-auto">
                  <UploadButton
                    endpoint="profileImage"
                    onClientUploadComplete={(res) => {
                      const imageUrl = uploadThingResultToUrl(res);
                      if (imageUrl) {
                        setProfileImage(imageUrl);
                        toast.success("Profile picture uploaded");
                      } else {
                        toast.error("Upload completed but URL was not found");
                      }
                    }}
                    onUploadError={(error) => {
                      console.error("Upload error:", error);
                      toast.error(error.message || "Upload failed");
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Square image recommended, max 4MB. JPG, PNG, or GIF.
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="marketing"
              className="w-full"
              onClick={handleSaveProfile}
              disabled={isSaving || !fullName.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className={clientCardClass}>
        <CardHeader>
          <CardTitle className="text-foreground">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="font-medium text-foreground">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium text-foreground">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ClientPageShell>
  );
}
