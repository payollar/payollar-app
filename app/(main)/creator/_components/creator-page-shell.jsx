"use client";

import { Particles } from "@/components/ui/particles";
import { cn } from "@/lib/utils";

/** Shared card surface for creator pages inside the light dashboard frame. */
export const creatorCardClass =
  "rounded-2xl border border-white bg-white text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.04)]";

export const creatorCardMutedClass =
  "rounded-xl border border-slate-200 bg-slate-50 text-slate-900";

/**
 * Standard page wrapper: eyebrow + title + description + content
 * on the same light canvas as the creator overview.
 */
export function CreatorPageShell({
  eyebrow,
  title,
  description,
  /** Optional right-side controls (e.g. primary CTA) */
  actions,
  children,
  className,
}) {
  return (
    <div className={cn("-m-4 min-h-full bg-[#f4f6fb] p-4 text-slate-900 md:-m-6 md:p-5", className)}>
      <div className="mx-auto max-w-7xl space-y-6">
        {(eyebrow || title || description || actions) && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              {eyebrow ? (
                <p className="text-xs font-medium uppercase tracking-wider text-[#0055ff]">
                  {eyebrow}
                </p>
              ) : null}
              {title ? (
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                  {title}
                </h1>
              ) : null}
              {description ? (
                <p className="max-w-2xl text-sm text-slate-500">{description}</p>
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

/** Previous shell, still used by the client and media-agency dashboards. */
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

export const legacyCardClass =
  "rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm";

export const legacyCardMutedClass =
  "rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm";

export function LegacyDashboardShell({
  eyebrow,
  title,
  description,
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
