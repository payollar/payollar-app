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
      <>
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <Badge variant="glow" className="mb-4 px-4 py-2 text-sm font-medium">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            Get started
          </Badge>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Welcome to Payollar
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Choose how you&apos;d like to join our platform
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          <Card
            className="cursor-pointer border-border bg-card shadow-md transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
            onClick={() => !loading && handlePatientSelection()}
          >
            <CardContent className="flex flex-col items-center px-6 pb-8 pt-8 text-center">
              <div className="mb-4 rounded-full bg-primary p-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="mb-2 text-xl font-semibold text-foreground">Join as a client</CardTitle>
              <CardDescription className="mb-6 text-pretty">
                Book media, post and manage your campaigns, discover talents, and keep your bookings in one place.
              </CardDescription>
              <Button variant="marketing" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue as client"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer border-border bg-card shadow-md transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
            onClick={() => !loading && setStep("talent-form")}
          >
            <CardContent className="flex flex-col items-center px-6 pb-8 pt-8 text-center">
              <div className="mb-4 rounded-full bg-primary p-4">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="mb-2 text-xl font-semibold text-foreground">Join as a talent</CardTitle>
              <CardDescription className="mb-6 text-pretty">
                Build your profile, share your portfolio, and get booked by clients.
              </CardDescription>
              <Button variant="marketing" className="w-full" disabled={loading}>
                Continue as talent
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Talent registration form with multi-step flow
  if (step === "talent-form") {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 text-center md:text-left">
          <Badge className="mb-3 rounded-full border-0 bg-primary/15 text-primary md:mb-0">
            Talent onboarding
          </Badge>
          <p className="mt-2 text-sm text-muted-foreground md:hidden">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="mb-4 flex min-w-[520px] items-center justify-between md:min-w-0">
            {STEPS.map((stepItem, index) => {
              const StepIcon = stepItem.icon;
              const isActive = currentStep === stepItem.id;
              const isCompleted = currentStep > stepItem.id;

              return (
                <div key={stepItem.id} className="flex flex-1 items-center">
                  <div className="flex flex-1 flex-col items-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25"
                          : isCompleted
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="h-6 w-6" /> : <StepIcon className="h-6 w-6" />}
                    </div>
                    <span
                      className={`mt-2 text-center text-xs font-medium sm:text-sm ${
                        isActive ? "text-foreground" : isCompleted ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {stepItem.name}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`mx-1 h-0.5 flex-1 rounded-full sm:mx-2 ${isCompleted ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Card className="border-border bg-card shadow-xl">
          <CardContent className="px-4 pb-2 pt-6 sm:px-6">
            <form onSubmit={handleSubmit(onDoctorSubmit)} className="space-y-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <CardTitle className="mb-2 text-2xl font-bold text-foreground">
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
                        <div className="relative w-24 h-24">
                          <Image
                            src={uploadedImageUrl}
                            alt="Profile preview"
                            width={100}
                            height={100}
                            className="rounded-full object-cover"
                            unoptimized={uploadedImageUrl?.startsWith('http')}
                            onError={(e) => {
                              console.error("Image load error:", e);
                              toast.error("Failed to load image. Please try uploading again.");
                            }}
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
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                          <UserCircle className="h-12 w-12 text-muted-foreground" />
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
                              setUploadedImageUrl(imageUrl);
                              toast.success("Profile picture uploaded");
                            } else {
                              toast.error("Upload completed but URL not found");
                            }
                          } catch (error) {
                            console.error("Error processing upload:", error);
                            toast.error("Error processing upload");
                          }
                        }}
                        onUploadError={(err) => {
                          console.error("Upload error:", err);
                          toast.error(`Upload failed: ${err.message || "Please try again."}`);
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
                    <CardTitle className="mb-2 text-2xl font-bold text-foreground">
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
                      <Button type="button" onClick={addPortfolioUrl} variant="marketing">
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
                              className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3"
                            >
                              <Link2 className="h-4 w-4 shrink-0 text-primary" />
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 truncate text-sm text-primary hover:text-primary/80"
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
                      <div className="rounded-lg border-2 border-dashed border-border py-8 text-center">
                        <Link2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No portfolio links added yet</p>
                        <p className="mt-2 text-sm text-muted-foreground/80">
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
                    <CardTitle className="mb-2 text-2xl font-bold text-foreground">
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
                      <Button type="button" onClick={addSkill} variant="marketing">
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
                              className="flex items-center gap-2 border border-primary/30 bg-primary/10 px-3 py-1.5 text-primary"
                            >
                              {skill}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSkill(index)}
                                className="h-4 w-4 p-0 hover:bg-transparent"
                              >
                                <X className="h-3 w-3 text-primary hover:text-destructive" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {skills.length === 0 && (
                      <div className="rounded-lg border-2 border-dashed border-border py-8 text-center">
                        <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No skills added yet</p>
                        <p className="mt-2 text-sm text-muted-foreground/80">
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
                    <CardTitle className="mb-2 text-2xl font-bold text-foreground">
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
                    <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
                      <h3 className="flex items-center gap-2 font-semibold text-foreground">
                        <FileText className="h-5 w-5 text-primary" />
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Specialty:</span>
                          <p className="font-medium text-foreground">{specialtyValue || "Not set"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Experience:</span>
                          <p className="font-medium text-foreground">
                            {experienceValue ? `${experienceValue} years` : "Not set"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Social Media Link:</span>
                          <p className="break-all font-medium text-foreground">
                            {credentialUrlValue || "Not set"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Description:</span>
                          <p className="mt-1 line-clamp-3 text-foreground">
                            {descriptionValue || "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Portfolio Links */}
                    <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
                      <h3 className="flex items-center gap-2 font-semibold text-foreground">
                        <Link2 className="h-5 w-5 text-primary" />
                        Portfolio Links ({portfolioUrls.length})
                      </h3>
                      {portfolioUrls.length > 0 ? (
                        <ul className="space-y-2">
                          {portfolioUrls.map((url, index) => (
                            <li key={index} className="break-all text-sm text-primary">
                              {index + 1}. {url}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No portfolio links added</p>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
                      <h3 className="flex items-center gap-2 font-semibold text-foreground">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Skills ({skills.length})
                      </h3>
                      {skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="border border-primary/30 bg-primary/10 text-primary"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No skills added</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between border-t border-border pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="border-primary/30 hover:bg-primary/10"
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {currentStep === 1 ? "Back to selection" : "Previous"}
                </Button>
                <Button
                  type={currentStep === 4 ? "submit" : "button"}
                  variant="marketing"
                  onClick={currentStep === 4 ? undefined : nextStep}
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
