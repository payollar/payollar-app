"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  X,
  Link2,
  UserCircle,
  Sparkles,
  Camera,
  ChevronDown,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  siBehance,
  siDribbble,
  siFacebook,
  siGithub,
  siInstagram,
  siPinterest,
  siSnapchat,
  siSoundcloud,
  siSpotify,
  siThreads,
  siTiktok,
  siTwitch,
  siWhatsapp,
  siX,
  siYoutube,
} from "simple-icons";
import { setUserRole } from "@/actions/onboarding";
import { doctorFormSchema } from "@/lib/schema";
import { SPECIALTIES } from "@/lib/specialities";
import useFetch from "@/hooks/use-fetch";
import { UploadButton } from "@uploadthing/react";
import "@uploadthing/react/styles.css";
import { toast } from "sonner";
import Image from "next/image";

const STEPS = [
  { id: 1, name: "Basic Info", detail: "Photo, specialty, and the story clients read" },
  { id: 2, name: "Portfolio", detail: "Links to the work you want them to see" },
  { id: 3, name: "Skills", detail: "What you actually do" },
  { id: 4, name: "Review", detail: "Check it, then send it in" },
];

const fieldClass =
  "h-11 w-full rounded-xl border-slate-200 bg-white text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-[#6d28d9] focus-visible:ring-[#6d28d9]/20";

const OTHER_SPECIALTY = "__other__";

const LINKEDIN_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";

const SOCIAL_PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: siInstagram, prefix: "https://instagram.com/", placeholder: "yourname" },
  { id: "tiktok", label: "TikTok", icon: siTiktok, prefix: "https://www.tiktok.com/@", placeholder: "yourname" },
  { id: "youtube", label: "YouTube", icon: siYoutube, prefix: "https://youtube.com/@", placeholder: "yourchannel" },
  { id: "facebook", label: "Facebook", icon: siFacebook, prefix: "https://facebook.com/", placeholder: "yourpage" },
  { id: "x", label: "X", icon: siX, prefix: "https://x.com/", placeholder: "yourname" },
  { id: "linkedin", label: "LinkedIn", path: LINKEDIN_PATH, hex: "0A66C2", prefix: "https://www.linkedin.com/in/", placeholder: "yourname" },
  { id: "whatsapp", label: "WhatsApp", icon: siWhatsapp, prefix: "https://wa.me/", placeholder: "233200000000" },
  { id: "snapchat", label: "Snapchat", icon: siSnapchat, prefix: "https://www.snapchat.com/add/", placeholder: "yourname" },
  { id: "threads", label: "Threads", icon: siThreads, prefix: "https://www.threads.net/@", placeholder: "yourname" },
  { id: "twitch", label: "Twitch", icon: siTwitch, prefix: "https://twitch.tv/", placeholder: "yourname" },
  { id: "spotify", label: "Spotify", icon: siSpotify, prefix: "https://open.spotify.com/user/", placeholder: "yourname" },
  { id: "soundcloud", label: "SoundCloud", icon: siSoundcloud, prefix: "https://soundcloud.com/", placeholder: "yourname" },
  { id: "pinterest", label: "Pinterest", icon: siPinterest, prefix: "https://pinterest.com/", placeholder: "yourname" },
  { id: "behance", label: "Behance", icon: siBehance, prefix: "https://www.behance.net/", placeholder: "yourname" },
  { id: "dribbble", label: "Dribbble", icon: siDribbble, prefix: "https://dribbble.com/", placeholder: "yourname" },
  { id: "github", label: "GitHub", icon: siGithub, prefix: "https://github.com/", placeholder: "yourname" },
  { id: "website", label: "Website", prefix: "https://", placeholder: "yoursite.com" },
];

function brandFill(hex) {
  if (!hex) return "#334155";
  const value = Number.parseInt(hex, 16);
  if (!Number.isFinite(value)) return "#334155";
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.82 ? "#111827" : `#${hex}`;
}

