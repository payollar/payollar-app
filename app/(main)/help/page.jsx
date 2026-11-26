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
  Building2,
  Megaphone,
  MessageSquare,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const faqCategories = {
  general: [
    {
      question: "What is Payollar?",
      answer:
        "Payollar connects brands and clients with creators, and also helps you buy media — TV, radio, digital, and billboard inventory — from media agencies on the platform. Clients book talent, run campaigns, and plan media buys. Creators offer services and products. Media agencies publish listings, packages, and rate cards.",
    },
    {
      question: "How do I get started?",
      answer:
        "Sign up and complete onboarding to choose your role: Client, Creator, or Media Agency. Finish your profile, then use your dashboard. Clients can browse talents and Media Buying. Creators set availability and services. Media agencies start from Custom packages or the Get started guide in their dashboard.",
    },
    {
      question: "What roles can I use on Payollar?",
      answer:
        "Client — book creators, run campaigns, and buy media. Creator — offer services, sell products, and apply to campaigns. Media Agency — list stations/sites, publish packages and rate cards, and manage booking requests and negotiations.",
    },
    {
      question: "Is there a mobile app?",
      answer:
        "Payollar is a web app. You can use it in a modern browser on phone, tablet, or desktop. A native mobile app may come later.",
    },
    {
      question: "How do I contact support?",
      answer:
        "Use Contact Support (/contact-support) to send a message and optionally attach screenshots or PDFs. You can also email hey@payollar.com or call +233 (55) 820-7902. We usually reply within 24 hours.",
    },
  ],
  client: [
    {
      question: "How do I book a creator?",
      answer:
        "Open Find Talents, choose a creator, check availability, then book. You’ll need enough credits for the session. After booking, join the call from your Bookings when it’s time.",
    },
    {
      question: "What are credits and how do I get them?",
      answer:
        "Credits are used for creator appointments and some services. New users typically receive starter credits. You can buy more from your client dashboard when booking or from billing settings.",
    },
    {
      question: "How do I buy media (TV, radio, digital, billboard)?",
      answer:
        "Go to Media or Products and pick a channel. Digital listings show packages you can Get Quote on — that opens a Messages negotiation with the agency. Billboard sites use Book to view rates and request a quote. TV and radio use marketplace listings and rate cards where available.",
    },
    {
      question: "What’s the difference between Digital Get Quote and Billboard Book?",
      answer:
        "Digital Get Quote starts a live conversation in Messages for package rates. Billboard Book opens the site page so you can review rates, availability, and continue to quote or negotiate. Both can lead to a booking request the agency reviews.",
    },
    {
      question: "How do I create a campaign?",
      answer:
        "From your client dashboard, open Campaigns and create a campaign with brief, budget, timeline, and requirements. Publish it so creators can apply. You review applications and hire from there.",
    },
    {
      question: "Where do negotiations and media chats live?",
      answer:
        "Open Messages for media quote threads and ongoing chats. Structured offer / counter-offer flows also appear under Negotiations when a booking is being priced. Keep an eye on both when a media buy is in progress.",
    },
    {
      question: "Can I cancel an appointment?",
      answer:
        "Yes — from Bookings. Policies depend on the creator and how close you are to the start time. Check the booking details for that session’s rules.",
    },
    {
      question: "What is the Media Library?",
      answer:
        "Your Media Library holds purchased digital products and campaign deliverables so you can download them anytime from your client dashboard.",
    },
  ],
  media: [
    {
      question: "How do media agencies get set up?",
      answer:
        "Register as a Media Agency, complete Settings (company name, contact, location), then add listings under Custom packages. Set listings to Active so they appear on the marketplace. Use Get started in the agency dashboard for a full tour.",
    },
    {
      question: "What are Custom packages vs Smart rate cards?",
      answer:
        "Custom packages are fixed offers (name, price, duration, reach) attached to a listing — these power Digital marketplace Get Quote. Smart rate cards are detailed pricing tables (sections, rows, dayparts) you publish for buyers who need a full rate sheet. Many agencies use both.",
    },
    {
      question: "How do I make a digital listing show on the marketplace?",
      answer:
        "Create a Digital listing, set status to Active, add at least one package, and ideally a cover image. Packages are what buyers select when they click Get Quote.",
    },
    {
      question: "Can billboard listings use a map pin?",
      answer:
        "Yes. When media type is Billboard, open Use map on the listing form to search a place in Ghana, use your location, or click the map to drop a pin. Coordinates are saved with the listing; location text still works as usual.",
    },
    {
      question: "Where do booking requests and negotiations appear?",
      answer:
        "Incoming interest shows in Requests. Use Negotiations for price discussions linked to a booking. Messages holds live chat from marketplace quotes. After delivery, upload Transmission certificates and Reporting as needed.",
    },
    {
      question: "How do I edit or delete a listing?",
      answer:
        "In Custom packages, use Edit on a listing card to update details, status, placements, demographics, and map pin (for billboards). Delete removes the listing and its packages after confirmation.",
    },
  ],
  creator: [
    {
      question: "How do I get verified as a creator?",
      answer:
        "Complete your profile (specialty, portfolio, experience) and submit verification documents. Reviews usually take a few business days. You can check status under creator verification.",
    },
    {
      question: "How do I set availability and services?",
      answer:
        "In your creator dashboard, set available days and times, then add services with rates (hourly, per session, or fixed). Keep availability current so clients can book you.",
    },
    {
      question: "How do I sell digital products?",
      answer:
        "Open Products in your creator dashboard, create a product, upload the file, set price and cover, then publish. Sales appear in your earnings flow.",
    },
    {
      question: "How do I get paid?",
      answer:
        "Add payout details in Settings. Earnings from completed services and product sales are paid out on the platform schedule — typically within 7–14 business days after processing.",
    },
    {
      question: "How do I apply to campaigns?",
      answer:
        "Browse Campaigns, open a brief that fits, and apply with portfolio, experience, and rate. Clients review applications and shortlist talent.",
    },
  ],
  technical: [
    {
      question: "I’m having trouble signing in. What should I do?",
      answer:
        "Use Forgot Password on the sign-in page. Clear cache or try another browser if needed. Media agencies should use the media agency sign-in route. Contact support if it still fails — attach a screenshot if you can.",
    },
    {
      question: "The video call isn’t working. How do I fix it?",
      answer:
        "Allow camera and microphone in the browser, refresh, and check your connection. Try another browser. If it persists, contact support with the booking ID and any error text.",
    },
    {
      question: "I can’t upload files. What’s wrong?",
      answer:
        "Check size and format limits (for example support attachments allow images/PDFs up to 8MB; cover images and certificates have their own limits). Use a stable connection and a modern browser. If upload finishes but nothing appears, try again or contact support.",
    },
    {
      question: "Why don’t I see my listing on the marketplace?",
      answer:
        "Confirm the listing status is Active, you’ve added packages where required (especially Digital), and you’re looking at the correct channel filter (TV, Radio, Digital, Billboard). Draft or Inactive listings stay hidden from buyers.",
    },
  ],
};

