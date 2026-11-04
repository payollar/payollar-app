"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Users,
  ShoppingBag,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Settings,
  FileText,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const faqCategories = {
  general: [
    {
      question: "What is Payollar?",
      answer:
        "Payollar is a platform that connects clients with talented creators. Clients can book appointments, purchase digital products, apply creators to campaigns, and access various media services. Creators can offer their services, sell digital products, and apply to campaigns.",
    },
    {
      question: "How do I get started?",
      answer:
        "After signing up, you'll be guided through an onboarding process where you'll choose your role (Client or Creator). Complete your profile setup and you're ready to start using the platform!",
    },
    {
      question: "Is there a mobile app?",
      answer:
        "Currently, Payollar is available as a web application. You can access it from any device with a modern web browser. A mobile app may be available in the future.",
    },
    {
      question: "How do I contact support?",
      answer:
        "You can reach our support team at hey@payollar.com. We typically respond within 24-48 hours. For urgent matters, please include 'URGENT' in your subject line.",
    },
  ],
  client: [
    {
      question: "How do I book an appointment with a creator?",
      answer:
        "Navigate to the 'Browse Talents' section, find a creator you're interested in, view their profile and availability, then click 'Book Appointment' to schedule a session. You'll need sufficient credits to complete the booking.",
    },
    {
      question: "What are credits and how do I get them?",
      answer:
        "Credits are the currency used on Payollar to book appointments and purchase services. New users receive 2 free credits upon signup. You can purchase additional credits through your dashboard or when booking appointments.",
    },
    {
      question: "How do I create a campaign?",
      answer:
        "Go to the 'Campaigns' section in your dashboard and click 'Create Campaign'. Fill in the details including campaign type, requirements, budget, and timeline. Once published, creators can apply to your campaign.",
    },
    {
      question: "Can I cancel an appointment?",
      answer:
        "Yes, you can cancel appointments through your 'Bookings' section. Please note that cancellation policies may vary depending on the creator and timing of the cancellation. Check the specific booking details for more information.",
    },
    {
      question: "How do video calls work?",
      answer:
        "When you book an appointment, a video call link is automatically generated. At the scheduled time, go to your 'Bookings' section and click 'Join Call' to start the video session with your creator.",
    },
    {
      question: "What is the Media Library?",
      answer:
        "The Media Library stores all your purchased digital products and campaign deliverables. You can access and download your media files anytime from this section.",
    },
  ],
  creator: [
    {
      question: "How do I get verified as a creator?",
      answer:
        "Complete your profile with all required information including your specialty, portfolio links, experience, and upload verification documents. Our team will review your application and verify your account. This process typically takes 2-5 business days.",
    },
    {
      question: "How do I set my availability?",
      answer:
        "Go to your dashboard and navigate to the availability settings. You can set your available days and times. Make sure to keep this updated so clients can book appointments with you.",
    },
    {
      question: "How do I create and sell digital products?",
      answer:
        "Navigate to the 'Products' section in your creator dashboard and click 'Create Product'. Upload your digital file, set a price, add a description and cover image. Once published, clients can purchase your products.",
    },
    {
      question: "How do I get paid?",
      answer:
        "You'll receive payouts for product sales and completed services. Make sure to add your bank account information in your settings. Payouts are processed according to our payment schedule, typically within 7-14 business days.",
    },
    {
      question: "How do I apply to campaigns?",
      answer:
        "Browse available campaigns in the 'Campaigns' section, review the requirements and budget, then click 'Apply' to submit your application. Include your portfolio, experience, and rate information.",
    },
    {
      question: "Can I offer custom services?",
      answer:
        "Yes! Go to the 'Services' section in your dashboard to create custom service offerings. You can set rates per hour, per session, or fixed prices. Clients can then book these services directly.",
    },
  ],
  technical: [
    {
      question: "I'm having trouble logging in. What should I do?",
      answer:
        "Try resetting your password using the 'Forgot Password' link on the sign-in page. If you continue to have issues, clear your browser cache and cookies, or try using a different browser. Contact support if problems persist.",
    },
    {
      question: "The video call isn't working. How do I fix it?",
      answer:
        "Ensure your browser has permission to access your camera and microphone. Try refreshing the page or using a different browser. Check your internet connection. If issues persist, contact support with details about the error.",
    },
    {
      question: "I can't upload files. What's wrong?",
      answer:
        "Check that your file size is within the allowed limits (typically 50MB for most files). Ensure you're using a supported file format. Try using a different browser or clearing your cache. If problems continue, contact support.",
    },
    {
      question: "My page is loading slowly. What can I do?",
      answer:
        "Slow loading can be due to internet connection or browser issues. Try refreshing the page, clearing your browser cache, or using a different browser. Check your internet connection speed. If the issue persists, contact support.",
    },
  ],
};

const quickLinks = [
  {
    title: "Getting Started Guide",
    description: "Learn the basics of using Payollar",
    icon: BookOpen,
    href: "#getting-started",
  },
  {
    title: "Client Resources",
    description: "Everything you need to know as a client",
    icon: Users,
    href: "#client-help",
  },
  {
    title: "Creator Resources",
    description: "Resources for creators and talents",
    icon: ShoppingBag,
    href: "#creator-help",
  },
  {
    title: "Contact Support",
    description: "Get help from our support team",
    icon: Mail,
    href: "#contact",
  },
];

