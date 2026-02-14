"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Lock, 
  Bell, 
  Save, 
  Loader2,
  Mail,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { updateCreatorProfile } from "@/actions/doctor";
import { updateBankAccount } from "@/actions/products";
import { forgetPassword } from "@/lib/auth-client";
import Image from "next/image";
import { UploadButton } from "@uploadthing/react";
import "@uploadthing/react/styles.css";

export function CreatorSettingsClient({ user }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Profile state
  const [profileData, setProfileData] = useState({
    name: user.name || "",
    email: user.email || "",
    specialty: user.specialty || "",
    description: user.description || "",
    imageUrl: user.imageUrl || "",
  });

  // Bank account state
  const [bankData, setBankData] = useState({
    bankAccountName: user.bankAccountName || "",
    bankAccountNumber: user.bankAccountNumber || "",
    bankName: user.bankName || "",
    bankRoutingNumber: user.bankRoutingNumber || "",
    bankCountry: user.bankCountry || "Ghana",
  });

  // Password state
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Handle profile image upload
  const handleImageUpload = (res) => {
    try {
      let imageUrl = null;
      
      if (Array.isArray(res) && res.length > 0) {
        const file = res[0];
        imageUrl = file?.key ? `https://utfs.io/f/${file.key}` : file?.url || file?.serverData?.url;
      } else if (res && typeof res === 'object' && !Array.isArray(res)) {
        imageUrl = res.key ? `https://utfs.io/f/${res.key}` : res.url || res.serverData?.url;
      }
      
      if (imageUrl) {
        setProfileData(prev => ({ ...prev, imageUrl }));
        toast.success("Profile picture uploaded successfully");
      } else {
        toast.error("Upload completed but URL not found");
      }
    } catch (error) {
      console.error("Error processing upload:", error);
      toast.error("Error processing upload");
    }
  };

  // Save profile settings
  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", profileData.name.trim());
      formData.append("specialty", profileData.specialty.trim());
      formData.append("description", profileData.description.trim());
      if (profileData.imageUrl) {
        formData.append("imageUrl", profileData.imageUrl);
      }

      const result = await updateCreatorProfile(formData);
      
      if (result?.success) {
        toast.success("Profile updated successfully!");
        router.refresh();
      } else {
        throw new Error(result?.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Save bank account
  const handleSaveBankAccount = async () => {
    if (!bankData.bankAccountName || !bankData.bankAccountNumber || 
        !bankData.bankName || !bankData.bankRoutingNumber || !bankData.bankCountry) {
      toast.error("All bank account fields are required");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("bankAccountName", bankData.bankAccountName.trim());
      formData.append("bankAccountNumber", bankData.bankAccountNumber.trim());
      formData.append("bankName", bankData.bankName.trim());
      formData.append("bankRoutingNumber", bankData.bankRoutingNumber.trim());
      formData.append("bankCountry", bankData.bankCountry.trim());

      const result = await updateBankAccount(formData);
      
      if (result?.success) {
        toast.success("Bank account updated successfully!");
        router.refresh();
      } else {
        throw new Error(result?.error || "Failed to update bank account");
      }
    } catch (error) {
      console.error("Error updating bank account:", error);
      toast.error(error.message || "Failed to update bank account");
    } finally {
      setIsSaving(false);
    }
  };

  // Send password reset email
  const handleSendPasswordReset = async () => {
    setIsSendingReset(true);
    try {
      await forgetPassword({
        email: user.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error) {
      console.error("Error sending password reset:", error);
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 h-auto overflow-x-auto">
          <TabsTrigger value="profile" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 min-w-0">
            <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 min-w-0">
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Bank</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 min-w-0">
            <Lock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 min-w-0">
            <Bell className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Prefs</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Update your profile information and public details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* Profile Image */}
              <div className="space-y-3">
                <Label>Profile Picture</Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative group">
                    {profileData.imageUrl ? (
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-gray-700 flex-shrink-0">
                        <Image
                          src={profileData.imageUrl}
                          alt="Profile"
                          fill
                          className="object-cover"
                          unoptimized={true}
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
                      onClientUploadComplete={handleImageUpload}
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

              <Separator />

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted flex-1"
                  />
                  {user.emailVerified ? (
                    <div className="flex items-center gap-1 text-emerald-600 text-xs sm:text-sm whitespace-nowrap">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600 text-xs sm:text-sm whitespace-nowrap">
                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Unverified</span>
                    </div>
                  )}
                </div>
                {!user.emailVerified && (
                  <p className="text-xs text-muted-foreground">
                    Please verify your email to access all features
                  </p>
                )}
              </div>

              {/* Specialty */}
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  value={profileData.specialty}
                  onChange={(e) => setProfileData(prev => ({ ...prev, specialty: e.target.value }))}
                  placeholder="e.g., Musician, Actor, Influencer"
                />
              </div>

              {/* Description/Bio */}
              <div className="space-y-2">
                <Label htmlFor="description">Bio/Description *</Label>
                <Textarea
                  id="description"
                  value={profileData.description}
                  onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  This will be displayed on your public profile
                </p>
              </div>

              <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bank Account Tab */}
        <TabsContent value="bank" className="space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Bank Account Information</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Add your bank account details to receive payouts from product sales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Your bank account information is encrypted and secure. 
                  This information is only used for processing payouts.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccountName">Account Holder Name *</Label>
                <Input
                  id="bankAccountName"
                  value={bankData.bankAccountName}
                  onChange={(e) => setBankData(prev => ({ ...prev, bankAccountName: e.target.value }))}
                  placeholder="Name as it appears on your bank account"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Account Number *</Label>
                <Input
                  id="bankAccountNumber"
                  value={bankData.bankAccountNumber}
                  onChange={(e) => setBankData(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                  placeholder="Your bank account number"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  value={bankData.bankName}
                  onChange={(e) => setBankData(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="e.g., GCB Bank, Ecobank, Standard Chartered"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankRoutingNumber">Routing/Sort Code *</Label>
                <Input
                  id="bankRoutingNumber"
                  value={bankData.bankRoutingNumber}
                  onChange={(e) => setBankData(prev => ({ ...prev, bankRoutingNumber: e.target.value }))}
                  placeholder="Bank routing or sort code"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankCountry">Country *</Label>
                <Input
                  id="bankCountry"
                  value={bankData.bankCountry}
                  onChange={(e) => setBankData(prev => ({ ...prev, bankCountry: e.target.value }))}
                  placeholder="Country"
                />
              </div>

              <Button onClick={handleSaveBankAccount} disabled={isSaving} className="w-full">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Bank Account
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Security Settings</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage your password and account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* Email Verification Status */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base">Email Verification</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {user.emailVerified 
                          ? "Your email is verified" 
                          : "Please verify your email address"}
                      </p>
                    </div>
                  </div>
                  {user.emailVerified ? (
                    <div className="flex items-center gap-2 text-emerald-600 flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm font-medium">Verified</span>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                      <a href="/verify-email">Verify Email</a>
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              {/* Password Reset */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="font-medium mb-2 text-sm sm:text-base">Change Password</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                    Click the button below to receive a password reset link via email
                  </p>
                  <Button 
                    onClick={handleSendPasswordReset} 
                    disabled={isSendingReset}
                    variant="outline"
                    className="w-full text-xs sm:text-sm"
                  >
                    {isSendingReset ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Send Password Reset Email</span>
                        <span className="sm:hidden">Reset Password</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Account Security Info */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm sm:text-base">Account Security</h3>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <p>• Your password is encrypted and stored securely</p>
                  <p>• We recommend using a strong, unique password</p>
                  <p>• Never share your password with anyone</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Account Preferences</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage your account preferences and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base">Email Notifications</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Receive email updates about bookings and sales
                    </p>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    Coming soon
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base">SMS Notifications</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Receive SMS updates for important events
                    </p>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    Coming soon
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base">Marketing Emails</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Receive updates about new features and promotions
                    </p>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    Coming soon
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium text-sm sm:text-base">Account Information</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="text-muted-foreground">Account Created:</span>
                    <span className="sm:text-right">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="text-muted-foreground">Verification Status:</span>
                    <span className="capitalize sm:text-right">{user.verificationStatus?.toLowerCase() || "Pending"}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="capitalize sm:text-right">{user.role?.toLowerCase() || "Creator"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
