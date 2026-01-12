"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Loader2, ArrowRight, ArrowLeft, Check, Plus, X, Link2, Briefcase, FileText, UserCircle, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setUserRole } from "@/actions/onboarding";
import { doctorFormSchema } from "@/lib/schema";
import { SPECIALTIES } from "@/lib/specialities";
import useFetch from "@/hooks/use-fetch";
import { useEffect } from "react";
import { UploadButton } from "@uploadthing/react";
import "@uploadthing/react/styles.css";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";

const STEPS = [
  { id: 1, name: "Basic Info", icon: UserCircle },
  { id: 2, name: "Portfolio", icon: Link2 },
  { id: 3, name: "Skills", icon: Sparkles },
  { id: 4, name: "Review", icon: Check },
];

export default function OnboardingPage() {
  const [step, setStep] = useState("choose-role");
  const [currentStep, setCurrentStep] = useState(1);
  const [portfolioUrls, setPortfolioUrls] = useState([]);
  const [newPortfolioUrl, setNewPortfolioUrl] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const router = useRouter();

  // Custom hook for user role server action
  const { loading, data, fn: submitUserRole } = useFetch(setUserRole);

  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      specialty: "",
      experience: undefined,
      credentialUrl: "",
      description: "",
      portfolioUrls: [],
      skills: [],
    },
    mode: "onChange",
  });

  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const specialtyValue = watch("specialty");
  const experienceValue = watch("experience");
  const credentialUrlValue = watch("credentialUrl");
  const descriptionValue = watch("description");

  // Handle patient role selection
  const handlePatientSelection = async () => {
    if (loading) return;

    const formData = new FormData();
    formData.append("role", "CLIENT");

    await submitUserRole(formData);
  };

  useEffect(() => {
    if (data && data?.success) {
      toast.success("Profile updated successfully!");
      
      // Trigger events to notify navbar about session update
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('auth:session-update'));
      }
      
      // Small delay before redirect to ensure session is updated
      setTimeout(() => {
        window.location.href = data.redirect;
      }, 500);
    } else if (data && data?.error) {
      console.error("Onboarding error:", data.error);
      toast.error(data.error || "Failed to save your information. Please try again.");
    }
  }, [data]);

  // Update form values when portfolio URLs or skills change
  useEffect(() => {
    setValue("portfolioUrls", portfolioUrls, { shouldValidate: true });
  }, [portfolioUrls, setValue]);

  useEffect(() => {
    setValue("skills", skills, { shouldValidate: true });
  }, [skills, setValue]);

  // Add portfolio URL
  const addPortfolioUrl = () => {
    if (!newPortfolioUrl.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      new URL(newPortfolioUrl); // Validate URL
      if (portfolioUrls.includes(newPortfolioUrl)) {
        toast.error("This URL is already added");
        return;
      }
      if (portfolioUrls.length >= 10) {
        toast.error("Maximum 10 portfolio links allowed");
        return;
      }
      setPortfolioUrls([...portfolioUrls, newPortfolioUrl.trim()]);
      setNewPortfolioUrl("");
      toast.success("Portfolio link added");
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  // Remove portfolio URL
  const removePortfolioUrl = (index) => {
    setPortfolioUrls(portfolioUrls.filter((_, i) => i !== index));
    toast.success("Portfolio link removed");
  };

  // Add skill
  const addSkill = () => {
    if (!newSkill.trim()) {
      toast.error("Please enter a skill name");
      return;
    }
    if (skills.includes(newSkill.trim())) {
      toast.error("This skill is already added");
      return;
    }
    if (skills.length >= 20) {
      toast.error("Maximum 20 skills allowed");
      return;
    }
    setSkills([...skills, newSkill.trim()]);
    setNewSkill("");
    toast.success("Skill added");
  };

  // Remove skill
  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
    toast.success("Skill removed");
  };

  // Handle form submission
  const onDoctorSubmit = async (data) => {
    if (loading) return;

    // Final validation - check all required fields
    if (!data.specialty || !data.experience || !data.credentialUrl || !data.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (portfolioUrls.length === 0) {
      toast.error("Please add at least one portfolio link");
      setCurrentStep(2);
      return;
    }

    if (skills.length === 0) {
      toast.error("Please add at least one skill");
      setCurrentStep(3);
      return;
    }

    const formData = new FormData();
    formData.append("role", "CREATOR");
    formData.append("specialty", data.specialty);
    formData.append("experience", data.experience.toString());
    formData.append("credentialUrl", data.credentialUrl);
    formData.append("description", data.description);
    
    // Add portfolio URLs
    portfolioUrls.forEach((url) => {
      formData.append("portfolioUrls[]", url);
    });
    
    // Add skills
    skills.forEach((skill) => {
      formData.append("skills[]", skill);
    });
    
    if (uploadedImageUrl) {
      formData.append("imageUrl", uploadedImageUrl);
    }

    await submitUserRole(formData);
  };

  // Navigate to next step
  const nextStep = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await trigger(["specialty", "experience", "credentialUrl", "description"]);
        break;
      case 2:
        isValid = portfolioUrls.length > 0;
        if (!isValid) {
          toast.error("Please add at least one portfolio link");
        }
        break;
      case 3:
        isValid = skills.length > 0;
        if (!isValid) {
          toast.error("Please add at least one skill");
        }
        break;
      case 4:
        // Final step - submit form
        handleSubmit(onDoctorSubmit)();
        return;
    }

    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setStep("choose-role");
    }
  };

  // Role selection screen
  if (step === "choose-role") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to Payollar</h1>
          <p className="text-gray-400 text-lg">Choose how you'd like to join our platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className="border-emerald-900/20 hover:border-emerald-700/40 cursor-pointer transition-all hover:scale-105"
            onClick={() => !loading && handlePatientSelection()}
          >
            <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-900/20 rounded-full mb-4">
                <User className="h-8 w-8 text-emerald-400" />
              </div>
              <CardTitle className="text-xl font-semibold text-white mb-2">
                Join as a Client
              </CardTitle>
              <CardDescription className="mb-4">
                Book appointments, consult with talent managers, and manage your booking experience
              </CardDescription>
              <Button
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue as Client"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card
            className="border-emerald-900/20 hover:border-emerald-700/40 cursor-pointer transition-all hover:scale-105"
            onClick={() => !loading && setStep("talent-form")}
          >
            <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-900/20 rounded-full mb-4">
                <Briefcase className="h-8 w-8 text-emerald-400" />
              </div>
              <CardTitle className="text-xl font-semibold text-white mb-2">
                Join as a Talent
              </CardTitle>
              <CardDescription className="mb-4">
                Create your professional profile, showcase your work, and start getting bookings
              </CardDescription>
              <Button
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700"
                disabled={loading}
              >
                Continue as Talent
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Talent registration form with multi-step flow
  if (step === "talent-form") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((stepItem, index) => {
              const StepIcon = stepItem.icon;
              const isActive = currentStep === stepItem.id;
              const isCompleted = currentStep > stepItem.id;

              return (
                <div key={stepItem.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : isCompleted
                          ? "bg-emerald-600/20 border-emerald-600 text-emerald-400"
                          : "bg-gray-800 border-gray-700 text-gray-500"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        isActive ? "text-white" : isCompleted ? "text-emerald-400" : "text-gray-500"
                      }`}
                    >
                      {stepItem.name}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        isCompleted ? "bg-emerald-600" : "bg-gray-700"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Card className="border-emerald-900/20">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onDoctorSubmit)} className="space-y-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <CardTitle className="text-2xl font-bold text-white mb-2">
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Tell us about your professional background and expertise
                    </CardDescription>
                  </div>

                  {/* Profile Picture */}
                  <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <div className="flex items-center gap-4">
                      {uploadedImageUrl ? (
                        <div className="relative">
                          <Image
                            src={uploadedImageUrl}
                            alt="Profile preview"
                            width={100}
                            height={100}
                            className="rounded-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-red-600 hover:bg-red-700"
                            onClick={() => setUploadedImageUrl(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center">
                          <UserCircle className="h-12 w-12 text-gray-600" />
                        </div>
                      )}
                      <UploadButton
                        endpoint="profileImage"
                        onClientUploadComplete={(res) => {
                          setUploadedImageUrl(res[0].url);
                          toast.success("Profile picture uploaded");
                        }}
                        onUploadError={(err) => {
                          toast.error("Upload failed. Please try again.");
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Upload a professional profile picture (recommended: square image, max 5MB)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialty">Talent Specialty *</Label>
                    <Select
                      value={specialtyValue}
                      onValueChange={(value) => setValue("specialty", value)}
                    >
                      <SelectTrigger id="specialty">
                        <SelectValue placeholder="Select your specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map((spec) => (
                          <SelectItem key={spec.name} value={spec.name} className="flex items-center gap-2">
                            {spec.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.specialty && (
                      <p className="text-sm font-medium text-red-500 mt-1">
                        {errors.specialty.message}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Select the category that best describes your talent
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience *</Label>
                    <Input
                      id="experience"
                      type="number"
                      placeholder="e.g. 5"
                      min="0"
                      max="70"
                      {...register("experience", { valueAsNumber: true })}
                    />
                    {errors.experience && (
                      <p className="text-sm font-medium text-red-500 mt-1">
                        {errors.experience.message}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      How many years of professional experience do you have?
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credentialUrl">Social Media / Portfolio Link *</Label>
                    <Input
                      id="credentialUrl"
                      type="url"
                      placeholder="https://instagram.com/yourprofile or https://youtube.com/yourchannel"
                      {...register("credentialUrl")}
                    />
                    {errors.credentialUrl && (
                      <p className="text-sm font-medium text-red-500 mt-1">
                        {errors.credentialUrl.message}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Link to your main social media profile or portfolio for verification (Instagram, YouTube, TikTok, etc.)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Professional Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your expertise, services, achievements, and what makes you unique. Be detailed and specific..."
                      rows="6"
                      {...register("description")}
                    />
                    {errors.description && (
                      <p className="text-sm font-medium text-red-500 mt-1">
                        {errors.description.message}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {descriptionValue?.length || 0} / 2000 characters. Minimum 50 characters required.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Portfolio Links */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <CardTitle className="text-2xl font-bold text-white mb-2">
                      Portfolio & Work Samples
                    </CardTitle>
                    <CardDescription>
                      Showcase your best work. Add links to your portfolio, projects, or media
                    </CardDescription>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        placeholder="https://example.com/portfolio or https://soundcloud.com/yourname"
                        value={newPortfolioUrl}
                        onChange={(e) => setNewPortfolioUrl(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addPortfolioUrl();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addPortfolioUrl}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>

                    {portfolioUrls.length > 0 && (
                      <div className="space-y-2">
                        <Label>Portfolio Links ({portfolioUrls.length}/10)</Label>
                        <div className="space-y-2">
                          {portfolioUrls.map((url, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                            >
                              <Link2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-sm text-emerald-400 hover:text-emerald-300 truncate"
                              >
                                {url}
                              </a>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePortfolioUrl(index)}
                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {portfolioUrls.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
                        <Link2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No portfolio links added yet</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Add at least one link to showcase your work
                        </p>
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground">
                      Add links to your work samples, portfolio website, SoundCloud, YouTube channel, or any other platform where you showcase your talent. Minimum 1 link required.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Skills */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <CardTitle className="text-2xl font-bold text-white mb-2">
                      Skills & Expertise
                    </CardTitle>
                    <CardDescription>
                      Add your key skills and areas of expertise
                    </CardDescription>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="e.g., Music Production, Video Editing, Public Speaking"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addSkill}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>

                    {skills.length > 0 && (
                      <div className="space-y-2">
                        <Label>Skills ({skills.length}/20)</Label>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-emerald-900/30 text-emerald-400 border-emerald-700/50 px-3 py-1.5 flex items-center gap-2"
                            >
                              {skill}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSkill(index)}
                                className="h-4 w-4 p-0 hover:bg-transparent"
                              >
                                <X className="h-3 w-3 text-emerald-400 hover:text-red-400" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {skills.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
                        <Sparkles className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No skills added yet</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Add at least one skill to showcase your expertise
                        </p>
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground">
                      List your key skills, talents, or areas of expertise. This helps clients find you. Minimum 1 skill required.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <CardTitle className="text-2xl font-bold text-white mb-2">
                      Review Your Information
                    </CardTitle>
                    <CardDescription>
                      Please review all your information before submitting
                    </CardDescription>
                  </div>

                  <div className="space-y-6">
                    {/* Profile Picture */}
                    {uploadedImageUrl && (
                      <div className="space-y-2">
                        <Label>Profile Picture</Label>
                        <div className="flex items-center gap-4">
                          <Image
                            src={uploadedImageUrl}
                            alt="Profile preview"
                            width={80}
                            height={80}
                            className="rounded-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <FileText className="h-5 w-5 text-emerald-400" />
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Specialty:</span>
                          <p className="text-white font-medium">{specialtyValue || "Not set"}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Experience:</span>
                          <p className="text-white font-medium">
                            {experienceValue ? `${experienceValue} years` : "Not set"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400">Social Media Link:</span>
                          <p className="text-white font-medium break-all">
                            {credentialUrlValue || "Not set"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400">Description:</span>
                          <p className="text-white mt-1 line-clamp-3">
                            {descriptionValue || "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Portfolio Links */}
                    <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-emerald-400" />
                        Portfolio Links ({portfolioUrls.length})
                      </h3>
                      {portfolioUrls.length > 0 ? (
                        <ul className="space-y-2">
                          {portfolioUrls.map((url, index) => (
                            <li key={index} className="text-sm text-emerald-400 break-all">
                              {index + 1}. {url}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 text-sm">No portfolio links added</p>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-emerald-400" />
                        Skills ({skills.length})
                      </h3>
                      {skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-emerald-900/30 text-emerald-400 border-emerald-700/50"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">No skills added</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="pt-6 flex items-center justify-between border-t border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="border-emerald-900/30"
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {currentStep === 1 ? "Back to Selection" : "Previous"}
                </Button>
                <Button
                  type={currentStep === 4 ? "submit" : "button"}
                  onClick={currentStep === 4 ? undefined : nextStep}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : currentStep === 4 ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Submit for Verification
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
