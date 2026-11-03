"use client";

import { cn } from "@/lib/utils";

export {
  creatorCardClass as mediaAgencyCardClass,
  creatorCardMutedClass as mediaAgencyCardMutedClass,
} from "../../creator/_components/creator-page-shell";

/** Media agency pages — same light canvas as client / creator dashboards. */
export function MediaAgencyPageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}) {
  return (
    <div
      className={cn(
        "-m-3 min-h-full w-full !max-w-none bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:p-5",
        className
      )}
    >
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
