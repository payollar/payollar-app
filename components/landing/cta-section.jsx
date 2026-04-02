"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLandingSessionUser } from "@/hooks/use-landing-session";
import { SectionShell } from "@/components/landing/section-shell";
import { getDashboardNavForRole } from "@/lib/landing-nav";

export function CTASection() {
  const { user, isSignedIn } = useLandingSessionUser();
  const dashboardNav = user?.role ? getDashboardNavForRole(user.role) : null;

  return (
    <section className="relative w-full overflow-hidden border-t border-border/40 bg-background py-16 lg:py-24">
      <SectionShell className="max-w-[90rem]">
        <div className="relative mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-0 overflow-visible rounded-3xl"
          >
            <div
              className="absolute inset-0 -z-20"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
                `,
                backgroundSize: "48px 48px",
              }}
            />
            <div
              className="absolute inset-0 -z-10 bg-background"
              style={{
                maskImage: "radial-gradient(ellipse 70% 50% at 50% 50%, transparent 40%, white 70%)",
                WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 50%, transparent 40%, white 70%)",
              }}
            />
            <motion.div
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-1/2 top-1/2 z-0 h-3/4 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[6rem]"
            />
            <div className="relative z-40 flex flex-col items-center px-6 py-14 text-center lg:py-20">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 shadow-[0_0_30px_rgba(0,85,255,0.25)]">
                <Sparkles className="h-6 w-6 text-primary" aria-hidden />
              </div>
              <h2 className="mt-8 max-w-3xl text-3xl font-medium leading-[1.2] text-transparent bg-linear-to-r from-foreground to-foreground/70 bg-clip-text md:text-4xl lg:text-5xl">
                Ready to transform your
                <br />
                career?
              </h2>
              <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
                Join talents and media teams using Payollar to book, collaborate, and ship campaigns—your way.
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
                  <Button asChild size="lg" variant="marketingOutline" className="rounded-full px-8 py-6 text-lg">
                    <Link href={dashboardNav.href}>
                      <LayoutDashboard className="mr-2 h-5 w-5" />
                      {dashboardNav.label}
                    </Link>
                  </Button>
                ) : isSignedIn ? (
                  <Button asChild size="lg" variant="marketingOutline" className="rounded-full px-8 py-6 text-lg">
                    <Link href="/onboarding">
                      <LayoutDashboard className="mr-2 h-5 w-5" />
                      Complete profile
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg" variant="marketingOutline" className="rounded-full px-8 py-6 text-lg">
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
