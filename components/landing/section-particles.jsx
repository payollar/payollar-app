"use client";

import { Particles } from "@/components/ui/particles";
import { cn } from "@/lib/utils";

/**
 * Decorative canvas particles for landing sections (non-interactive).
 * Default tint matches brand primary; tune opacity/quantity per section.
 */
export function SectionParticles({
  className,
  opacityClass = "opacity-[0.22]",
  quantity = 42,
  color = "#0055ff",
  staticity = 55,
  ease = 45,
}) {
  return (
    <div
      className={cn("pointer-events-none absolute overflow-hidden", opacityClass, className)}
      aria-hidden
    >
      <Particles
        className="absolute inset-0 h-full w-full"
        quantity={quantity}
        color={color}
        staticity={staticity}
        ease={ease}
      />
    </div>
  );
}
