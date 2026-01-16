"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Users,
  Calendar,
  ShoppingBag,
  MessageSquare,
  Video,
  CreditCard,
  Settings,
  FileText,
  Mail,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const faqCategories = {
  general: [
    {
      question: "What is Payollar?",
      answer: "Payollar is a platform that connects clients with talented creators. Clients can book appointments, purchase digital products, apply creators to campaigns, and access various media services. Creators can offer their services, sell digital products, and apply to campaigns."
    },
    {
      question: "How do I get started?",
      answer: "After signing up, you'll be guided through an onboarding process where you'll choose your role (Client or Creator). Complete your profile setup and you're ready to start using the platform!"
    },
    {
      question: "Is there a mobile app?",
      answer: "Currently, Payollar is available as a web application. You can access it from any device with a modern web browser. A mobile app may be available in the future."
    },
    {
      question: "How do I contact support?",
      answer: "You can reach our support team at hey@payollar.com. We typically respond within 24-48 hours. For urgent matters, please include 'URGENT' in your subject line."
    }
  ],
  client: [
    {
      question: "How do I book an appointment with a creator?",
      answer: "Navigate to the 'Browse Talents' section, find a creator you're interested in, view their profile and availability, then click 'Book Appointment' to schedule a session. You'll need sufficient credits to complete the booking."
    },
    {
      question: "What are credits and how do I get them?",
      answer: "Credits are the currency used on Payollar to book appointments and purchase services. New users receive 2 free credits upon signup. You can purchase additional credits through your dashboard or when booking appointments."
    },
    {
      question: "How do I create a campaign?",
      answer: "Go to the 'Campaigns' section in your dashboard and click 'Create Campaign'. Fill in the details including campaign type, requirements, budget, and timeline. Once published, creators can apply to your campaign."
    },
    {
      question: "Can I cancel an appointment?",
      answer: "Yes, you can cancel appointments through your 'Bookings' section. Please note that cancellation policies may vary depending on the creator and timing of the cancellation. Check the specific booking details for more information."
    },
    {
      question: "How do video calls work?",
      answer: "When you book an appointment, a video call link is automatically generated. At the scheduled time, go to your 'Bookings' section and click 'Join Call' to start the video session with your creator."
    },
    {
      question: "What is the Media Library?",
      answer: "The Media Library stores all your purchased digital products and campaign deliverables. You can access and download your media files anytime from this section."
    }
  ],
  creator: [
    {
      question: "How do I get verified as a creator?",
      answer: "Complete your profile with all required information including your specialty, portfolio links, experience, and upload verification documents. Our team will review your application and verify your account. This process typically takes 2-5 business days."
    },
    {
      question: "How do I set my availability?",
      answer: "Go to your dashboard and navigate to the availability settings. You can set your available days and times. Make sure to keep this updated so clients can book appointments with you."
    },
    {
      question: "How do I create and sell digital products?",
      answer: "Navigate to the 'Products' section in your creator dashboard and click 'Create Product'. Upload your digital file, set a price, add a description and cover image. Once published, clients can purchase your products."
    },
    {
      question: "How do I get paid?",
      answer: "You'll receive payouts for product sales and completed services. Make sure to add your bank account information in your settings. Payouts are processed according to our payment schedule, typically within 7-14 business days."
    },
    {
      question: "How do I apply to campaigns?",
      answer: "Browse available campaigns in the 'Campaigns' section, review the requirements and budget, then click 'Apply' to submit your application. Include your portfolio, experience, and rate information."
    },
    {
      question: "Can I offer custom services?",
      answer: "Yes! Go to the 'Services' section in your dashboard to create custom service offerings. You can set rates per hour, per session, or fixed prices. Clients can then book these services directly."
    }
  ],
  technical: [
    {
      question: "I'm having trouble logging in. What should I do?",
      answer: "Try resetting your password using the 'Forgot Password' link on the sign-in page. If you continue to have issues, clear your browser cache and cookies, or try using a different browser. Contact support if problems persist."
    },
    {
      question: "The video call isn't working. How do I fix it?",
      answer: "Ensure your browser has permission to access your camera and microphone. Try refreshing the page or using a different browser. Check your internet connection. If issues persist, contact support with details about the error."
    },
    {
      question: "I can't upload files. What's wrong?",
      answer: "Check that your file size is within the allowed limits (typically 50MB for most files). Ensure you're using a supported file format. Try using a different browser or clearing your cache. If problems continue, contact support."
    },
    {
      question: "My page is loading slowly. What can I do?",
      answer: "Slow loading can be due to internet connection or browser issues. Try refreshing the page, clearing your browser cache, or using a different browser. Check your internet connection speed. If the issue persists, contact support."
    }
  ]
};

