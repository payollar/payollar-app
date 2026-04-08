"use client";

import Link from "next/link";
import Image from "next/image";
import { Twitter, Instagram, Facebook, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionParticles } from "@/components/landing/section-particles";

const quickLinks = [
  ["/#how-it-works", "How it works"],
  ["/#features", "Features"],
  ["/pricing", "Pricing"],
  ["/talents", "Find talents"],
  ["/campaigns", "Campaigns"],
  ["/products", "Products"],
];

const forUsers = [
  // ["/onboarding", "Join as talent"],
  ["/products", "Services"],
  ["/help", "Help center"],
  ["/contact-support", "Contact support"],
];

function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className="text-muted-foreground transition-colors duration-200 hover:text-primary"
    >
      {children}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-border/50 bg-muted/25 text-foreground lg:mt-24">
      {/* Background: particles + soft light */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-muted/40" />
        <SectionParticles className="inset-0" opacityClass="opacity-[0.14]" quantity={36} />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-[4rem]" />
        <div className="absolute -right-16 top-0 h-64 w-64 rounded-full bg-primary/8 blur-[3.5rem]" />
      </div>

      <div className="absolute inset-x-0 top-0 z-[1] h-px bg-linear-to-r from-transparent via-primary/35 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          {/* Brand */}
          <div className="space-y-5 lg:col-span-5">
            <Link href="/" className="inline-block transition-opacity hover:opacity-90">
              <Image
                src="/logo-single.png"
                alt="Payollar"
                width={180}
                height={48}
                className="h-11 w-auto object-contain opacity-95"
              />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Connecting talented creators with media opportunities. Build your career, grow your network, and get paid
              for your passion.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { Icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                { Icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                { Icon: Facebook, href: "https://facebook.com", label: "Facebook" },
                { Icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={cn(
                    "rounded-xl border border-border/60 bg-card/50 p-2.5 text-foreground/80 backdrop-blur-sm",
                    "transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Quick links
            </h3>
            <ul className="space-y-3 text-sm">
              {quickLinks.map(([href, label]) => (
                <li key={href}>
                  <FooterLink href={href}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              For users
            </h3>
            <ul className="space-y-3 text-sm">
              {forUsers.map(([href, label]) => (
                <li key={href}>
                  <FooterLink href={href}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Contact
            </h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <a href="mailto:hey@payollar.com" className="transition-colors hover:text-primary">
                  hey@payollar.com
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <a href="tel:+233558207902" className="transition-colors hover:text-primary">
                  +233 (55) 820-7902
                </a>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <span className="leading-relaxed">
                  Osabu link
                  <br />
                  Accra Ghana, Adenta
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 text-sm text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} Payollar. All rights reserved.</span>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-primary">
              Privacy policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-primary">
              Terms of service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
