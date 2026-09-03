'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { nav, site } from '@/data/site';

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Threshold is deliberately well past a typical header height, not just
    // a few pixels — hero sections run tall (up to 92svh), and flipping to
    // the "scrolled" ink-on-light styling while still deep inside a dark
    // hero image made the header briefly unreadable right after the very
    // first scroll tick.
    const onScroll = () => setScrolled(window.scrollY > 140);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Close on a click outside the dropdown, or on Escape — standard dropdown
  // behaviour now that this no longer takes over the whole screen.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-[80] transition-all duration-300 ${
        scrolled ? 'border-b border-ink/10 bg-cedar/25 backdrop-blur-md' : 'bg-cedar/10'
      }`}
    >
      <div className="shell flex h-[4.5rem] items-center justify-between gap-6">
        <Link href="/" className="flex items-center" aria-label={`${site.name} home`}>
          <Image
            src="/brand/logo.png"
            alt={site.name}
            width={900}
            height={391}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <nav className="hidden items-center gap-6 xl:flex" aria-label="Main">
          {nav.map((item) => {
            const active =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                // Deliberately NOT scroll- or page-dependent, same reasoning
                // as the hamburger button: swapping between a light and a
                // dark text colour assumed a dark hero always sits behind
                // the header. This is the logo's own blue instead — one
                // colour that reads on every page and every scroll state.
                className={`relative font-display text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#157FFB] transition-opacity ${
                  active ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-1.5 left-0 h-px w-full bg-cedar" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden xl:block">
          <Link href="/start" className="btn-primary !px-6 !py-3">
            Start a project
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          // Deliberately NOT scroll- or page-dependent: this used to switch
          // between a light and a dark transparent style based on scroll
          // position, which assumed every page has a dark hero sitting
          // behind the header. Pages without one (or the moment right after
          // any scroll, while still over a dark hero) made it nearly
          // invisible. A solid button reads on every page, every time.
          // Background stays solid ink for guaranteed contrast on every
          // page/state; the bars themselves are the logo's sampled blue
          // (#157FFB), not the site's paler "cedar" accent.
          className="flex h-11 w-11 items-center justify-center rounded-sm bg-ink transition-colors hover:bg-stone xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span className="relative block h-4 w-6" aria-hidden="true">
            <span
              className={`absolute left-0 block h-[2px] w-6 bg-[#157FFB] transition-all duration-300 ${
                open ? 'top-[7px] rotate-45' : 'top-0'
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] block h-[2px] w-6 bg-[#157FFB] transition-all duration-200 ${
                open ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`absolute left-0 block h-[2px] w-6 bg-[#157FFB] transition-all duration-300 ${
                open ? 'top-[7px] -rotate-45' : 'top-[14px]'
              }`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full z-[70] max-h-[calc(100svh-4.5rem)] overflow-y-auto border-t border-ink/10 bg-bone shadow-[0_20px_40px_rgba(20,17,15,0.18)] xl:hidden"
        >
          <nav className="shell flex flex-col py-3" aria-label="Mobile">
            {nav.map((item) => {
              const active =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`border-b border-ink/8 py-3.5 font-display text-base font-bold uppercase tracking-[0.02em] transition-colors hover:text-brass ${
                    active ? 'text-brass' : 'text-ink'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link href="/start" className="btn-cedar mt-5 w-full text-center">
              Start a project
            </Link>
            {site.phone && (
              <a
                href={`tel:${site.phone.replace(/[^0-9+]/g, '')}`}
                className="mt-4 text-center font-display text-sm font-bold text-ink"
              >
                {site.phone}
              </a>
            )}
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-1 mt-4 text-center font-display text-[0.7rem] uppercase tracking-[0.18em] text-ink/55"
            >
              {site.instagramHandle}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
