"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLandingSessionUser } from "@/hooks/use-landing-session";
import { SectionShell } from "@/components/landing/section-shell";
import { useLandingTheme } from "@/components/landing/landing-theme";
import { getDashboardNavForRole } from "@/lib/landing-nav";
import { cn } from "@/lib/utils";

export function CTASection() {
  const { user, isSignedIn } = useLandingSessionUser();
  const { theme } = useLandingTheme();
  const isLight = theme === "light";
  const dashboardNav = user?.role ? getDashboardNavForRole(user.role) : null;

  const outlineClass = cn(
    "rounded-full px-8 py-6 text-lg",
    isLight &&
      "border-slate-300 bg-white text-slate-900 shadow-sm hover:border-[#0055ff]/40 hover:bg-white hover:text-[#0b3db8]"
  );

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden border-t py-16 lg:py-24",
        isLight ? "border-slate-200/80 bg-[#f4f6fb]" : "border-border/40 bg-background"
      )}
    >
      <SectionShell className="max-w-[90rem]">
        <div className="relative mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={cn(
              "relative z-0 overflow-hidden rounded-3xl",
              isLight &&
                "border border-slate-200/90 bg-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.28)]"
            )}
          >
            <div
              className="absolute inset-0 -z-20"
              style={{
                backgroundImage: isLight
                  ? `
                  linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px)
                `
                  : `
                  linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
                `,
                backgroundSize: "48px 48px",
              }}
            />
            <div
              className={cn(
                "absolute inset-0 -z-10",
                isLight ? "bg-white" : "bg-background"
              )}
              style={{
                maskImage:
                  "radial-gradient(ellipse 70% 50% at 50% 50%, transparent 40%, white 70%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 70% 50% at 50% 50%, transparent 40%, white 70%)",
              }}
            />
            <motion.div
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "absolute left-1/2 top-1/2 z-0 h-3/4 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[6rem]",
                isLight ? "bg-primary/12" : "bg-primary/20"
              )}
            />
            <div className="relative z-40 flex flex-col items-center px-6 py-14 text-center lg:py-20">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10",
                  isLight
                    ? "shadow-[0_8px_28px_rgba(0,85,255,0.16)]"
                    : "shadow-[0_0_30px_rgba(0,85,255,0.25)]"
                )}
              >
                <Sparkles className="h-6 w-6 text-primary" aria-hidden />
              </div>
              <h2
                className={cn(
                  "mt-8 max-w-3xl bg-linear-to-r bg-clip-text text-3xl font-medium leading-[1.2] text-transparent md:text-4xl lg:text-5xl",
                  isLight
                    ? "from-slate-900 to-slate-600"
                    : "from-foreground to-foreground/70"
                )}
              >
                Ready to transform your
                <br />
                career?
              </h2>
              <p
                className={cn(
                  "mt-6 max-w-2xl text-base md:text-lg",
                  isLight ? "text-slate-600" : "text-muted-foreground"
                )}
              >
                Join talents and media teams using Payollar to book, collaborate,
                and ship campaigns—your way.
              </p>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                {!isSignedIn && (
                  <Button asChild size="lg" variant="marketing" className="rounded-full px-8 py-6 text-lg">
                    <Link href="/onboarding">
                      Start your journey
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                )}
                {isSignedIn && dashboardNav ? (
                  <Button asChild size="lg" variant="marketingOutline" className={outlineClass}>
                    <Link href={dashboardNav.href}>
                      <LayoutDashboard className="mr-2 h-5 w-5" />
                      {dashboardNav.label}
                    </Link>
                  </Button>
                ) : isSignedIn ? (
                  <Button asChild size="lg" variant="marketingOutline" className={outlineClass}>
                    <Link href="/onboarding">
                      <LayoutDashboard className="mr-2 h-5 w-5" />
                      Complete profile
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg" variant="marketingOutline" className={outlineClass}>
                    <Link href="/products">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Browse services
                    </Link>
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </SectionShell>
    </section>
  );
}
