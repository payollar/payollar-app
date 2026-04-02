"use client";

import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingMobileMenu({
  isOpen,
  setIsOpen,
  links,
  showMediaMenu,
  dashboardNav = null,
  isSignedIn = false,
}) {
  const linkStaggerBase =
    (dashboardNav ? 1 : 0) + (showMediaMenu ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
          className="flex flex-1 flex-col overflow-y-auto px-4 pb-6 lg:hidden"
        >
          <ul className="flex w-full flex-1 flex-col items-start space-y-1 py-4">
            {dashboardNav && (
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <Link
                  href={dashboardNav.href}
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-start text-base font-medium text-primary hover:bg-primary/10 active:scale-[0.99]"
                >
                  <LayoutDashboard className="size-5 shrink-0" />
                  {dashboardNav.label}
                </Link>
              </motion.li>
            )}
            {showMediaMenu && (
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <Link
                  href="/media"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center rounded-lg px-4 py-3 text-start text-base font-medium text-foreground/90 hover:bg-foreground/5 hover:text-primary active:scale-[0.99]"
                >
                  Media
                </Link>
              </motion.li>
            )}
            {links.map((item, index) => (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: (linkStaggerBase + index) * 0.06,
                  duration: 0.3,
                }}
                className="w-full"
              >
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center rounded-lg px-4 py-3 text-start text-base font-medium text-foreground/90 hover:bg-foreground/5 hover:text-primary active:scale-[0.99]"
                >
                  {item.label}
                </Link>
              </motion.li>
            ))}
          </ul>
          {!isSignedIn && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.25 }}
              className="flex flex-col gap-3 border-t border-border/50 pt-4"
            >
              <Link href="/onboarding" onClick={() => setIsOpen(false)}>
                <Button variant="marketing" size="lg" className="w-full rounded-full">
                  Get started
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
