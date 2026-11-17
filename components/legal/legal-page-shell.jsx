import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function LegalPageShell({
  title,
  description,
  updated,
  children,
  otherHref,
  otherLabel,
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-2 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
        {otherHref && otherLabel ? (
          <Link
            href={otherHref}
            className="text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            {otherLabel} →
          </Link>
        ) : null}
      </div>

      <header className="mb-10 border-b border-slate-200/80 pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-500">
            {description}
          </p>
        ) : null}
        {updated ? (
          <p className="mt-4 text-sm text-slate-400">Last updated: {updated}</p>
        ) : null}
      </header>

      <article className="space-y-10 text-[15px] leading-relaxed text-slate-600">
        {children}
      </article>

      <div className="mt-12 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
        <p className="text-sm font-semibold text-slate-950">Questions?</p>
        <p className="mt-1 text-sm text-slate-500">
          Contact{" "}
          <a
            href="mailto:hey@payollar.com"
            className="font-medium text-slate-800 underline-offset-2 hover:underline"
          >
            hey@payollar.com
          </a>{" "}
          or visit{" "}
          <Link
            href="/contact-support"
            className="font-medium text-slate-800 underline-offset-2 hover:underline"
          >
            Contact support
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export function LegalSection({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-28 space-y-3">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function LegalSubheading({ children }) {
  return (
    <h3 className="pt-2 text-base font-semibold text-slate-900">{children}</h3>
  );
}

export function LegalList({ items, ordered = false }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={cn(
        "space-y-2 pl-5 text-slate-600",
        ordered ? "list-decimal" : "list-disc"
      )}
    >
      {items.map((item) => (
        <li key={typeof item === "string" ? item : item.key || String(item)}>
          {item}
        </li>
      ))}
    </Tag>
  );
}