const cardClass =
  "rounded-2xl border border-slate-200/80 bg-white text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.04)]";

function FAQSection({ category, title, icon: Icon }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="space-y-4">
      <div className="mb-2 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#0055ff]">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
      </div>
      <div className="space-y-3">
        {faqCategories[category].map((faq, index) => {
          const open = openIndex === index;
          return (
            <Card key={index} className={cn(cardClass, "overflow-hidden")}>
              <CardHeader
                className={cn(
                  "cursor-pointer transition-colors",
                  open ? "bg-slate-50/80" : "hover:bg-slate-50/70"
                )}
                onClick={() => setOpenIndex(open ? null : index)}
              >
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    {faq.question}
                  </CardTitle>
                  {open ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                  )}
                </div>
              </CardHeader>
              {open ? (
                <CardContent className="border-t border-slate-100 pt-4">
                  <p className="text-sm leading-relaxed text-slate-600">
                    {faq.answer}
                  </p>
                </CardContent>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-[#0055ff]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </div>

      <div className="mb-10 text-center sm:mb-12">
        <div className="mb-4 inline-flex items-center justify-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#0055ff]">
            <HelpCircle className="h-6 w-6" />
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Help Center
          </h1>
        </div>
        <p className="mx-auto max-w-2xl text-base text-slate-500 sm:text-lg">
          Find answers to common questions and learn how to make the most of
          Payollar.
        </p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-3 md:grid-cols-2">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card
              className={cn(
                cardClass,
                "h-full transition-all hover:border-[#0055ff]/30 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
              )}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#0055ff]">
                    <link.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle className="text-lg text-slate-950">
                      {link.title}
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      {link.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <section id="getting-started" className="mb-14 scroll-mt-28">
        <Card className={cn(cardClass, "border-[#0055ff]/15")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5 text-2xl text-slate-950">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#0055ff]">
                <BookOpen className="h-5 w-5" />
              </span>
              Getting Started
            </CardTitle>
            <CardDescription className="text-slate-500">
              New to Payollar? Start here to learn the basics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Users className="h-5 w-5 text-[#0055ff]" />
                  For Clients
                </h3>
                <ul className="space-y-2.5 text-slate-600">
                  {[
                    "Complete your profile setup",
                    "Browse available creators and talents",
                    "Book appointments or purchase digital products",
                    "Create campaigns to find the perfect talent",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0055ff]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <ShoppingBag className="h-5 w-5 text-[#0055ff]" />
                  For Creators
                </h3>
                <ul className="space-y-2.5 text-slate-600">
                  {[
                    "Complete your creator profile",
                    "Get verified by submitting credentials",
                    "Set your availability and services",
                    "Start offering services and digital products",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0055ff]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="client-help" className="mb-14 scroll-mt-28">
        <FAQSection category="client" title="Client Help" icon={Users} />
      </section>

      <section id="creator-help" className="mb-14 scroll-mt-28">
        <FAQSection category="creator" title="Creator Help" icon={ShoppingBag} />
      </section>

      <section className="mb-14 scroll-mt-28">
        <FAQSection category="general" title="General Questions" icon={HelpCircle} />
      </section>

      <section className="mb-14 scroll-mt-28">
        <FAQSection category="technical" title="Technical Support" icon={Settings} />
      </section>

      <section id="contact" className="mb-8 scroll-mt-28">
        <Card className={cn(cardClass, "overflow-hidden")}>
          <div className="border-b border-[#0055ff]/10 bg-gradient-to-br from-[#eef4ff] to-white px-6 py-5">
            <CardTitle className="flex items-center gap-2.5 text-2xl text-slate-950">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#0055ff] shadow-sm">
                <Mail className="h-5 w-5" />
              </span>
              Still Need Help?
            </CardTitle>
            <CardDescription className="mt-1 text-slate-500">
              Our support team is here to assist you
            </CardDescription>
          </div>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                If you couldn&apos;t find the answer you&apos;re looking for,
                please reach out to our support team:
              </p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#0055ff]" />
                <a
                  href="mailto:hey@payollar.com"
                  className="font-medium text-[#0055ff] hover:underline"
                >
                  hey@payollar.com
                </a>
              </div>
            </div>
            <Separator className="bg-slate-200" />
            <div className="space-y-2 text-sm text-slate-500">
              <p>
                <strong className="text-slate-700">Response Time:</strong> We
                typically respond within 24-48 hours during business days.
              </p>
              <p>
                <strong className="text-slate-700">For Urgent Matters:</strong>{" "}
                Please include &quot;URGENT&quot; in your email subject line.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8">
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-xl text-slate-950">
              Additional Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Link
                href="/terms"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <FileText className="h-4 w-4 text-[#0055ff]" />
                <span>Terms of Service</span>
              </Link>
              <Link
                href="/privacy"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <FileText className="h-4 w-4 text-[#0055ff]" />
                <span>Privacy Policy</span>
              </Link>
              <Link
                href="/pricing"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <CreditCard className="h-4 w-4 text-[#0055ff]" />
                <span>Pricing Information</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
