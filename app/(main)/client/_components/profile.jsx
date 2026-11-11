"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UploadButton } from "@uploadthing/react";
import {
  CalendarDays,
  FolderOpen,
  Loader2,
  Mail,
  MessageCircle,
  Save,
  Search,
  Shield,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateClientProfile } from "@/actions/patient";
import { ClientPageShell, clientCardClass } from "./client-page-shell";
import { cn, uploadThingResultToUrl } from "@/lib/utils";

const fieldClass =
  "h-11 rounded-xl border-slate-200 bg-white text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20";

function formatMemberSince(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Field({ id, label, children, hint, required }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-[#0055ff]"> *</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-xs leading-relaxed text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function ClientProfile({ user }) {
  const router = useRouter();

  const [fullName, setFullName] = useState(user?.name || "");
  const [profileImage, setProfileImage] = useState(user?.imageUrl || null);
  const [isSaving, setIsSaving] = useState(false);

  const initialName = user?.name || "";
  const initialImage = user?.imageUrl || null;

  const isDirty = useMemo(() => {
    return (
      fullName.trim() !== initialName.trim() ||
      (profileImage || null) !== (initialImage || null)
    );
  }, [fullName, profileImage, initialName, initialImage]);

  const canSave = Boolean(fullName.trim()) && isDirty;

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
        toast.success("Profile updated");
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
    const imageUrl = uploadThingResultToUrl(res);
    if (imageUrl) {
      setProfileImage(imageUrl);
      toast.success("Photo uploaded — save to keep it");
    } else {
      toast.error("Upload completed but URL was not found");
    }
  };

  const saveButton = (
    <Button
      onClick={handleSaveProfile}
      disabled={isSaving || !canSave}
      className="h-10 rounded-full bg-slate-950 px-5 text-white hover:bg-black disabled:opacity-50"
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
  );

  return (
    <ClientPageShell
      eyebrow="Account"
      title="Settings"
      description="Manage your buyer profile — name and photo used across bookings and messages."
      actions={<div className="hidden sm:block">{saveButton}</div>}
    >
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)]">
        {/* Summary */}
        <aside className="space-y-4 lg:sticky lg:top-4">
          <section className={cn(clientCardClass, "overflow-hidden p-5")}>
            <div className="flex flex-col items-center text-center">
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

              <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
                {fullName.trim() || "Your name"}
              </h2>
              <p className="mt-1 flex max-w-full items-center justify-center gap-1.5 text-sm text-slate-500">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{user?.email || "No email"}</span>
              </p>

              <div className="mt-5 w-full space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Account type
                </p>
                <div className="inline-flex w-full items-center justify-center rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#0055ff]">
                  Client
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
                  Status
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  Active
                </span>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-slate-500">
                Profile photo
              </p>
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
                  toast.error(error.message || "Upload failed");
                }}
              />
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                Square image works best. JPG or PNG, up to 4MB.
              </p>
            </div>
          </section>

          <section className={cn(clientCardClass, "p-5")}>
            <p className="text-sm font-semibold text-slate-950">Quick links</p>
            <div className="mt-3 space-y-1">
              <Link
                href="/client/talents"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <Search className="h-4 w-4 text-slate-400" />
                Browse talents
              </Link>
              <Link
                href="/client/media"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <FolderOpen className="h-4 w-4 text-slate-400" />
                Media bookings
              </Link>
              <Link
                href="/messages"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <MessageCircle className="h-4 w-4 text-slate-400" />
                Messages
              </Link>
            </div>
          </section>
        </aside>

        {/* Form */}
        <section className={cn(clientCardClass, "overflow-hidden")}>
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-slate-950">
              Profile information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              This name appears on your bookings, campaigns, and messages.
            </p>
          </div>

          <div className="space-y-5 px-5 py-5 sm:px-6">
            <Field id="fullName" label="Full name" required>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={fieldClass}
                placeholder="e.g. Ama Mensah"
                autoComplete="name"
              />
            </Field>

            <Field
              id="email"
              label="Email"
              hint="Email can’t be changed here. Contact support if you need to update it."
            >
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className={cn(
                  fieldClass,
                  "cursor-not-allowed bg-slate-50 opacity-80"
                )}
              />
            </Field>

            {isDirty ? (
              <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                You have unsaved changes.
              </p>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">
                Changes apply after you save.
              </p>
              {saveButton}
            </div>
          </div>
        </section>
      </div>
    </ClientPageShell>
  );
}
