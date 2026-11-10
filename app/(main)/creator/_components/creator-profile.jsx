"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@uploadthing/react";
import {
  Save,
  Loader2,
  User,
  Mail,
  BadgeCheck,
  CalendarDays,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateCreatorProfile } from "@/actions/doctor";
import { CreatorPageShell, creatorCardClass } from "./creator-page-shell";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-11 rounded-xl border-slate-200 bg-white text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20";

function formatMemberSince(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function verificationMeta(status) {
  if (status === "VERIFIED") {
    return { label: "Verified", className: "bg-emerald-50 text-emerald-700" };
  }
  if (status === "PENDING") {
    return { label: "Pending review", className: "bg-amber-50 text-amber-700" };
  }
  if (status === "REJECTED") {
    return { label: "Rejected", className: "bg-rose-50 text-rose-700" };
  }
  return { label: status || "Unknown", className: "bg-slate-100 text-slate-600" };
}

export function CreatorProfile({ user }) {
  const router = useRouter();

  const [fullName, setFullName] = useState(user?.name || "");
  const [specialty, setSpecialty] = useState(user?.specialty || "");
  const [description, setDescription] = useState(user?.description || "");
  const [profileImage, setProfileImage] = useState(user?.imageUrl || null);
  const [isSaving, setIsSaving] = useState(false);

  const verification = verificationMeta(user?.verificationStatus);
  const canSave = Boolean(fullName.trim() && description.trim());

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

  const handleUploadComplete = (res) => {
    try {
      let imageUrl = null;

      if (Array.isArray(res) && res.length > 0) {
        const file = res[0];
        imageUrl = file?.key
          ? `https://utfs.io/f/${file.key}`
          : file?.url || file?.serverData?.url;
      } else if (res && typeof res === "object" && !Array.isArray(res)) {
        imageUrl = res.key
          ? `https://utfs.io/f/${res.key}`
          : res.url || res.serverData?.url;
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
  };

  return (
    <CreatorPageShell
      eyebrow="Settings"
      title="Account"
      description="Update your creator profile and account details."
      actions={
        <Button
          onClick={handleSaveProfile}
          disabled={isSaving || !canSave}
          className="hidden h-10 rounded-full bg-slate-950 px-5 text-white hover:bg-black sm:inline-flex"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save changes
            </>
          )}
        </Button>
      }
    >
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)]">
        {/* Profile summary */}
        <aside className="space-y-4 lg:sticky lg:top-4">
          <section className={cn(creatorCardClass, "overflow-hidden p-5")}>
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="relative h-28 w-28 overflow-hidden rounded-full bg-[#e8f0ff] ring-4 ring-[#eef4ff]">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt={fullName || "Profile"}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={() => toast.error("Failed to load profile image")}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-10 w-10 text-slate-400" />
                    </div>
                  )}
                </div>
                {user?.verificationStatus === "VERIFIED" ? (
                  <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#0055ff] text-white shadow-sm ring-2 ring-white">
                    <BadgeCheck className="h-4 w-4" />
                  </span>
                ) : null}
              </div>

              <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
                {fullName || "Your name"}
              </h2>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-slate-500">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{user?.email || "No email"}</span>
              </p>
              {specialty ? (
                <p className="mt-2 text-sm font-medium text-[#0055ff]">{specialty}</p>
              ) : (
                <p className="mt-2 text-sm text-slate-400">Add a specialty</p>
              )}

              <div className="mt-5 w-full space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Account type
                </p>
                <div className="inline-flex w-full items-center justify-center rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#0055ff]">
                  Creator account
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between gap-3 rounded-xl bg-[#f7f8fc] px-3 py-2.5">
                <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Member since
                </span>
                <span className="text-xs font-semibold text-slate-900">
                  {formatMemberSince(user?.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-[#f7f8fc] px-3 py-2.5">
                <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <Shield className="h-3.5 w-3.5" />
                  Verification
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    verification.className
                  )}
                >
                  {verification.label}
                </span>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-slate-500">Profile photo</p>
              <UploadButton
                endpoint="profileImage"
                appearance={{
                  container: "w-full items-start",
                  button:
                    "h-9! w-full rounded-full! bg-slate-950! px-4! text-xs! font-semibold! text-white! ut-ready:bg-slate-950! ut-uploading:cursor-wait hover:bg-slate-800!",
                  allowedContent: "sr-only",
                }}
                content={{
                  button({ ready, isUploading }) {
                    if (isUploading) return "Uploading…";
                    if (ready) return profileImage ? "Replace photo" : "Upload photo";
                    return "Preparing…";
                  },
                }}
                onClientUploadComplete={handleUploadComplete}
                onUploadError={(error) => {
                  console.error("Upload error:", error);
                  toast.error(
                    `Upload failed: ${error.message || "Please try again."}`
                  );
                }}
              />
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                Square image works best. JPG or PNG, up to 4MB.
              </p>
            </div>
          </section>
        </aside>

        {/* Form */}
        <section className={cn(creatorCardClass, "overflow-hidden")}>
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-slate-950">Profile information</h2>
            <p className="mt-1 text-sm text-slate-500">
              These details appear on your public talent profile and campaign applications.
            </p>
          </div>

          <div className="space-y-5 px-5 py-5 sm:px-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                  Full name <span className="text-[#0055ff]">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={fieldClass}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty" className="text-sm font-medium text-slate-700">
                  Specialty
                </Label>
                <Input
                  id="specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className={fieldClass}
                  placeholder="e.g. Content creator, Musician"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                Bio <span className="text-[#0055ff]">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[140px] resize-y rounded-xl border-slate-200 bg-white text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20"
                placeholder="Tell brands who you are and what you create…"
                rows={5}
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">Shown on your public profile.</p>
                <p className="text-xs tabular-nums text-slate-400">
                  {description.trim().length} chars
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email address
              </Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className={cn(
                  fieldClass,
                  "cursor-not-allowed bg-slate-50 text-slate-500"
                )}
              />
              <p className="text-xs text-slate-400">
                Email can’t be changed here. Contact{" "}
                <a href="mailto:hey@payollar.com" className="font-medium text-[#0055ff] hover:underline">
                  hey@payollar.com
                </a>{" "}
                if you need an update.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 bg-[#fafbfd] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-slate-400">
              {canSave
                ? "Ready to save your latest changes."
                : "Name and bio are required before saving."}
            </p>
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving || !canSave}
              className="h-10 rounded-full bg-slate-950 px-5 text-white hover:bg-black"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </section>
      </div>
    </CreatorPageShell>
  );
}
