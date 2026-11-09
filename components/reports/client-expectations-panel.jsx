"use client";

import Link from "next/link";
import { FileText, MessageCircle } from "lucide-react";
import { parseBriefFields } from "@/lib/booking-brief";
import { cn } from "@/lib/utils";

export function ClientExpectationsPanel({
  brief,
  appointmentId,
  className,
  cardClassName,
}) {
  const text = String(brief || "").trim();
  if (!text) return null;

  const fields = parseBriefFields(text);
  const structured = Boolean(
    fields.want || fields.expect || fields.timing || fields.notes
  );

  const rows = structured
    ? [
        fields.want ? { label: "What they want", value: fields.want } : null,
        fields.expect ? { label: "What they expect", value: fields.expect } : null,
        fields.timing ? { label: "Timing / deadline", value: fields.timing } : null,
        fields.notes ? { label: "Other details", value: fields.notes } : null,
      ].filter(Boolean)
    : [{ label: "Project brief", value: text }];

  return (
    <section className={cn(cardClassName, "space-y-3 p-4 sm:p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-700">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Client expectations
              </h2>
              <p className="text-sm text-slate-500">
                Shared from the booking chat brief
              </p>
            </div>
          </div>
        </div>
        {appointmentId ? (
          <Link
            href={`/messages/${appointmentId}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-violet-300 hover:text-violet-700"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Open chat
          </Link>
        ) : null}
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3"
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
