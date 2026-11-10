"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadButton } from "@uploadthing/react";
import {
  Check,
  Loader2,
  Save,
  X,
  Edit,
  Eye,
  Share2,
  Copy,
  ExternalLink,
  Facebook,
  Linkedin,
  Mail,
  Calendar,
  Briefcase,
  Globe,
  Link2,
  User,
  Pencil,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { siX } from "simple-icons";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SocialGlyph, SocialLinks } from "@/components/social-links";
import {
  CREATOR_SOCIAL_PLATFORMS,
  buildSocialUrlsFromHandles,
  normalizeSocialHandle,
  parseSocialHandlesFromUrls,
  socialHandleToUrl,
  socialLinksForDisplay,
} from "@/lib/creator-socials";

function XIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d={siX.path} />
    </svg>
  );
}

const NAV = [
  { id: "profile", label: "Personal Information", icon: User },
  { id: "public", label: "Public Profile", icon: Globe },
  { id: "availability", label: "Availability", icon: Calendar },
];

const fieldClass =
  "h-10 rounded-xl border-0 bg-[#f3f4f6] text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#0055ff]/25";

function splitName(fullName) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

function friendlyUrlLabel(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname === "/" ? "" : parsed.pathname;
    return `${parsed.host}${path}`.replace(/\/$/, "");
  } catch {
    return url;
  }
}

function portfolioHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Link";
  }
}

