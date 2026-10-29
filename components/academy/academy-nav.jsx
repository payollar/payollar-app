"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#products", label: "Products" },
  { href: "#desk", label: "The AI" },
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export function AcademyNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-[#07080d]/80 px-3 py-2 shadow-lg shadow-black/30 backdrop-blur-xl sm:px-4">
        <Link href="/academy" className="flex items-center gap-2 pl-1">
          <Image
            src="/icons/Payollar-logo.png"
            alt="Payollar"
            width={132}
            height={32}
            className="h-7 w-auto object-contain"
          />
          <span className="rounded-full bg-[#0055ff] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white">
            Academy
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Academy">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <Link href="/clip" className="rounded-full px-3 py-1.5 text-sm text-white/70 hover:text-white">
            Clip
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="hidden rounded-full px-3 py-1.5 text-sm text-white/75 hover:text-white sm:inline">
            Sign in
          </Link>
          <a
            href="#products"
            className="rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-black transition-colors hover:bg-[#0055ff] hover:text-white"
          >
            See the products
          </a>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10 md:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="mx-auto mt-2 max-w-6xl rounded-2xl border border-white/10 bg-[#10131c] p-2 md:hidden" aria-label="Academy mobile">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
          <Link href="/clip" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5">
            Clip
          </Link>
          <Link href="/sign-in" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5">
            Sign in
          </Link>
        </nav>
      )}
    </header>
  );
}
