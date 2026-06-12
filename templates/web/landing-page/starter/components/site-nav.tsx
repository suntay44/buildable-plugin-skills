"use client";

import { useState } from "react";
import { navLinks } from "@/lib/sample-content";

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#hero" className="text-lg font-semibold text-ink">
          Clarity
        </a>

        <div className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-slate-600 hover:text-ink">
              {link.label}
            </a>
          ))}
          <a
            href="#pricing"
            className="rounded-md bg-meadow px-4 py-2 text-sm font-semibold text-white hover:bg-meadow/90"
          >
            Start free trial
          </a>
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((current) => !current)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 sm:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {open ? (
        <div id="mobile-nav" className="grid gap-1 border-t border-slate-200 bg-white px-4 py-3 sm:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:bg-mist"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#pricing"
            onClick={() => setOpen(false)}
            className="mt-1 rounded-md bg-meadow px-4 py-2 text-center text-sm font-semibold text-white"
          >
            Start free trial
          </a>
        </div>
      ) : null}
    </header>
  );
}