const quickLinks = [
  {
    title: "Getting started",
    description: "Basics for every role on Payollar",
    icon: BookOpen,
    href: "#getting-started",
  },
  {
    title: "Buy media",
    description: "TV, radio, digital & billboard",
    icon: Megaphone,
    href: "/media",
  },
  {
    title: "Media agencies",
    description: "Listings, packages & requests",
    icon: Building2,
    href: "#media-help",
  },
  {
    title: "Contact support",
    description: "Message us with optional files",
    icon: MessageSquare,
    href: "/contact-support",
  },
];

const cardClass =
  "rounded-2xl border border-slate-200/80 bg-white text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.04)]";

function FAQSection({ category, title, icon: Icon }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="space-y-4">
      <div className="mb-2 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
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
            <Card key={faq.question} className={cn(cardClass, "overflow-hidden")}>
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
          className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </div>

      <div className="mb-10 text-center sm:mb-12">
        <div className="mb-4 inline-flex items-center justify-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
            <HelpCircle className="h-6 w-6" />
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Help Center
          </h1>
        </div>
        <p className="mx-auto max-w-2xl text-base text-slate-500 sm:text-lg">
          Answers for clients, creators, and media agencies — talent bookings,
          campaigns, and media buying.
        </p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-3 md:grid-cols-2">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card
              className={cn(
                cardClass,
                "h-full transition-all hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
              )}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
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
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5 text-2xl text-slate-950">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
                <BookOpen className="h-5 w-5" />
              </span>
              Getting started
            </CardTitle>
            <CardDescription className="text-slate-500">
              Pick your path — client, creator, or media agency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-3 rounded-2xl bg-[#f7f8fc] p-4">
                <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Users className="h-4 w-4 text-slate-500" />
                  Clients
                </h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  {[
                    "Finish profile setup",
                    "Browse talents or open Media",
                    "Book creators or request media quotes",
                    "Run campaigns when you need talent",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3 rounded-2xl bg-[#f7f8fc] p-4">
                <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <ShoppingBag className="h-4 w-4 text-slate-500" />
                  Creators
                </h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  {[
                    "Complete and verify your profile",
                    "Set availability and services",
                    "Publish digital products",
                    "Apply to client campaigns",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3 rounded-2xl bg-[#f7f8fc] p-4">
                <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  Media agencies
                </h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  {[
                    "Complete agency Settings",
                    "Add Active listings + packages",
                    "Publish smart rate cards if needed",
                    "Respond in Requests & Messages",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/media-agency/get-started"
                  className="inline-flex text-sm font-semibold text-slate-950 hover:opacity-70"
                >
                  Open agency guide →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="client-help" className="mb-14 scroll-mt-28">
        <FAQSection category="client" title="Client help" icon={Users} />
      </section>

      <section id="media-help" className="mb-14 scroll-mt-28">
        <FAQSection
          category="media"
          title="Media agency help"
          icon={Building2}
        />
      </section>

      <section id="creator-help" className="mb-14 scroll-mt-28">
        <FAQSection category="creator" title="Creator help" icon={ShoppingBag} />
      </section>

      <section className="mb-14 scroll-mt-28">
        <FAQSection
          category="general"
          title="General questions"
          icon={HelpCircle}
        />
      </section>

      <section className="mb-14 scroll-mt-28">
        <FAQSection
          category="technical"
          title="Technical support"
          icon={Settings}
        />
      </section>

      <section id="contact" className="mb-8 scroll-mt-28">
        <Card className={cn(cardClass, "overflow-hidden")}>
          <div className="border-b border-slate-100 bg-[#f7f8fc] px-6 py-5">
            <CardTitle className="flex items-center gap-2.5 text-2xl text-slate-950">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-800 shadow-sm">
                <Mail className="h-5 w-5" />
              </span>
              Still need help?
            </CardTitle>
            <CardDescription className="mt-1 text-slate-500">
              Send a request with optional screenshots or PDFs
            </CardDescription>
          </div>
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm text-slate-600">
              If you couldn&apos;t find an answer here, contact support and
              include booking IDs, listing names, or attachments when you can.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact-support"
                className="inline-flex h-10 items-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Contact support
              </Link>
              <a
                href="mailto:hey@payollar.com"
                className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                hey@payollar.com
              </a>
            </div>
            <Separator className="bg-slate-200" />
            <p className="text-sm text-slate-500">
              Typical reply within 24 hours. Phone:{" "}
              <a
                href="tel:+233558207902"
                className="font-medium text-slate-700 hover:underline"
              >
                +233 (55) 820-7902
              </a>
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8">
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-xl text-slate-950">
              Additional resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Link
                href="/terms"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <FileText className="h-4 w-4 text-slate-500" />
                <span>Terms of Service</span>
              </Link>
              <Link
                href="/privacy"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <FileText className="h-4 w-4 text-slate-500" />
                <span>Privacy Policy</span>
              </Link>
              <Link
                href="/pricing"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <CreditCard className="h-4 w-4 text-slate-500" />
                <span>Pricing</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
