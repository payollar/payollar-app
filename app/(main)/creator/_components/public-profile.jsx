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
import { 
  Share2, 
  Copy, 
  ExternalLink, 
  Eye, 
  Edit, 
  Check, 
  X,
  Link2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function PublicProfile({ user, skills = [] }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publicProfileUrl, setPublicProfileUrl] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    specialty: user?.specialty || "",
    description: user?.description || "",
    portfolioUrls: user?.portfolioUrls || [],
  });
  
  const [newPortfolioUrl, setNewPortfolioUrl] = useState("");

  // Generate public profile URL on client side
  useEffect(() => {
    if (user?.id && typeof window !== 'undefined') {
      const url = `${window.location.origin}/talents/${encodeURIComponent(user.specialty || 'all')}/${user.id}`;
      setPublicProfileUrl(url);
    }
  }, [user?.id, user?.specialty]);

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
    const shareText = `Check out ${user?.name || 'my'} profile on Payollar!`;
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

  // Add portfolio URL
  const addPortfolioUrl = () => {
    if (!newPortfolioUrl.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(newPortfolioUrl);
    } catch {
      toast.error("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setFormData({
      ...formData,
      portfolioUrls: [...formData.portfolioUrls, newPortfolioUrl.trim()],
    });
    setNewPortfolioUrl("");
    toast.success("Portfolio URL added");
  };

  // Remove portfolio URL
  const removePortfolioUrl = (index) => {
    setFormData({
      ...formData,
      portfolioUrls: formData.portfolioUrls.filter((_, i) => i !== index),
    });
    toast.success("Portfolio URL removed");
  };

  // Save profile changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateFormData = new FormData();
      updateFormData.append("name", formData.name);
      updateFormData.append("specialty", formData.specialty);
      updateFormData.append("description", formData.description);
      formData.portfolioUrls.forEach((url) => {
        updateFormData.append("portfolioUrls", url);
      });

      const response = await fetch("/api/creator/profile", {
        method: "PUT",
        body: updateFormData,
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        router.refresh();
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Share Options */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Public Profile
              </CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                Customize and share your public profile with clients
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={copyToClipboard}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Profile Preview */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview
            </CardTitle>
            <CardDescription className="text-gray-400">
              How your profile appears to clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-800 mb-4">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={formData.name || "Profile"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl text-gray-500">
                        {(formData.name || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {formData.name || "Your Name"}
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  {formData.specialty || "Your Specialty"}
                </p>
                <Link
                  href={publicProfileUrl}
                  target="_blank"
                  className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1"
                >
                  View Public Profile
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-white font-semibold mb-2">About</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {formData.description || "No description added yet."}
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
              {formData.portfolioUrls.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Portfolio</h3>
                  <div className="space-y-2">
                    {formData.portfolioUrls.map((url, index) => (
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

        {/* Right Column - Edit Form */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Customize Profile</CardTitle>
            <CardDescription className="text-gray-400">
              {isEditing
                ? "Edit your public profile information"
                : "Click Edit to customize your profile"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <>
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Your full name"
                  />
                </div>

                {/* Specialty */}
                <div className="space-y-2">
                  <Label htmlFor="specialty" className="text-gray-300">
                    Specialty / Professional Title
                  </Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) =>
                      setFormData({ ...formData, specialty: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="e.g., Content Creator, Musician, Actor"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">
                    Bio / Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={5}
                    className="bg-gray-800 border-gray-700 text-white resize-none"
                    placeholder="Tell clients about yourself, your experience, and what you offer..."
                  />
                </div>

                {/* Portfolio URLs */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Portfolio Links</Label>
                  <div className="space-y-3">
                    {formData.portfolioUrls.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-gray-800 rounded border border-gray-700"
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
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                      <Button
                        onClick={addPortfolioUrl}
                        disabled={!newPortfolioUrl.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form data
                      setFormData({
                        name: user?.name || "",
                        specialty: user?.specialty || "",
                        description: user?.description || "",
                        portfolioUrls: user?.portfolioUrls || [],
                      });
                    }}
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">
                  Click Edit to customize your public profile
                </p>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Share Options */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Profile
          </CardTitle>
          <CardDescription className="text-gray-400">
            Share your profile on social media or via email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
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
            <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
              <p className="text-gray-400 text-xs mb-1">Your Profile URL:</p>
              <p className="text-emerald-400 text-sm break-all">{publicProfileUrl}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

