import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJournalPost } from '@/data/journal';
import { getLocationPage, locationPages } from '@/data/locations';
import { services, site } from '@/data/site';

/** "Tobermory & the Bruce Peninsula" → "Tobermory"; "Muskoka" → "Muskoka". */
function shortTown(town: string) {
  return town.split(',')[0].split(' & ')[0];
}

export function generateStaticParams() {
  return locationPages.map((l) => ({ slug: l.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const loc = getLocationPage(params.slug);
  if (!loc) return { title: 'Location not found' };
  return {
    title: loc.metaTitle,
    description: loc.metaDescription,
    openGraph: {
      title: loc.metaTitle,
      description: loc.metaDescription,
      images: [{ url: loc.cover.src }],
    },
  };
}

export default function LocationPage({ params }: { params: { slug: string } }) {
  const loc = getLocationPage(params.slug);
  if (!loc) notFound();

  const journalPost = getJournalPost(loc.journalSlug);
  const leadServices = services.filter((s) => loc.leadServices.includes(s.title));

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Design-build services in ${loc.town}`,
    areaServed: { '@type': 'Place', name: loc.town },
    provider: { '@id': `${site.url}/#business` },
    url: `${site.url}/locations/${loc.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- static, server-generated JSON
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      {/* Hero */}
      <section className="relative -mt-[4.5rem] flex min-h-[75svh] items-end overflow-hidden bg-ink pt-[4.5rem]">
        <Image
          src={loc.cover.src}
          alt={loc.cover.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-50"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30"
          aria-hidden="true"
        />

        <div className="shell relative w-full pb-16 pt-28 text-bone">
          <p className="eyebrow text-cedar">{loc.heroKicker}</p>
          <h1 className="h-hero mt-5 max-w-3xl">
            {loc.heroLines.map((line, i) => (
              <span key={i} className={i === loc.heroLines.length - 1 ? 'text-cedar' : ''}>
                {line}
                {i < loc.heroLines.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="lede mt-8 max-w-xl text-bone/70">{loc.intro}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/start" className="btn-cedar">
              Start a project
            </Link>
            <Link href="/portfolio" className="btn-ghost-dark">
              See the work
            </Link>
          </div>
        </div>
      </section>

      {/* What we build here */}
      <section className="shell py-16 sm:py-20">
        <p className="eyebrow text-ink/40">What we build in {loc.town}</p>
        <div className="mt-7 grid gap-6 sm:grid-cols-3">
          {leadServices.map((s) => (
            <div key={s.title} className="border border-ink/12 bg-white/50 p-6">
              <h2 className="font-display text-base font-bold uppercase tracking-[-0.01em]">
                {s.title}
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-ink/65">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Local considerations */}
      <section className="border-y border-ink/10 bg-sand py-16 sm:py-20">
        <div className="shell">
          <p className="eyebrow text-ink/40">Building &amp; renovating in {loc.town}</p>
          <h2 className="h-section mt-5 max-w-xl">What actually matters here</h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-3">
            {loc.considerations.map((c) => (
              <div key={c.title}>
                <h3 className="font-display text-[0.95rem] font-bold uppercase leading-snug tracking-[-0.01em]">
                  {c.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">{c.body}</p>
              </div>
            ))}
          </div>

          {journalPost && (
            <div className="mt-12 border-t border-ink/10 pt-8">
              <p className="text-sm text-ink/55">
                Read more in the journal:{' '}
                <Link
                  href={`/journal/${journalPost.slug}`}
                  className="font-semibold text-ink underline underline-offset-2 hover:text-brass"
                >
                  {journalPost.title}
                </Link>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="shell py-20 text-center sm:py-24">
        <h2 className="h-section mx-auto max-w-xl">Have a project in {shortTown(loc.town)}?</h2>
        <p className="mx-auto mt-4 max-w-md text-ink/65">
          Sketch it in the Design Studio for a planning range priced for {shortTown(loc.town)}, or
          just tell us what you&rsquo;re picturing.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/start" className="btn-primary">
            Start a project
          </Link>
          <Link href="/contact" className="btn-ghost-light">
            Ask a question
          </Link>
        </div>
        <p className="mx-auto mt-8 max-w-md text-xs text-ink/40">
          {site.name} also builds and renovates in{' '}
          {locationPages
            .filter((l) => l.slug !== loc.slug)
            .map((l, i, arr) => (
              <span key={l.slug}>
                <Link href={`/locations/${l.slug}`} className="underline underline-offset-2 hover:text-brass">
                  {shortTown(l.town)}
                </Link>
                {i < arr.length - 2 ? ', ' : i === arr.length - 2 ? ' and ' : ''}
              </span>
            ))}
          .
        </p>
      </section>
    </>
  );
}
