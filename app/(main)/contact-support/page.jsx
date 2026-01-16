"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { toast } from "sonner";
import {
  Mail,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  Loader2,
  Phone,
  Clock,
  Send,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

const supportCategories = [
  { value: "verification", label: "Account Verification" },
  { value: "technical", label: "Technical Support" },
  { value: "billing", label: "Billing & Payments" },
  { value: "profile", label: "Profile Issues" },
  { value: "booking", label: "Booking & Appointments" },
  { value: "general", label: "General Inquiry" },
  { value: "other", label: "Other" },
];

const priorityLevels = [
  { value: "low", label: "Low - General question" },
  { value: "medium", label: "Medium - Need assistance" },
  { value: "high", label: "High - Urgent issue" },
];

export default function ContactSupportPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    priority: "medium",
    subject: "",
    message: "",
  });

  // Pre-fill user data if available
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || prev.name,
        email: session.user.email || prev.email,
      }));
    }
  }, [session]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.category || !formData.subject || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.message.length < 20) {
      toast.error("Please provide more details in your message (at least 20 characters)");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit support request");
      }

      toast.success("Support request submitted successfully!");
      setIsSubmitted(true);
      
      // Reset form after a delay
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          category: "",
          priority: "medium",
          subject: "",
          message: "",
        });
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting support request:", error);
      toast.error("Failed to submit support request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-emerald-900/20">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="mx-auto p-4 bg-emerald-900/20 rounded-full mb-6 w-fit">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-white mb-4">
                  Thank You for Contacting Us!
                </CardTitle>
                <CardDescription className="text-lg mb-6">
                  We&apos;ve received your support request and will get back to you as soon as possible.
                </CardDescription>
                <div className="bg-emerald-900/10 border border-emerald-900/20 rounded-lg p-6 mb-6 text-left">
                  <h3 className="font-semibold text-white mb-3">What happens next?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>You&apos;ll receive a confirmation email at <strong>{formData.email}</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>Our support team will review your request within 24 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>We&apos;ll respond via email with a solution or follow-up questions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>For urgent issues, you may receive a response within a few hours</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        category: "",
                        priority: "medium",
                        subject: "",
                        message: "",
                      });
                    }}
                    variant="outline"
                    className="border-emerald-900/30"
                  >
                    Submit Another Request
                  </Button>
                  <Button
                    onClick={() => router.push("/")}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Return to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto p-4 bg-emerald-900/20 rounded-full mb-4 w-fit">
            <MessageSquare className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Contact Support</h1>
          <p className="text-muted-foreground text-lg">
            We&apos;re here to help! Fill out the form below and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information Cards */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-emerald-900/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-emerald-400" />
                  Email Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  For general inquiries and non-urgent matters
                </p>
                <a
                  href="mailto:hey@payollar.com"
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                >
                  hey@payollar.com
                </a>
              </CardContent>
            </Card>

            <Card className="border-emerald-900/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-400" />
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-white">High Priority:</span>
                    <span className="text-muted-foreground ml-2">Within 2-4 hours</span>
                  </div>
                  <div>
                    <span className="font-medium text-white">Medium Priority:</span>
                    <span className="text-muted-foreground ml-2">Within 24 hours</span>
                  </div>
                  <div>
                    <span className="font-medium text-white">Low Priority:</span>
                    <span className="text-muted-foreground ml-2">Within 48 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-900/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-emerald-400" />
                  Help Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => router.push("/help")}
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help Center
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => router.push("/creator/verification")}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Verification Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-emerald-900/20">
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Please provide as much detail as possible so we can assist you better
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Full Name <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email Address <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">
                        Category <span className="text-red-400">*</span>
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleChange("category", value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
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
                      <Label htmlFor="priority">Priority Level</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => handleChange("priority", value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      Subject <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={formData.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Message <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Please provide detailed information about your issue, question, or request..."
                      rows={8}
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      required
                      disabled={isSubmitting}
                      minLength={20}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.message.length} / 20 characters minimum
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                      className="border-emerald-900/30"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Request
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="border-emerald-900/20 mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Before You Submit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">•</span>
                    <span>
                      Check our <a href="/help" className="text-emerald-400 hover:text-emerald-300 underline">Help Center</a> for quick answers to common questions
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">•</span>
                    <span>
                      Include any relevant screenshots or error messages if you&apos;re reporting a technical issue
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">•</span>
                    <span>
                      For account verification issues, make sure you&apos;ve completed all required profile information
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">•</span>
                    <span>
                      We typically respond within 24 hours, but urgent issues may receive faster responses
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
