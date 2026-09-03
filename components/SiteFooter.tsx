import Image from 'next/image';
import Link from 'next/link';
import { locationPages } from '@/data/locations';
import { nav, site } from '@/data/site';

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-bone">
      <div className="shell py-20">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl font-extrabold uppercase leading-[0.95] tracking-[-0.02em] sm:text-4xl">
              Legacy is not
              <br />
              mass produced.
              <br />
              <span className="text-cedar">It&rsquo;s hand built.</span>
            </p>
            <p className="mt-7 max-w-sm text-sm leading-relaxed text-bone/60">
              {site.name} — custom cottages, tiny homes, saunas and renovations across{' '}
              {site.serviceArea}.
            </p>
          </div>

          <div>
            <h2 className="eyebrow text-bone/40">Explore</h2>
            <ul className="mt-6 space-y-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-bone/70 transition-colors hover:text-cedar"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="eyebrow text-bone/40">Get in touch</h2>
            <ul className="mt-6 space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="text-bone/70 transition-colors hover:text-cedar"
                >
                  {site.email}
                </a>
              </li>
              {site.phone && (
                <li>
                  <a
                    href={`tel:${site.phone.replace(/[^0-9+]/g, '')}`}
                    className="text-bone/70 transition-colors hover:text-cedar"
                  >
                    {site.phone}
                  </a>
                </li>
              )}
              <li>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bone/70 transition-colors hover:text-cedar"
                >
                  {site.instagramHandle}
                </a>
              </li>
              <li className="pt-3 text-bone/45">
                {site.serviceArea}
                {site.serviceTowns.length > 0 && (
                  <span className="mt-1 block space-x-1 text-bone/35">
                    {site.serviceTowns.map((town, i) => {
                      const page = locationPages.find(
                        (l) => l.town.split(',')[0].split(' & ')[0] === town
                      );
                      return (
                        <span key={town}>
                          {page ? (
                            <Link href={`/locations/${page.slug}`} className="hover:text-cedar">
                              {town}
                            </Link>
                          ) : (
                            town
                          )}
                          {i < site.serviceTowns.length - 1 && ' · '}
                        </span>
                      );
                    })}
                  </span>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-bone/12 pt-8">
          {site.credentials.redSeal && (
            <div className="flex h-9 items-center border border-bone/25 bg-white px-2 w-fit">
              <Image
                src="/brand/red-seal-proud-supporter.png"
                alt="Red Seal Proud Supporter"
                width={518}
                height={247}
                className="h-6 w-auto"
              />
            </div>
          )}
          <div className="flex flex-col gap-4 text-xs text-bone/40 sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
              {(site.credentials.insured || site.credentials.wedi) && (
                <span className="ml-2 text-bone/30">
                  ·{' '}
                  {[
                    site.credentials.wedi && 'Wedi Certified',
                    site.credentials.insured && 'Fully Insured',
                    `${site.yearsExperience} Years`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              )}
            </p>
            <p>
              {site.owner.name} &amp; {site.partner.name}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