export function ProfilePage({ user, availabilitySlots = [] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [copied, setCopied] = useState(false);
  const [publicProfileUrl, setPublicProfileUrl] = useState("");

  const [fullName, setFullName] = useState(user?.name || "");
  const [professionalTitle, setProfessionalTitle] = useState(user?.specialty || "");
  const [bio, setBio] = useState(user?.description || "");
  const [profileImage, setProfileImage] = useState(user?.imageUrl || null);
  const initialSocial = useMemo(
    () => parseSocialHandlesFromUrls(user?.portfolioUrls || []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id]
  );
  const [socialHandles, setSocialHandles] = useState(initialSocial.handles);
  const [selectedSocialPlatform, setSelectedSocialPlatform] = useState("");
  const [socialDraftHandle, setSocialDraftHandle] = useState("");
  const [portfolioUrls, setPortfolioUrls] = useState(initialSocial.otherUrls);
  const [newPortfolioUrl, setNewPortfolioUrl] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const [currentAvailabilitySlots, setCurrentAvailabilitySlots] = useState(availabilitySlots);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState(false);
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const { firstName, lastName } = useMemo(() => splitName(fullName), [fullName]);
  const socialPreviewLinks = useMemo(
    () => socialLinksForDisplay(socialHandles),
    [socialHandles]
  );

  useEffect(() => {
    if (user?.id && typeof window !== "undefined") {
      const url = `${window.location.origin}/talents/${encodeURIComponent(user.specialty || "all")}/${user.id}`;
      setPublicProfileUrl(url);
    }
  }, [user?.id, user?.specialty]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setIsLoadingSkills(true);
        const res = await fetch("/api/skills", { credentials: "include" });
        if (res.ok) {
          setSkills(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch skills:", error);
        toast.error("Failed to load skills");
      } finally {
        setIsLoadingSkills(false);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    setCurrentAvailabilitySlots(availabilitySlots);
    if (availabilitySlots?.length > 0) {
      const slot = availabilitySlots[0];
      try {
        setStartTime(format(new Date(slot.startTime), "HH:mm"));
        setEndTime(format(new Date(slot.endTime), "HH:mm"));
        setSelectedDays(
          new Set(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
        );
      } catch (error) {
        console.error("Error initializing availability:", error);
      }
    }
  }, [availabilitySlots]);

  useEffect(() => {
    if (activeTab !== "availability") return;
    const fetchAvailability = async () => {
      try {
        setIsLoadingAvailability(true);
        const res = await fetch("/api/creator/availability", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setCurrentAvailabilitySlots(data.slots || []);
        }
      } catch (error) {
        console.error("Failed to fetch availability:", error);
      } finally {
        setIsLoadingAvailability(false);
      }
    };
    fetchAvailability();
  }, [activeTab]);

  const setFirstName = (value) => {
    const nextLast = splitName(fullName).lastName;
    setFullName([value.trim(), nextLast].filter(Boolean).join(" "));
  };

  const setLastName = (value) => {
    const nextFirst = splitName(fullName).firstName;
    setFullName([nextFirst, value.trim()].filter(Boolean).join(" "));
  };

  const discardProfileChanges = () => {
    const parsed = parseSocialHandlesFromUrls(user?.portfolioUrls || []);
    setFullName(user?.name || "");
    setProfessionalTitle(user?.specialty || "");
    setBio(user?.description || "");
    setProfileImage(user?.imageUrl || null);
    setSocialHandles(parsed.handles);
    setSelectedSocialPlatform("");
    setSocialDraftHandle("");
    setPortfolioUrls(parsed.otherUrls);
    setNewPortfolioUrl("");
    toast.message("Changes discarded");
  };

  const addSocialHandle = () => {
    if (!selectedSocialPlatform) {
      toast.error("Choose a platform first");
      return;
    }
    const cleaned = normalizeSocialHandle(selectedSocialPlatform, socialDraftHandle);
    if (!cleaned) {
      toast.error("Enter a handle");
      return;
    }
    if (!socialHandleToUrl(selectedSocialPlatform, cleaned)) {
      toast.error("Couldn’t build that profile link");
      return;
    }
    setSocialHandles((prev) => ({ ...prev, [selectedSocialPlatform]: cleaned }));
    setSocialDraftHandle("");
    toast.success("Social link added");
  };

  const removeSocialHandle = (platformId) => {
    setSocialHandles((prev) => ({ ...prev, [platformId]: "" }));
  };

  const addSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newSkill }),
      });
      if (!res.ok) throw new Error("Failed to add skill");
      const skill = await res.json();
      setSkills((prev) => [...prev, skill]);
      setNewSkill("");
      toast.success("Skill added successfully");
    } catch (error) {
      console.error("Failed to add skill:", error);
      toast.error("Failed to add skill");
    }
  };

  const deleteSkill = async (id) => {
    try {
      const res = await fetch(`/api/skills?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete skill");
      setSkills((prev) => prev.filter((s) => s.id !== id));
      toast.success("Skill removed successfully");
    } catch (error) {
      console.error("Failed to delete skill:", error);
      toast.error("Failed to remove skill");
    }
  };

  const addPortfolioUrl = () => {
    if (!newPortfolioUrl.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }
    try {
      new URL(newPortfolioUrl);
      setPortfolioUrls([...portfolioUrls, newPortfolioUrl.trim()]);
      setNewPortfolioUrl("");
      toast.success("Portfolio URL added");
    } catch {
      toast.error("Please enter a valid URL (e.g., https://example.com)");
    }
  };

  const removePortfolioUrl = (index) => {
    setPortfolioUrls(portfolioUrls.filter((_, i) => i !== index));
    toast.success("Portfolio URL removed");
  };

  const copyToClipboard = async () => {
    if (!publicProfileUrl) {
      toast.error("Profile URL not available");
      return;
    }
    try {
      await navigator.clipboard.writeText(publicProfileUrl);
      setCopied(true);
      toast.success("Profile link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareOnSocial = (platform) => {
    const shareText = `Check out ${fullName || "my"} profile on PAYOLA!`;
    const encodedUrl = encodeURIComponent(publicProfileUrl);
    const encodedText = encodeURIComponent(shareText);
    const urls = {
      x: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodedUrl}`,
    };
    if (urls[platform]) window.open(urls[platform], "_blank", "width=600,height=400");
  };

  const handleUploadComplete = (res) => {
    try {
      let imageUrl = null;
      if (Array.isArray(res) && res.length > 0) {
        const file = res[0];
        imageUrl = file?.key ? `https://utfs.io/f/${file.key}` : file?.url || file?.serverData?.url;
      } else if (res && typeof res === "object") {
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
  };

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
      if (profileImage) formData.append("imageUrl", profileImage);
      const urls = [...buildSocialUrlsFromHandles(socialHandles), ...portfolioUrls];
      if (urls.length === 0) {
        formData.append("portfolioUrls", "");
        formData.append("clearPortfolioUrls", "1");
      } else {
        urls.forEach((url) => formData.append("portfolioUrls", url));
      }

      const response = await fetch("/api/creator/profile", {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to update profile");
      toast.success("Profile updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const getDailyAvailability = () => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const availability = {};
    if (currentAvailabilitySlots?.length > 0) {
      const slot = currentAvailabilitySlots[0];
      try {
        const start = format(new Date(slot.startTime), "h:mm a");
        const end = format(new Date(slot.endTime), "h:mm a");
        days.forEach((day) => {
          availability[day] = { available: true, time: `${start} - ${end}` };
        });
      } catch {
        days.forEach((day) => {
          availability[day] = { available: false, time: null };
        });
      }
    } else {
      days.forEach((day) => {
        availability[day] = { available: false, time: null };
      });
    }
    return availability;
  };

  const dailyAvailability = getDailyAvailability();

  const toggleDay = (day) => {
    const next = new Set(selectedDays);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    setSelectedDays(next);
  };

  const handleSaveAvailability = async () => {
    if (!startTime || !endTime) {
      toast.error("Please set start and end times");
      return;
    }
    if (selectedDays.size === 0) {
      toast.error("Please select at least one day");
      return;
    }

    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(startHours, startMinutes, 0, 0);
    const endDate = new Date();
    endDate.setHours(endHours, endMinutes, 0, 0);
    if (startDate >= endDate) {
      toast.error("End time must be after start time");
      return;
    }

    setIsSavingAvailability(true);
    try {
      const formData = new FormData();
      formData.append("startTime", startDate.toISOString());
      formData.append("endTime", endDate.toISOString());
      const response = await fetch("/api/creator/availability", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update availability");
      const data = await response.json();
      setCurrentAvailabilitySlots(data.slots || []);
      setEditingAvailability(false);
      toast.success("Availability updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Failed to save availability:", error);
      toast.error(error.message || "Failed to update availability");
    } finally {
      setIsSavingAvailability(false);
    }
  };

  const sectionTitle =
    activeTab === "profile"
      ? "Personal Information"
      : activeTab === "public"
        ? "Public Profile"
        : "Availability";

  return (
    <div className="-m-3 flex h-[calc(100%+1.5rem)] min-h-0 min-w-0 flex-col overflow-hidden bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:h-[calc(100%+2.5rem)] md:p-5">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
        <div className="grid min-h-0 flex-1 overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_16px_48px_rgba(15,23,42,0.06)] lg:grid-cols-[15.5rem_minmax(0,1fr)]">
          {/* Left rail */}
          <aside className="shrink-0 border-b border-slate-100 bg-[#fafafa] px-5 py-5 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:py-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="relative h-[5.5rem] w-[5.5rem] overflow-hidden rounded-full bg-[#e8f0ff] ring-4 ring-white sm:h-24 sm:w-24">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt={fullName || "Profile"}
                      fill
                      className="object-cover"
                      unoptimized={profileImage?.startsWith("http")}
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-[#0055ff]">
                      {(fullName || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0">
                  <div className="relative">
                    <UploadButton
                      endpoint="profileImage"
                      onClientUploadComplete={handleUploadComplete}
                      onUploadError={(error) => {
                        toast.error(`Upload failed: ${error.message || "Please try again."}`);
                      }}
                      appearance={{
                        button:
                          "flex !h-7 !w-7 items-center justify-center !rounded-full border-2 border-white !bg-[#0055ff] p-0 text-[0px] text-transparent after:hidden hover:!bg-[#0046d4]",
                        allowedContent: "hidden",
                        container: "w-auto",
                      }}
                    />
                    <Pencil className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
              <h2 className="mt-3 text-base font-semibold tracking-tight text-slate-950">
                {fullName || "Your Name"}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {professionalTitle || "Creator"}
              </p>
            </div>

            <nav className="mt-5 space-y-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                      active
                        ? "bg-[#e8f0ff] text-[#0055ff]"
                        : "text-slate-600 hover:bg-white hover:text-slate-950"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active ? "text-[#0055ff]" : "text-slate-400")} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main panel */}
          <section className="flex min-h-0 min-w-0 flex-col">
            <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-7">
              <div className="min-w-0">
                <h1 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                  {sectionTitle}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  {activeTab === "profile"
                    ? "Update the details clients see on your Payollar profile."
                    : activeTab === "public"
                      ? "Preview, share, and manage portfolio links."
                      : "Set the days and hours you’re open for bookings."}
                </p>
              </div>
              {publicProfileUrl ? (
                <Link
                  href={publicProfileUrl}
                  target="_blank"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-[#0055ff]/40 hover:text-[#0055ff]"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View public page
                </Link>
              ) : null}
            </div>

            {activeTab === "profile" ? (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-7">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="firstName" className="text-xs font-medium text-slate-500">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={fieldClass}
                        placeholder="First name"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lastName" className="text-xs font-medium text-slate-500">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={fieldClass}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <Label htmlFor="email" className="text-xs font-medium text-slate-500">
                      Email
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        value={user?.email || ""}
                        readOnly
                        className={cn(fieldClass, "pr-28 text-slate-600")}
                      />
                      {user?.emailVerified || user?.emailVerifiedAt ? (
                        <span className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 text-xs font-semibold text-emerald-600">
                          <Check className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                          Account email
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <Label htmlFor="specialty" className="text-xs font-medium text-slate-500">
                      Specialty / Title
                    </Label>
                    <Input
                      id="specialty"
                      value={professionalTitle}
                      onChange={(e) => setProfessionalTitle(e.target.value)}
                      className={fieldClass}
                      placeholder="e.g., Content Creator, Musician, Actor"
                    />
                  </div>

                  <div className="mt-3 space-y-1">
                    <Label htmlFor="bio" className="text-xs font-medium text-slate-500">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={2}
                      className="min-h-[64px] resize-none rounded-xl border-0 bg-[#f3f4f6] text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#0055ff]/25"
                      placeholder="Tell clients about yourself, your experience, and what you offer…"
                    />
                    <p className="text-[11px] text-slate-400">{bio.length} characters</p>
                  </div>

                  <div className="mt-3 space-y-1">
                    <Label className="text-xs font-medium text-slate-500">Skills & Expertise</Label>
                    <div className="min-h-[44px] rounded-xl bg-[#f3f4f6] p-2.5">
                      {isLoadingSkills ? (
                        <p className="text-sm text-slate-400">Loading…</p>
                      ) : skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <Badge
                              key={skill.id}
                              className="inline-flex items-center gap-1.5 border-0 bg-white px-2.5 py-1 text-[#0055ff] shadow-sm"
                            >
                              {skill.name}
                              <button
                                type="button"
                                onClick={() => deleteSkill(skill.id)}
                                className="text-slate-400 hover:text-rose-500"
                                aria-label={`Remove ${skill.name}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">No skills added yet</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                        className={cn(fieldClass, "flex-1")}
                        placeholder="Add a skill…"
                      />
                      <Button
                        type="button"
                        onClick={addSkill}
                        disabled={!newSkill.trim()}
                        className="h-10 rounded-xl bg-[#0055ff] px-4 text-white hover:bg-[#0046d4]"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-white px-5 py-3 sm:flex-row sm:justify-end sm:gap-3 sm:px-7">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={discardProfileChanges}
                    className="h-10 rounded-full border-[#0055ff]/40 px-5 font-semibold text-[#0055ff] hover:bg-[#e8f0ff]"
                  >
                    Discard Changes
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving || !fullName.trim() || !bio.trim()}
                    className="h-10 rounded-full bg-[#0055ff] px-5 font-semibold text-white hover:bg-[#0046d4]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : null}

            {activeTab === "public" ? (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-7">
                  <div className="mx-auto max-w-2xl space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                          <Link2 className="h-4 w-4 text-[#0055ff]" />
                          Profile link
                        </div>
                        <button
                          type="button"
                          onClick={copyToClipboard}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f0ff] px-2.5 py-1 text-xs font-semibold text-[#0055ff] hover:bg-[#dbe7ff]"
                        >
                          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          {copied ? "Copied" : "Copy"}
                        </button>
                      </div>
                      {publicProfileUrl ? (
                        <div className="flex items-center gap-2 rounded-xl bg-[#f3f4f6] px-3 py-2.5">
                          <Globe className="h-4 w-4 shrink-0 text-slate-400" />
                          <p className="min-w-0 flex-1 truncate text-sm text-slate-700" title={publicProfileUrl}>
                            {friendlyUrlLabel(publicProfileUrl)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">Profile URL will appear once your account loads.</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[
                          { id: "x", label: "X", icon: XIcon, iconOnly: true },
                          { id: "facebook", label: "Facebook", icon: Facebook },
                          { id: "linkedin", label: "LinkedIn", icon: Linkedin },
                          { id: "email", label: "Email", icon: Mail },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => shareOnSocial(item.id)}
                              aria-label={item.label}
                              className={cn(
                                "inline-flex h-9 items-center rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50",
                                item.iconOnly ? "w-9 justify-center px-0" : "gap-1.5 px-3"
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {item.iconOnly ? null : item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-950">
                        <Share2 className="h-4 w-4 text-[#0055ff]" />
                        Social media
                      </div>
                      <p className="mb-3 text-xs text-slate-500">
                        Pick a platform, add your handle, then manage the links below.
                      </p>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Select
                          value={selectedSocialPlatform || undefined}
                          onValueChange={(value) => {
                            setSelectedSocialPlatform(value);
                            setSocialDraftHandle(socialHandles[value] || "");
                          }}
                        >
                          <SelectTrigger
                            className={cn(
                              fieldClass,
                              "h-10 w-full min-w-[10.5rem] border-0 shadow-none sm:w-[11.5rem]"
                            )}
                            aria-label="Choose social platform"
                          >
                            <SelectValue placeholder="Platform" />
                          </SelectTrigger>
                          <SelectContent>
                            {CREATOR_SOCIAL_PLATFORMS.map((platform) => (
                              <SelectItem key={platform.id} value={platform.id} textValue={platform.label}>
                                <span className="flex items-center gap-2.5">
                                  <SocialGlyph network={platform.network} size={16} />
                                  <span className="text-sm">{platform.label}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="relative min-w-0 flex-1">
                          {selectedSocialPlatform &&
                          CREATOR_SOCIAL_PLATFORMS.find((p) => p.id === selectedSocialPlatform)
                            ?.prefix ? (
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                              {
                                CREATOR_SOCIAL_PLATFORMS.find(
                                  (p) => p.id === selectedSocialPlatform
                                )?.prefix
                              }
                            </span>
                          ) : null}
                          <Input
                            value={socialDraftHandle}
                            onChange={(e) => setSocialDraftHandle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addSocialHandle();
                              }
                            }}
                            disabled={!selectedSocialPlatform}
                            className={cn(
                              fieldClass,
                              "w-full",
                              selectedSocialPlatform &&
                                CREATOR_SOCIAL_PLATFORMS.find(
                                  (p) => p.id === selectedSocialPlatform
                                )?.prefix
                                ? "pl-8"
                                : ""
                            )}
                            placeholder={
                              selectedSocialPlatform
                                ? CREATOR_SOCIAL_PLATFORMS.find(
                                    (p) => p.id === selectedSocialPlatform
                                  )?.placeholder || "handle"
                                : "Select a platform first"
                            }
                            autoComplete="off"
                          />
                        </div>

                        <Button
                          type="button"
                          onClick={addSocialHandle}
                          disabled={!selectedSocialPlatform || !socialDraftHandle.trim()}
                          className="h-10 shrink-0 rounded-xl bg-[#0055ff] px-3 text-white hover:bg-[#0046d4]"
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Add
                        </Button>
                      </div>

                      {socialPreviewLinks.length > 0 ? (
                        <div className="mt-4 space-y-3">
                          <SocialLinks
                            links={socialPreviewLinks}
                            variant="icons"
                            theme="light"
                          />
                          <ul className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            {socialPreviewLinks.map((link) => {
                              const platform = CREATOR_SOCIAL_PLATFORMS.find(
                                (item) => item.network === link.network || item.id === link.network
                              );
                              const platformId = platform?.id || link.network;
                              return (
                                <li
                                  key={`${link.network}-${link.href}`}
                                  className="flex items-center gap-3 border-b border-slate-100 px-3 py-2.5 last:border-b-0"
                                >
                                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3f4f6] text-slate-800">
                                    <SocialGlyph network={link.network} size={16} />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-slate-900">
                                      {link.handle}
                                    </p>
                                    <a
                                      href={link.href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="truncate text-xs text-[#0055ff] hover:underline"
                                    >
                                      {friendlyUrlLabel(link.href)}
                                    </a>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeSocialHandle(platformId)}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-rose-500"
                                    aria-label={`Remove ${platform?.label || link.network}`}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : (
                        <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-[#f8f9fb] px-3 py-4 text-center text-xs text-slate-500">
                          No social links yet. Choose a platform to add one.
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-950">
                        <Briefcase className="h-4 w-4 text-[#0055ff]" />
                        Other portfolio links
                      </div>
                      <p className="mb-3 text-xs text-slate-500">
                        Sites, reels, or work samples that aren’t a social handle.
                      </p>

                      <div className="space-y-2">
                        {portfolioUrls.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-200 bg-[#f8f9fb] px-3 py-5 text-center">
                            <Link2 className="mx-auto h-5 w-5 text-slate-300" />
                            <p className="mt-2 text-sm font-medium text-slate-600">No extra links yet</p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              Optional — add Behance, Drive, or a personal site.
                            </p>
                          </div>
                        ) : (
                          portfolioUrls.map((url, index) => (
                            <div
                              key={`${url}-${index}`}
                              className="group flex items-center gap-3 rounded-xl bg-[#f3f4f6] px-3 py-2.5"
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#0055ff] shadow-sm">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-900">
                                  {portfolioHost(url)}
                                </p>
                                <p className="truncate text-xs text-slate-500">{friendlyUrlLabel(url)}</p>
                              </div>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-white hover:text-[#0055ff] group-hover:opacity-100"
                                aria-label="Open link"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                              <button
                                type="button"
                                onClick={() => removePortfolioUrl(index)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-500"
                                aria-label="Remove link"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))
                        )}

                        <div className="flex gap-2 pt-1">
                          <Input
                            value={newPortfolioUrl}
                            onChange={(e) => setNewPortfolioUrl(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addPortfolioUrl();
                              }
                            }}
                            className={cn(fieldClass, "flex-1")}
                            placeholder="https://behance.net/you"
                          />
                          <Button
                            type="button"
                            onClick={addPortfolioUrl}
                            disabled={!newPortfolioUrl.trim()}
                            className="h-10 rounded-xl bg-[#0055ff] px-3 text-white hover:bg-[#0046d4]"
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-white px-5 py-3 sm:flex-row sm:justify-end sm:gap-3 sm:px-7">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={discardProfileChanges}
                    className="h-10 rounded-full border-[#0055ff]/40 px-5 font-semibold text-[#0055ff] hover:bg-[#e8f0ff]"
                  >
                    Discard Changes
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="h-10 rounded-full bg-[#0055ff] px-5 font-semibold text-white hover:bg-[#0046d4]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : null}

            {activeTab === "availability" ? (
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-7">
              <div className="rounded-2xl bg-[#f8f9fb] p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Availability schedule</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Choose working days and hours for bookings.
                    </p>
                  </div>
                  {!editingAvailability ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingAvailability(true)}
                      className="rounded-full"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit availability
                    </Button>
                  ) : null}
                </div>

                {isLoadingAvailability ? (
                  <div className="flex items-center justify-center py-10 text-slate-500">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#0055ff]" />
                    Loading availability…
                  </div>
                ) : editingAvailability ? (
                  <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="startTime" className="text-xs font-medium text-slate-500">
                          Start Time
                        </Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className={fieldClass}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="endTime" className="text-xs font-medium text-slate-500">
                          End Time
                        </Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className={fieldClass}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block text-xs font-medium text-slate-500">
                        Select Available Days
                      </Label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                        {Object.entries(dailyAvailability).map(([day]) => {
                          const isSelected = selectedDays.has(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day)}
                              className={cn(
                                "flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition",
                                isSelected
                                  ? "border-[#0055ff] bg-[#e8f0ff] text-[#0055ff]"
                                  : "border-transparent bg-white text-slate-500 hover:border-slate-200"
                              )}
                            >
                              {isSelected ? (
                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0055ff] text-white">
                                  <Check className="h-2.5 w-2.5" />
                                </span>
                              ) : (
                                <span className="h-4 w-4 rounded-full border-2 border-slate-300" />
                              )}
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200/70 pt-5 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-full border-[#0055ff]/40 px-6 font-semibold text-[#0055ff]"
                        disabled={isSavingAvailability}
                        onClick={() => {
                          setEditingAvailability(false);
                          if (currentAvailabilitySlots?.length > 0) {
                            const slot = currentAvailabilitySlots[0];
                            try {
                              setStartTime(format(new Date(slot.startTime), "HH:mm"));
                              setEndTime(format(new Date(slot.endTime), "HH:mm"));
                              setSelectedDays(
                                new Set([
                                  "Monday",
                                  "Tuesday",
                                  "Wednesday",
                                  "Thursday",
                                  "Friday",
                                  "Saturday",
                                  "Sunday",
                                ])
                              );
                            } catch (error) {
                              console.error("Error resetting availability:", error);
                            }
                          } else {
                            setStartTime("");
                            setEndTime("");
                            setSelectedDays(new Set());
                          }
                        }}
                      >
                        Discard Changes
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSaveAvailability}
                        disabled={
                          isSavingAvailability || !startTime || !endTime || selectedDays.size === 0
                        }
                        className="h-11 rounded-full bg-[#0055ff] px-6 font-semibold text-white hover:bg-[#0046d4]"
                      >
                        {isSavingAvailability ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(dailyAvailability).map(([day, { available, time }]) => (
                      <div
                        key={day}
                        className="flex items-center justify-between rounded-xl bg-white px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          {available ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f0ff] text-[#0055ff]">
                              <Check className="h-3 w-3" />
                            </span>
                          ) : (
                            <span className="h-5 w-5 rounded-full border-2 border-slate-200" />
                          )}
                          <span className="font-medium text-slate-950">{day}</span>
                        </div>
                        {available && time ? (
                          <span className="text-sm font-medium text-[#0055ff]">{time}</span>
                        ) : (
                          <span className="text-sm text-slate-400">Not available</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
