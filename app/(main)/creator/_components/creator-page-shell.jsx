"use client";

import { Particles } from "@/components/ui/particles";
import { cn } from "@/lib/utils";

/** Shared card surface (Avento / dashboard) */
export const creatorCardClass =
  "rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm";

export const creatorCardMutedClass =
  "rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm";

/** Decorative particles — primary blue, low density */
export function CreatorParticles({ className }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute -right-6 -top-8 h-72 w-[min(100%,32rem)] opacity-[0.28] md:opacity-[0.38]",
        className
      )}
      aria-hidden
    >
      <Particles
        className="absolute inset-0"
        quantity={48}
        color="#0055ff"
        staticity={55}
        ease={45}
      />
    </div>
  );
}

/**
 * Standard page wrapper: particles + optional eyebrow + title + description + content.
 */
export function CreatorPageShell({
  eyebrow,
  title,
  description,
  /** Optional right-side controls (e.g. primary CTA) */
  actions,
  children,
  className,
  showParticles = true,
}) {
  return (
    <div className={cn("relative mx-auto max-w-7xl space-y-8", className)}>
      {showParticles ? <CreatorParticles /> : null}
      <div className="relative z-[1] space-y-8">
        {(eyebrow || title || description || actions) && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              {eyebrow ? (
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  {eyebrow}
                </p>
              ) : null}
              {title ? (
                <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  {title}
                </h1>
              ) : null}
              {description ? (
                <p className="max-w-2xl text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {actions ? (
              <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
            ) : null}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