const quickLinks = [
  {
    title: "Getting Started Guide",
    description: "Learn the basics of using Payollar",
    icon: BookOpen,
    href: "#getting-started"
  },
  {
    title: "Client Resources",
    description: "Everything you need to know as a client",
    icon: Users,
    href: "#client-help"
  },
  {
    title: "Creator Resources",
    description: "Resources for creators and talents",
    icon: ShoppingBag,
    href: "#creator-help"
  },
  {
    title: "Contact Support",
    description: "Get help from our support team",
    icon: Mail,
    href: "#contact"
  }
];

function FAQSection({ category, title, icon: Icon }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="space-y-3">
        {faqCategories[category].map((faq, index) => (
          <Card key={index} className="border-border">
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">{faq.question}</CardTitle>
                {openIndex === index ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            {openIndex === index && (
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <HelpCircle className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold">Help Center</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions and learn how to make the most of Payollar
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {quickLinks.map((link) => (
          <Card key={link.href} className="hover:border-primary transition-colors cursor-pointer">
            <Link href={link.href}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <link.icon className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>

      {/* Getting Started */}
      <section id="getting-started" className="mb-16 scroll-mt-8">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Getting Started
            </CardTitle>
            <CardDescription>
              New to Payollar? Start here to learn the basics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  For Clients
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Complete your profile setup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Browse available creators and talents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Book appointments or purchase digital products</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Create campaigns to find the perfect talent</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  For Creators
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Complete your creator profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Get verified by submitting credentials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Set your availability and services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Start offering services and digital products</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Client Help Section */}
      <section id="client-help" className="mb-16 scroll-mt-8">
        <FAQSection 
          category="client" 
          title="Client Help" 
          icon={Users}
        />
      </section>

      {/* Creator Help Section */}
      <section id="creator-help" className="mb-16 scroll-mt-8">
        <FAQSection 
          category="creator" 
          title="Creator Help" 
          icon={ShoppingBag}
        />
      </section>

      {/* General FAQs */}
      <section className="mb-16 scroll-mt-8">
        <FAQSection 
          category="general" 
          title="General Questions" 
          icon={HelpCircle}
        />
      </section>

      {/* Technical Support */}
      <section className="mb-16 scroll-mt-8">
        <FAQSection 
          category="technical" 
          title="Technical Support" 
          icon={Settings}
        />
      </section>

      {/* Contact Section */}
      <section id="contact" className="mb-8 scroll-mt-8">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Still Need Help?
            </CardTitle>
            <CardDescription>
              Our support team is here to assist you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                If you couldn't find the answer you're looking for, please reach out to our support team:
              </p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a 
                  href="mailto:hey@payollar.com" 
                  className="text-primary hover:underline font-medium"
                >
                  hey@payollar.com
                </a>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Response Time:</strong> We typically respond within 24-48 hours during business days.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>For Urgent Matters:</strong> Please include "URGENT" in your email subject line.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Additional Resources */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Additional Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/terms" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <FileText className="h-4 w-4" />
                <span>Terms of Service</span>
              </Link>
              <Link href="/privacy" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <FileText className="h-4 w-4" />
                <span>Privacy Policy</span>
              </Link>
              <Link href="/pricing" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <CreditCard className="h-4 w-4" />
                <span>Pricing Information</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
