"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  Loader2,
  Mail,
  Phone,
  Send,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { UploadButton } from "@uploadthing/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth-client";

const fieldClass =
  "h-12 rounded-2xl border-slate-200/90 bg-[#f7f8fc] px-4 text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:border-slate-300 focus-visible:bg-white focus-visible:ring-0";

const supportCategories = [
  { value: "verification", label: "Account verification" },
  { value: "technical", label: "Technical issue" },
  { value: "billing", label: "Billing & payments" },
  { value: "booking", label: "Bookings & appointments" },
  { value: "media", label: "Media buying / listings" },
  { value: "profile", label: "Profile & settings" },
  { value: "general", label: "General inquiry" },
  { value: "other", label: "Other" },
];

function normalizeUploadFiles(res) {
  const list = Array.isArray(res) ? res : res ? [res] : [];
  return list
    .map((file) => {
      const url =
        file?.url ||
        file?.serverData?.url ||
        (file?.key ? `https://utfs.io/f/${file.key}` : null);
      if (!url) return null;
      return {
        url,
        name: file?.name || file?.serverData?.name || "Attachment",
        type: file?.type || file?.serverData?.type || null,
        size: file?.size || file?.serverData?.size || null,
      };
    })
    .filter(Boolean);
}

export default function ContactSupportPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (!session?.user) return;
    setFormData((prev) => ({
      ...prev,
      name: session.user.name || prev.name,
      email: session.user.email || prev.email,
    }));
  }, [session]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.category ||
      !formData.subject ||
      !formData.message
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.message.length < 20) {
      toast.error("Add a bit more detail (at least 20 characters)");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          priority: "medium",
          attachments,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit support request");
      }
      toast.success("Support request submitted");
      setIsSubmitted(true);
      setAttachments([]);
    } catch (error) {
      console.error("Error submitting support request:", error);
      toast.error("Couldn’t submit — please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-16 sm:px-6">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
            Message sent
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-500">
            We’ll reply to{" "}
            <span className="font-medium text-slate-800">{formData.email}</span>
            . Most requests hear back within a day.
          </p>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-full border-slate-200 bg-white px-5"
              onClick={() => {
                setIsSubmitted(false);
                setAttachments([]);
                setFormData({
                  name: session?.user?.name || "",
                  email: session?.user?.email || "",
                  category: "",
                  subject: "",
                  message: "",
                });
              }}
            >
              Send another
            </Button>
            <Button
              type="button"
              className="h-11 rounded-full bg-slate-950 px-5 text-white hover:bg-slate-800"
              onClick={() => router.push("/")}
            >
              Back to home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-28 lg:pt-6">
      <div className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_20px_60px_-36px_rgba(15,23,42,0.35)]">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          {/* Form pane */}
          <div className="border-b border-slate-100 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Support
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.15rem] sm:leading-tight">
              Contact support
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-slate-500">
              Bookings, media buys, billing, or account issues — send a clear
              note and we’ll get back to you.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-[13px] font-medium text-slate-600"
                  >
                    Full name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    disabled={isSubmitting}
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-[13px] font-medium text-slate-600"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    disabled={isSubmitting}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-[13px] font-medium text-slate-600"
                >
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="category" className={fieldClass}>
                    <SelectValue placeholder="What is this about?" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="subject"
                  className="text-[13px] font-medium text-slate-600"
                >
                  Subject
                </Label>
                <Input
                  id="subject"
                  placeholder="Short summary of the issue"
                  value={formData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  required
                  disabled={isSubmitting}
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label
                    htmlFor="message"
                    className="text-[13px] font-medium text-slate-600"
                  >
                    Message
                  </Label>
                  <span className="text-[11px] tabular-nums text-slate-400">
                    {formData.message.length < 20
                      ? `${20 - formData.message.length} more needed`
                      : "Looks good"}
                  </span>
                </div>
                <Textarea
                  id="message"
                  placeholder="What happened, what you expected, booking IDs, or error text…"
                  rows={6}
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  required
                  disabled={isSubmitting}
                  minLength={20}
                  className="min-h-[150px] resize-y rounded-2xl border-slate-200/90 bg-[#f7f8fc] px-4 py-3 text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:border-slate-300 focus-visible:bg-white focus-visible:ring-0"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-medium text-slate-600">
                  Attachments
                </Label>
                <div className="rounded-2xl border border-dashed border-slate-200 bg-[#f7f8fc] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                        <Upload className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          Screenshots or PDFs
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          Optional · JPG, PNG, PDF · up to 4 files · 8MB each
                        </p>
                      </div>
                    </div>
                    {attachments.length < 4 ? (
                      <UploadButton
                        endpoint="supportAttachment"
                        onClientUploadComplete={(res) => {
                          const next = normalizeUploadFiles(res);
                          if (!next.length) {
                            toast.error("Upload finished but no file URL returned");
                            return;
                          }
                          setAttachments((prev) =>
                            [...prev, ...next].slice(0, 4)
                          );
                          toast.success(
                            next.length > 1 ? "Files attached" : "File attached"
                          );
                        }}
                        onUploadError={(error) => {
                          toast.error(error.message || "Upload failed");
                        }}
                        appearance={{
                          button:
                            "ut-ready:bg-slate-950 ut-uploading:cursor-not-allowed h-9 rounded-full bg-slate-950 px-4 text-xs font-semibold text-white after:bg-slate-800",
                          allowedContent: "hidden",
                        }}
                      />
                    ) : null}
                  </div>

                  {attachments.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {attachments.map((file) => (
                        <li
                          key={`${file.url}-${file.name}`}
                          className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-700"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate hover:underline"
                            >
                              {file.name}
                            </a>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setAttachments((prev) =>
                                prev.filter((item) => item.url !== file.url)
                              )
                            }
                            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                            aria-label={`Remove ${file.name}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="text-sm font-medium text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Side pane */}
          <div className="flex flex-col justify-between bg-[#f7f8fc] p-6 sm:p-8 lg:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Other ways
              </p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
                Prefer email or a call?
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
                Use the form for tracked requests, or reach us directly for
                quick questions.
              </p>

              <div className="mt-8 space-y-5">
                <a
                  href="mailto:hey@payollar.com"
                  className="group flex items-start gap-3"
                >
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                    <Mail className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-950 group-hover:underline">
                      hey@payollar.com
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-500">
                      Best for detailed issues
                    </span>
                  </span>
                </a>

                <a
                  href="tel:+233558207902"
                  className="group flex items-start gap-3"
                >
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                    <Phone className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-950 group-hover:underline">
                      +233 (55) 820-7902
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-500">
                      Weekdays, business hours
                    </span>
                  </span>
                </a>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Typical reply
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Within 24 hours · urgent requests sooner
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-4 border-t border-slate-200/80 pt-6">
              <p className="text-sm leading-relaxed text-slate-500">
                Include booking IDs, listing names, or screenshots when you can
                — attachments help us resolve issues faster.
              </p>
              <Link
                href="/help"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950 hover:opacity-70"
              >
                <HelpCircle className="h-4 w-4" />
                Browse help center
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
