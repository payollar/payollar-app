"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadButton } from "@uploadthing/react";
import { 
  Check, 
  Star, 
  Loader2, 
  Save, 
  X, 
  Edit,
  Eye,
  Share2,
  Copy,
  ExternalLink,
  Link2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Calendar,
  Briefcase,
  Globe,
  User,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { updateCreatorProfile } from "@/actions/doctor";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ProfilePage({ user, availabilitySlots = [] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [copied, setCopied] = useState(false);
  const [publicProfileUrl, setPublicProfileUrl] = useState("");
  
  const [fullName, setFullName] = useState(user?.name || "");
  const [professionalTitle, setProfessionalTitle] = useState(user?.specialty || "");
  const [bio, setBio] = useState(user?.description || "");
  const [profileImage, setProfileImage] = useState(user?.imageUrl || null);
  const [portfolioUrls, setPortfolioUrls] = useState(user?.portfolioUrls || []);
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

  // Mock rating and reviews
  const rating = 4.9;
  const reviewCount = 128;

  // Generate public profile URL
  useEffect(() => {
    if (user?.id && typeof window !== 'undefined') {
      const url = `${window.location.origin}/talents/${encodeURIComponent(user.specialty || 'all')}/${user.id}`;
      setPublicProfileUrl(url);
    }
  }, [user?.id, user?.specialty]);

  // Fetch skills on component mount
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setIsLoadingSkills(true);
        const res = await fetch("/api/skills", {
          credentials: "include", // Include session cookie
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Fetch availability slots when availability tab is active or when slots prop changes
  useEffect(() => {
    setCurrentAvailabilitySlots(availabilitySlots);
    // Initialize selected days and times from existing slots
    if (availabilitySlots && availabilitySlots.length > 0) {
      const slot = availabilitySlots[0];
      try {
        const start = format(new Date(slot.startTime), "HH:mm");
        const end = format(new Date(slot.endTime), "HH:mm");
        setStartTime(start);
        setEndTime(end);
        // Mark all days as selected if there's an availability slot
        setSelectedDays(new Set(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]));
      } catch (error) {
        console.error("Error initializing availability:", error);
      }
    }
  }, [availabilitySlots]);

  // Fetch availability slots when availability tab is active
  useEffect(() => {
    if (activeTab === "availability") {
      const fetchAvailability = async () => {
        try {
          setIsLoadingAvailability(true);
          const res = await fetch("/api/creator/availability", {
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentAvailabilitySlots(data.slots || []);
          } else {
            console.error("Failed to fetch availability:", res.statusText);
          }
        } catch (error) {
          console.error("Failed to fetch availability:", error);
        } finally {
          setIsLoadingAvailability(false);
        }
      };
      fetchAvailability();
    }
  }, [activeTab]);

  // Add a new skill
  const addSkill = async () => {
    if (!newSkill.trim()) return;
    
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include session cookie
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
      const res = await fetch(`/api/skills?id=${id}`, {
        method: "DELETE",
        credentials: "include", // Include session cookie
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

  // Add portfolio URL
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

  // Remove portfolio URL
  const removePortfolioUrl = (index) => {
    setPortfolioUrls(portfolioUrls.filter((_, i) => i !== index));
    toast.success("Portfolio URL removed");
  };

  // Copy profile link to clipboard
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
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  // Share on social media
  const shareOnSocial = (platform) => {
    const shareText = `Check out ${fullName || 'my'} profile on PAYOLA!`;
    const encodedUrl = encodeURIComponent(publicProfileUrl);
    const encodedText = encodeURIComponent(shareText);

    const urls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodedUrl}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
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
      portfolioUrls.forEach((url) => {
        formData.append("portfolioUrls", url);
      });

      // Update via API to include portfolio URLs
      const response = await fetch("/api/creator/profile", {
        method: "PUT",
        credentials: "include", // Include session cookie
        body: formData,
      });

      if (response.ok) {
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

  // Process availability slots to show daily schedule
  const getDailyAvailability = () => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const availability = {};
    
    if (currentAvailabilitySlots && currentAvailabilitySlots.length > 0) {
      const slot = currentAvailabilitySlots[0];
      try {
        const startTime = format(new Date(slot.startTime), "h:mm a");
        const endTime = format(new Date(slot.endTime), "h:mm a");
        
        days.forEach(day => {
          availability[day] = {
            available: true,
            time: `${startTime} - ${endTime}`
          };
        });
      } catch (error) {
        console.error("Error formatting availability times:", error);
        days.forEach(day => {
          availability[day] = {
            available: false,
            time: null
          };
        });
      }
    } else {
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

  // Toggle day selection
  const toggleDay = (day) => {
    const newSelectedDays = new Set(selectedDays);
    if (newSelectedDays.has(day)) {
      newSelectedDays.delete(day);
    } else {
      newSelectedDays.add(day);
    }
    setSelectedDays(newSelectedDays);
  };

  // Save availability
  const handleSaveAvailability = async () => {
    if (!startTime || !endTime) {
      toast.error("Please set start and end times");
      return;
    }

    if (selectedDays.size === 0) {
      toast.error("Please select at least one day");
      return;
    }

    // Validate times
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

      if (response.ok) {
        const data = await response.json();
        setCurrentAvailabilitySlots(data.slots || []);
        setEditingAvailability(false);
        toast.success("Availability updated successfully!");
        router.refresh();
      } else {
        throw new Error("Failed to update availability");
      }
    } catch (error) {
      console.error("Failed to save availability:", error);
      toast.error(error.message || "Failed to update availability");
    } finally {
      setIsSavingAvailability(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-gray-400 mt-1">Manage your profile and public information</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/20"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Profile Link
              </>
            )}
          </Button>
          {publicProfileUrl && (
            <Link href={publicProfileUrl} target="_blank">
              <Button
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Public Profile
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-900 border-gray-800">
          <TabsTrigger value="profile" className="data-[state=active]:bg-emerald-600">
            <User className="h-4 w-4 mr-2" />
            Profile Info
          </TabsTrigger>
          <TabsTrigger value="public" className="data-[state=active]:bg-emerald-600">
            <Globe className="h-4 w-4 mr-2" />
            Public Profile
          </TabsTrigger>
          <TabsTrigger value="availability" className="data-[state=active]:bg-emerald-600">
            <Calendar className="h-4 w-4 mr-2" />
            Availability
          </TabsTrigger>
        </TabsList>

        {/* Profile Info Tab */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Summary */}
            <Card className="lg:col-span-1 border-emerald-900/20 bg-gray-900/50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Profile Picture */}
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-800 border-4 border-emerald-900/30">
                    {profileImage ? (
                      <Image
                        src={profileImage}
                        alt={fullName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-900/20 to-purple-900/20">
                        <span className="text-4xl text-emerald-400 font-bold">
                          {fullName.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name and Title */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {fullName || "Your Name"}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {professionalTitle || "Professional Title"}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-4 py-2">
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
                    <span className="text-gray-400 text-sm">({reviewCount})</span>
                  </div>

                  {/* Skills Preview */}
                  <div className="w-full">
                    <p className="text-gray-400 text-xs uppercase mb-3 tracking-wider">
                      Skills & Expertise
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {isLoadingSkills ? (
                        <p className="text-gray-500 text-sm">Loading...</p>
                      ) : skills.length > 0 ? (
                        skills.slice(0, 6).map((skill) => (
                          <Badge
                            key={skill.id}
                            className="bg-purple-600/20 text-purple-400 border-purple-600/30 px-2 py-1 text-xs"
                          >
                            {skill.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No skills yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Edit Form */}
            <Card className="lg:col-span-2 border-emerald-900/20 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-emerald-400" />
                  Edit Profile Information
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Update your profile details that will be visible to clients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-300">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white focus:border-emerald-600"
                    placeholder="Alex Chen"
                  />
                </div>

                {/* Specialty */}
                <div className="space-y-2">
                  <Label htmlFor="professionalTitle" className="text-gray-300">
                    Specialty / Professional Title
                  </Label>
                  <Input
                    id="professionalTitle"
                    value={professionalTitle}
                    onChange={(e) => setProfessionalTitle(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white focus:border-emerald-600"
                    placeholder="e.g., Content Creator, Musician, Actor"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-300">
                    Bio / Description *
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={5}
                    className="bg-gray-800 border-gray-700 text-white resize-none focus:border-emerald-600"
                    placeholder="Tell clients about yourself, your experience, and what you offer..."
                  />
                  <p className="text-xs text-gray-500">
                    {bio.length} characters
                  </p>
                </div>

                {/* Profile Picture Upload */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    {profileImage && (
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-600/30">
                        <Image
                          src={profileImage}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
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
                </div>

                {/* Skills Management */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Skills & Expertise</Label>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700 min-h-[60px]">
                      {skills.length > 0 ? (
                        skills.map((skill) => (
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
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No skills added yet</p>
                      )}
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
                        className="bg-gray-800 border-gray-700 text-white focus:border-emerald-600"
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
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Public Profile Tab */}
        <TabsContent value="public" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Preview */}
            <Card className="border-emerald-900/20 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-emerald-400" />
                  Public Profile Preview
                </CardTitle>
                <CardDescription className="text-gray-400">
                  How your profile appears to clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Profile Image */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-800 border-4 border-emerald-900/30 mb-4">
                      {profileImage ? (
                        <Image
                          src={profileImage}
                          alt={fullName || "Profile"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-900/20 to-purple-900/20">
                          <span className="text-4xl text-emerald-400 font-bold">
                            {(fullName || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {fullName || "Your Name"}
                    </h2>
                    <p className="text-gray-400 text-sm mb-4">
                      {professionalTitle || "Your Specialty"}
                    </p>
                    {publicProfileUrl && (
                      <Link
                        href={publicProfileUrl}
                        target="_blank"
                        className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1"
                      >
                        View Public Profile
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>

                  {/* Bio */}
                  <div>
                    <h3 className="text-white font-semibold mb-2">About</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {bio || "No description added yet."}
                    </p>
                  </div>

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <Badge
                            key={skill.id}
                            className="bg-purple-600/20 text-purple-400 border-purple-600/30"
                          >
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Portfolio Links */}
                  {portfolioUrls.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-2">Portfolio</h3>
                      <div className="space-y-2">
                        {portfolioUrls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {url}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Portfolio & Share */}
            <div className="space-y-6">
              {/* Portfolio URLs */}
              <Card className="border-emerald-900/20 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-emerald-400" />
                    Portfolio Links
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Add links to your portfolio, social media, or work samples
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {portfolioUrls.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                      >
                        <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm flex-1 truncate">
                          {url}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePortfolioUrl(index)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="https://example.com/portfolio"
                        value={newPortfolioUrl}
                        onChange={(e) => setNewPortfolioUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addPortfolioUrl();
                          }
                        }}
                        className="bg-gray-800 border-gray-700 text-white focus:border-emerald-600"
                      />
                      <Button
                        onClick={addPortfolioUrl}
                        disabled={!newPortfolioUrl.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Share Options */}
              <Card className="border-emerald-900/20 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-emerald-400" />
                    Share Your Profile
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Share your profile on social media or via email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/20"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => shareOnSocial("twitter")}
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                    <Button
                      onClick={() => shareOnSocial("facebook")}
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                    <Button
                      onClick={() => shareOnSocial("linkedin")}
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </Button>
                    <Button
                      onClick={() => shareOnSocial("email")}
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>
                  {publicProfileUrl && (
                    <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-xs mb-1">Your Profile URL:</p>
                      <p className="text-emerald-400 text-sm break-all">{publicProfileUrl}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-6 mt-6">
          <Card className="border-emerald-900/20 bg-gray-900/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-400" />
                    Availability Schedule
                  </CardTitle>
                  <CardDescription className="text-gray-400 mt-1">
                    Click on days to set your availability. Set your working hours below.
                  </CardDescription>
                </div>
                {!editingAvailability && (
                  <Button
                    onClick={() => setEditingAvailability(true)}
                    variant="outline"
                    className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/20"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Availability
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAvailability ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                  <span className="ml-2 text-gray-400">Loading availability...</span>
                </div>
              ) : editingAvailability ? (
                <div className="space-y-6">
                  {/* Time Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime" className="text-gray-300">
                        Start Time
                      </Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white focus:border-emerald-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime" className="text-gray-300">
                        End Time
                      </Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Days Selection */}
                  <div>
                    <Label className="text-gray-300 mb-3 block">Select Available Days</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {Object.entries(dailyAvailability).map(([day, { available }]) => {
                        const isSelected = selectedDays.has(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                              isSelected
                                ? "bg-emerald-900/30 border-emerald-500 text-emerald-400"
                                : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                            }`}
                          >
                            {isSelected ? (
                              <div className="h-5 w-5 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
                                <Check className="h-3 w-3 text-emerald-400" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-gray-600" />
                            )}
                            <span className="font-medium">{day}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                    <Button
                      onClick={() => {
                        setEditingAvailability(false);
                        // Reset to original values
                        if (currentAvailabilitySlots && currentAvailabilitySlots.length > 0) {
                          const slot = currentAvailabilitySlots[0];
                          try {
                            const start = format(new Date(slot.startTime), "HH:mm");
                            const end = format(new Date(slot.endTime), "HH:mm");
                            setStartTime(start);
                            setEndTime(end);
                            setSelectedDays(new Set(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]));
                          } catch (error) {
                            console.error("Error resetting availability:", error);
                          }
                        } else {
                          setStartTime("");
                          setEndTime("");
                          setSelectedDays(new Set());
                        }
                      }}
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      disabled={isSavingAvailability}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveAvailability}
                      disabled={isSavingAvailability || !startTime || !endTime || selectedDays.size === 0}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isSavingAvailability ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Availability
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(dailyAvailability).map(([day, { available, time }]) => (
                    <div
                      key={day}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        {available ? (
                          <div className="h-5 w-5 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
                            <Check className="h-3 w-3 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-600" />
                        )}
                        <span className="text-white font-medium">{day}</span>
                      </div>
                      {available && time ? (
                        <span className="text-emerald-400 font-medium">{time}</span>
                      ) : (
                        <span className="text-gray-500">Not available</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
