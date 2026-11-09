"use client";

import Link from "next/link";
import { FileText, MessageCircle } from "lucide-react";
import { parseBriefFields } from "@/lib/booking-brief";
import { cn } from "@/lib/utils";

/**
 * @param {"client"|"creator"} [viewer="creator"]
 *   Client view reframes labels as their own brief; creator view keeps "client expectations".
 */
export function ClientExpectationsPanel({
  brief,
  appointmentId,
  viewer = "creator",
  className,
  cardClassName,
  compact = false,
}) {
  const text = String(brief || "").trim();
  if (!text) return null;

  const fields = parseBriefFields(text);
  const structured = Boolean(
    fields.want || fields.expect || fields.timing || fields.notes
  );
  const isClient = viewer === "client";

  const rows = structured
    ? [
        fields.want
          ? {
              label: isClient ? "What you want" : "What they want",
              value: fields.want,
            }
          : null,
        fields.expect
          ? {
              label: isClient ? "What you expect" : "What they expect",
              value: fields.expect,
            }
          : null,
        fields.timing
          ? {
              label: isClient ? "Timing / deadline" : "Timing / deadline",
              value: fields.timing,
            }
          : null,
        fields.notes
          ? {
              label: /^Product offer:/i.test(String(fields.notes))
                ? "Product offer"
                : isClient
                  ? "Other details"
                  : "Other details",
              value: fields.notes,
            }
          : null,
      ].filter(Boolean)
    : [
        {
          label: isClient ? "Your brief" : "Project brief",
          value: text,
        },
      ];

  return (
    <section className={cn(cardClassName, "space-y-3 p-4 sm:p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-700">
            <FileText className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              {isClient ? "Your brief" : "Client expectations"}
            </h2>
            <p className="text-sm text-slate-500">
              {isClient
                ? "From the booking chat — talent sees this when delivering"
                : "Shared from the booking chat brief"}
            </p>
          </div>
        </div>
        {appointmentId ? (
          <Link
            href={`/messages/${appointmentId}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-violet-300 hover:text-violet-700"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {isClient ? "Edit in chat" : "Open chat"}
          </Link>
        ) : null}
      </div>

      <div className={cn("space-y-3", compact && "space-y-2")}>
        {rows.map((row) => (
          <div
            key={row.label}
            className={cn(
              "rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3",
              compact && "py-2.5"
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {row.label}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