function composeProfileUrl(platform, raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (platform.id === "website") return `https://${value.replace(/^\/+/, "")}`;
  const handle = value.replace(/^@/, "").replace(/^\/+/, "");
  if (!handle) return "";
  return `${platform.prefix}${handle}`;
}

function hostLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-sm font-medium text-red-600">{message}</p>;
}

function BrandMark({ platform, className = "h-4 w-4" }) {
  const path = platform.path || platform.icon?.path;
  const hex = platform.hex || platform.icon?.hex;
  if (!path) return <Link2 className={className} aria-hidden />;
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ fill: brandFill(hex) }} aria-hidden>
      <path d={path} />
    </svg>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState("choose-role");
  const [currentStep, setCurrentStep] = useState(1);
  const [portfolioUrls, setPortfolioUrls] = useState([]);
  const [newPortfolioUrl, setNewPortfolioUrl] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  const { loading, data, fn: submitUserRole } = useFetch(setUserRole);

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
  const [specialtyMode, setSpecialtyMode] = useState("list");
  const [otherSpecialty, setOtherSpecialty] = useState("");
  const [socialId, setSocialId] = useState(SOCIAL_PLATFORMS[0].id);
  const [socialHandle, setSocialHandle] = useState("");
  const specialtyValue = watch("specialty");
  const experienceValue = watch("experience");
  const credentialUrlValue = watch("credentialUrl");
  const descriptionValue = watch("description");
  const descriptionCount = descriptionValue?.length || 0;
  const socialPlatform = SOCIAL_PLATFORMS.find((item) => item.id === socialId) || SOCIAL_PLATFORMS[0];

  useEffect(() => {
    const url = composeProfileUrl(socialPlatform, socialHandle);
    setValue("credentialUrl", url, { shouldValidate: Boolean(url) });
  }, [socialPlatform, socialHandle, setValue]);

  const handlePatientSelection = async () => {
    if (loading) return;

    const formData = new FormData();
    formData.append("role", "CLIENT");

    await submitUserRole(formData);
  };

  useEffect(() => {
    if (data && data?.success) {
      toast.success("Profile updated successfully!");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("auth:session-update"));
      }

      setTimeout(() => {
        window.location.href = data.redirect;
      }, 500);
    } else if (data && data?.error) {
      console.error("Onboarding error:", data.error);
      toast.error(data.error || "Failed to save your information. Please try again.");
    }
  }, [data]);

  useEffect(() => {
    setValue("portfolioUrls", portfolioUrls, { shouldValidate: true });
  }, [portfolioUrls, setValue]);

  useEffect(() => {
    setValue("skills", skills, { shouldValidate: true });
  }, [skills, setValue]);

  const addPortfolioUrl = () => {
    if (!newPortfolioUrl.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      new URL(newPortfolioUrl);
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

  const removePortfolioUrl = (index) => {
    setPortfolioUrls(portfolioUrls.filter((_, i) => i !== index));
    toast.success("Portfolio link removed");
  };

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

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
    toast.success("Skill removed");
  };

  const onDoctorSubmit = async (formValues) => {
    if (loading) return;

    if (!formValues.specialty || !formValues.experience || !formValues.credentialUrl || !formValues.description) {
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
    formData.append("specialty", formValues.specialty);
    formData.append("experience", formValues.experience.toString());
    formData.append("credentialUrl", formValues.credentialUrl);
    formData.append("description", formValues.description);

    portfolioUrls.forEach((url) => {
      formData.append("portfolioUrls[]", url);
    });

    skills.forEach((skill) => {
      formData.append("skills[]", skill);
    });

    if (uploadedImageUrl) {
      formData.append("imageUrl", uploadedImageUrl);
    }

    await submitUserRole(formData);
  };

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
        handleSubmit(onDoctorSubmit)();
        return;
      default:
        break;
    }

    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setStep("choose-role");
    }
  };

  if (step === "choose-role") {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-6rem)] max-w-4xl flex-col justify-center">
        <p className="text-sm font-semibold tracking-tight text-slate-950">Payollar</p>
        <h1 className="mt-4 max-w-xl font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
          How do you want to use Payollar?
        </h1>
        <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-500">
          Book talent for a project, or set up a profile so clients can find and book you.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            disabled={loading}
            onClick={handlePatientSelection}
            className="relative flex h-full flex-col rounded-[1.6rem] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#6d28d9]/30 hover:shadow-md disabled:opacity-60"
          >
            <span className="relative h-14 w-14 overflow-hidden rounded-full bg-[#efe8df] ring-2 ring-white">
              <Image
                src="/onboarding/join-client-cafe.jpg"
                alt=""
                fill
                className="object-cover object-[center_18%]"
                sizes="56px"
              />
            </span>
            <span className="mt-4 text-xl font-semibold text-slate-950">I&apos;m a client</span>
            <span className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">
              Find talent, book a session, and post campaigns from one account.
            </span>
            <span className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-800">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Continue as client
              {loading ? null : <ArrowRight className="h-4 w-4" />}
            </span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => setStep("talent-form")}
            className="relative flex h-full flex-col rounded-[1.6rem] border border-[#6d28d9]/25 bg-white p-5 text-left shadow-sm ring-1 ring-[#6d28d9]/10 transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
          >
            <span className="relative h-14 w-14 overflow-hidden rounded-full bg-[#2f9a4a] ring-2 ring-white">
              <Image
                src="/onboarding/join-creator.jpg"
                alt=""
                fill
                className="object-cover object-[center_12%]"
                sizes="56px"
              />
            </span>
            <span className="mt-4 text-xl font-semibold text-slate-950">I&apos;m a talent</span>
            <span className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">
              Build a profile, add your work, and get booked. We review it before it goes live.
            </span>
            <span className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#6d28d9] text-sm font-semibold text-white">
              Continue as talent
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (step === "talent-form") {
    const active = STEPS[currentStep - 1];

    return (
      <div className="mx-auto grid w-full max-w-5xl items-start gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-8">
          <button
            type="button"
            onClick={() => setStep("choose-role")}
            className="text-sm font-semibold tracking-tight text-slate-950"
          >
            Payollar
          </button>
          <p className="mt-1 text-xs text-slate-500">Talent profile</p>
          <ol className="mt-6 hidden space-y-1 lg:block">
            {STEPS.map((stepItem) => {
              const done = currentStep > stepItem.id;
              const isActive = currentStep === stepItem.id;
              return (
                <li key={stepItem.id}>
                  <button
                    type="button"
                    disabled={!done}
                    onClick={() => done && setCurrentStep(stepItem.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left ${
                      isActive ? "bg-white shadow-sm" : done ? "hover:bg-white/80" : ""
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        isActive
                          ? "bg-[#6d28d9] text-white"
                          : done
                            ? "bg-[#ede9fe] text-[#6d28d9]"
                            : "bg-white text-slate-400"
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" /> : stepItem.id}
                    </span>
                    <span className={`text-sm font-medium ${isActive ? "text-slate-950" : "text-slate-500"}`}>
                      {stepItem.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <div className="rounded-[1.7rem] border border-slate-200/80 bg-white p-5 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)] sm:p-8">
          <div className="mb-6 lg:hidden">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>{active.name}</span>
              <span>
                {currentStep} of {STEPS.length}
              </span>
            </div>
            <div className="flex gap-1.5">
              {STEPS.map((stepItem) => (
                <span
                  key={stepItem.id}
                  className={`h-1 flex-1 rounded-full ${currentStep >= stepItem.id ? "bg-[#6d28d9]" : "bg-slate-200"}`}
                />
              ))}
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (currentStep === 4) handleSubmit(onDoctorSubmit)();
            }}
          >
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d28d9]">
                Step {currentStep}
              </p>
              <h1 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-semibold tracking-tight text-slate-950 md:text-[1.7rem]">
                {currentStep === 1 && "Tell clients who you are"}
                {currentStep === 2 && "Show a few pieces of work"}
                {currentStep === 3 && "Add the skills you want to be booked for"}
                {currentStep === 4 && "Review before you send it"}
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{active.detail}</p>
            </div>

            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="relative shrink-0">
                    {uploadedImageUrl ? (
                      <Image
                        src={uploadedImageUrl}
                        alt=""
                        width={72}
                        height={72}
                        className="h-[72px] w-[72px] rounded-full object-cover"
                        unoptimized={uploadedImageUrl?.startsWith("http")}
                        onError={() => {
                          toast.error("Failed to load image. Please try uploading again.");
                        }}
                      />
                    ) : (
                      <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white text-slate-300 ring-1 ring-slate-200">
                        <UserCircle className="h-9 w-9" />
                      </span>
                    )}
                    {uploadedImageUrl ? (
                      <button
                        type="button"
                        onClick={() => setUploadedImageUrl(null)}
                        className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white"
                        aria-label="Remove photo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">Profile photo</p>
                    <p className="mt-0.5 text-xs text-slate-500">Optional. A square image works best, up to 4MB.</p>
                    <UploadButton
                      endpoint="profileImage"
                      appearance={{
                        container: "mt-2 w-fit flex-row items-center gap-2",
                        button:
                          "h-8! rounded-full! bg-[#6d28d9]! px-3! text-xs! font-semibold! text-white! ut-ready:bg-[#6d28d9]! ut-uploading:cursor-wait hover:bg-[#5b21b6]!",
                        allowedContent: "hidden",
                      }}
                      content={{
                        button({ ready, isUploading }) {
                          if (isUploading) return "Uploading…";
                          if (ready) return uploadedImageUrl ? "Replace photo" : "Choose photo";
                          return "Preparing…";
                        },
                      }}
                      onClientUploadComplete={(res) => {
                        try {
                          let imageUrl = null;

                          if (Array.isArray(res) && res.length > 0) {
                            const file = res[0];
                            imageUrl = file?.key ? `https://utfs.io/f/${file.key}` : file?.url || file?.serverData?.url;
                          } else if (res && typeof res === "object" && !Array.isArray(res)) {
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
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="specialty" className="text-sm font-medium text-slate-800">
                      Specialty
                    </Label>
                    <Select
                      value={specialtyMode === "other" ? OTHER_SPECIALTY : specialtyValue || undefined}
                      onValueChange={(value) => {
                        if (value === OTHER_SPECIALTY) {
                          setSpecialtyMode("other");
                          setValue("specialty", otherSpecialty.trim(), {
                            shouldValidate: Boolean(otherSpecialty.trim()),
                          });
                          return;
                        }
                        setSpecialtyMode("list");
                        setValue("specialty", value, { shouldValidate: true });
                      }}
                    >
                      <SelectTrigger id="specialty" className={`${fieldClass} justify-between`}>
                        <SelectValue placeholder="Select your specialty" />
                      </SelectTrigger>
                      <SelectContent className="border-slate-200 bg-white text-slate-900">
                        {SPECIALTIES.map((spec) => (
                          <SelectItem key={spec.name} value={spec.name} className="focus:bg-[#f3eefe] focus:text-slate-900">
                            {spec.name.trim()}
                          </SelectItem>
                        ))}
                        <SelectItem value={OTHER_SPECIALTY} className="focus:bg-[#f3eefe] focus:text-slate-900">
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {specialtyMode === "other" ? (
                      <Input
                        id="other-specialty"
                        value={otherSpecialty}
                        maxLength={60}
                        placeholder="Type your specialty"
                        className={fieldClass}
                        onChange={(event) => {
                          const next = event.target.value;
                          setOtherSpecialty(next);
                          setValue("specialty", next.trim(), { shouldValidate: true });
                        }}
                      />
                    ) : null}
                    <FieldError message={errors.specialty?.message} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="experience" className="text-sm font-medium text-slate-800">
                      Years of experience
                    </Label>
                    <Input
                      id="experience"
                      type="number"
                      inputMode="numeric"
                      placeholder="5"
                      min="0"
                      max="70"
                      className={fieldClass}
                      {...register("experience", { valueAsNumber: true })}
                    />
                    <FieldError message={errors.experience?.message} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="credentialUrl" className="text-sm font-medium text-slate-800">
                    Main profile link
                  </Label>
                  <div className="flex h-11 overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-[#6d28d9] focus-within:ring-[3px] focus-within:ring-[#6d28d9]/20">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        type="button"
                        className="flex w-14 shrink-0 items-center justify-center gap-1 border-r border-slate-200 text-slate-800 outline-none sm:w-40 sm:justify-start sm:gap-2 sm:px-3"
                        aria-label={`Profile network, ${socialPlatform.label}`}
                      >
                        <BrandMark platform={socialPlatform} />
                        <span className="hidden truncate text-sm font-medium sm:inline">{socialPlatform.label}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400 sm:ml-auto sm:h-4 sm:w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="max-h-72 w-56 overflow-y-auto border-slate-200 bg-white p-1 text-slate-900"
                      >
                        {SOCIAL_PLATFORMS.map((platform) => (
                          <DropdownMenuItem
                            key={platform.id}
                            onSelect={() => setSocialId(platform.id)}
                            className="gap-2.5 rounded-lg px-2 py-2 text-slate-800 focus:bg-[#f3eefe] focus:text-slate-900"
                          >
                            <BrandMark platform={platform} />
                            {platform.label}
                            {platform.id === socialId ? <Check className="ml-auto h-4 w-4 text-[#6d28d9]" /> : null}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <input
                      id="credentialUrl"
                      value={socialHandle}
                      onChange={(event) => setSocialHandle(event.target.value)}
                      placeholder={socialPlatform.placeholder}
                      className="min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                  <FieldError message={errors.credentialUrl?.message} />
                  <p className="truncate text-xs text-slate-500">
                    {credentialUrlValue
                      ? credentialUrlValue
                      : `Choose a network, then add your name. We save a link we can open.`}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-sm font-medium text-slate-800">
                    About your work
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="What you do, who you work with, and what a client should book you for."
                    rows={6}
                    className="min-h-36 rounded-xl border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-[#6d28d9] focus-visible:ring-[#6d28d9]/20"
                    {...register("description")}
                  />
                  <FieldError message={errors.description?.message} />
                  <div className="flex items-center justify-between text-xs">
                    <span className={descriptionCount >= 50 ? "font-medium text-emerald-600" : "text-slate-500"}>
                      {descriptionCount >= 50 ? "Long enough to continue" : `${50 - descriptionCount} characters to go`}
                    </span>
                    <span className="tabular-nums text-slate-400">{descriptionCount} / 2000</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${descriptionCount >= 50 ? "bg-[#6d28d9]" : "bg-slate-300"}`}
                      style={{ width: `${Math.min(100, (descriptionCount / 2000) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    type="url"
                    placeholder="https://youtube.com/yourchannel"
                    value={newPortfolioUrl}
                    onChange={(e) => setNewPortfolioUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPortfolioUrl();
                      }
                    }}
                    className={fieldClass}
                  />
                  <Button
                    type="button"
                    onClick={addPortfolioUrl}
                    className="h-11 shrink-0 rounded-xl bg-[#6d28d9] px-5 text-white hover:bg-[#5b21b6]"
                  >
                    <Plus className="h-4 w-4" />
                    Add link
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  {portfolioUrls.length}/10 links. At least one is required. Press Enter to add.
                </p>

                {portfolioUrls.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center">
                    <Link2 className="mx-auto h-5 w-5 text-slate-300" />
                    <p className="mt-2 text-sm text-slate-500">No links yet. Add a site, reel, or channel.</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {portfolioUrls.map((url, index) => (
                      <li key={url} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#6d28d9] ring-1 ring-slate-200">
                          <Link2 className="h-4 w-4" />
                        </span>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-900">{hostLabel(url)}</span>
                          <span className="block truncate text-xs text-slate-500">{url}</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => removePortfolioUrl(index)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-red-600"
                          aria-label="Remove link"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    type="text"
                    placeholder="Music production"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    className={fieldClass}
                  />
                  <Button
                    type="button"
                    onClick={addSkill}
                    className="h-11 shrink-0 rounded-xl bg-[#6d28d9] px-5 text-white hover:bg-[#5b21b6]"
                  >
                    <Plus className="h-4 w-4" />
                    Add skill
                  </Button>
                </div>
                <p className="text-xs text-slate-500">{skills.length}/20 skills. At least one is required. Press Enter to add.</p>

                {skills.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center">
                    <Sparkles className="mx-auto h-5 w-5 text-slate-300" />
                    <p className="mt-2 text-sm text-slate-500">Skills show up on your card so clients can scan what you do.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#f3eefe] py-1 pl-3 pr-1.5 text-sm font-medium text-[#5b21b6]"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="flex h-5 w-5 items-center justify-center rounded-full text-[#6d28d9] hover:bg-white"
                          aria-label={`Remove ${skill}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-3">
                <ReviewBlock title="Basics" onEdit={() => setCurrentStep(1)}>
                  <div className="flex items-start gap-4">
                    {uploadedImageUrl ? (
                      <Image
                        src={uploadedImageUrl}
                        alt=""
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-full object-cover"
                        unoptimized={uploadedImageUrl?.startsWith("http")}
                      />
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Camera className="h-5 w-5" />
                      </span>
                    )}
                    <dl className="min-w-0 flex-1 space-y-2 text-sm">
                      <ReviewRow label="Specialty" value={specialtyValue?.trim() || "Not set"} />
                      <ReviewRow label="Experience" value={Number.isFinite(experienceValue) ? `${experienceValue} years` : "Not set"} />
                      <ReviewRow label="Profile link" value={credentialUrlValue || "Not set"} breakAll />
                    </dl>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">{descriptionValue || "Not set"}</p>
                </ReviewBlock>

                <ReviewBlock title={`Portfolio · ${portfolioUrls.length}`} onEdit={() => setCurrentStep(2)}>
                  {portfolioUrls.length > 0 ? (
                    <ul className="space-y-1.5">
                      {portfolioUrls.map((url) => (
                        <li key={url} className="truncate text-sm text-slate-700">
                          <span className="font-medium text-slate-900">{hostLabel(url)}</span>
                          <span className="text-slate-400"> · {url}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">No portfolio links added</p>
                  )}
                </ReviewBlock>

                <ReviewBlock title={`Skills · ${skills.length}`} onEdit={() => setCurrentStep(3)}>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-[#f3eefe] px-2.5 py-1 text-xs font-medium text-[#5b21b6]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No skills added</p>
                  )}
                </ReviewBlock>

                <p className="px-1 pt-1 text-xs text-slate-500">We review talent profiles before they go live.</p>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={loading}
                className="h-11 rounded-full border-slate-200 bg-white px-4 text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                {currentStep === 1 ? "Back" : "Previous"}
              </Button>
              <Button
                type="button"
                onClick={nextStep}
                disabled={loading}
                className="h-11 rounded-full bg-[#6d28d9] px-5 text-white hover:bg-[#5b21b6]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting
                  </>
                ) : currentStep === 4 ? (
                  <>
                    <Check className="h-4 w-4" />
                    Submit for review
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
}

function ReviewBlock({ title, onEdit, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
        <button type="button" onClick={onEdit} className="text-xs font-semibold text-[#6d28d9] hover:text-[#5b21b6]">
          Edit
        </button>
      </div>
      {children}
    </section>
  );
}

function ReviewRow({ label, value, breakAll }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className={`font-medium text-slate-900 ${breakAll ? "break-all" : ""}`}>{value}</dd>
    </div>
  );
}
