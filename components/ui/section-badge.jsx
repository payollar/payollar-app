"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function SectionBadge({ title, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative z-0 inline-block select-none"
    >
      <motion.div
        className={cn(
          "relative z-0 overflow-hidden rounded-full border-b border-foreground/10 bg-background/5 px-4 pb-1.5 pt-2 text-xs font-medium uppercase text-transparent shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1)] backdrop-blur-sm",
          "bg-[linear-gradient(110deg,#a3a3a3,45%,#fafafa,55%,#a3a3a3)] bg-size-[250%_100%] bg-clip-text animate-background-shine",
          className
        )}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute inset-x-0 top-0 mx-auto h-1.5 w-4/5 bg-primary blur-lg" />
        {title}
      </motion.div>
    </motion.div>
  );
}
