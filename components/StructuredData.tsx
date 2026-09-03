import { nav, site } from '@/data/site';

/**
 * JSON-LD structured data — the actual technical lever behind two things
 * Google *sometimes* shows for a brand search: the logo next to the result,
 * and a set of "sitelinks" (extra links under the main result, jumping
 * straight to other pages).
 *
 * IMPORTANT — read before promising either of these to Ryan:
 * Neither is something a site can switch on. Google's algorithm decides
 * whether to show a logo or sitelinks, and typically only does once a site
 * has enough age, indexed pages and direct "Henry Design Build" brand
 * searches — there is no setting, schema flag or fee that forces it. What
 * this file does is give Google the strongest possible signal so that,
 * once the site qualifies, it has the right logo and page structure to
 * draw from — the Organization/LocalBusiness `logo` field, and a
 * `SiteNavigationElement` list matching the real nav so the real page
 * structure is unambiguous. It commonly takes weeks to months after
 * launch, tied to real traffic and backlinks, not to this file.
 */
export default function StructuredData() {
  const logoUrl = `${site.url}/brand/icon-512.png`;

  const business = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${site.url}/#business`,
    name: site.name,
    url: site.url,
    logo: logoUrl,
    image: logoUrl,
    description: `Custom cottages, tiny homes, saunas, kitchens and renovations across ${site.serviceArea}.`,
    email: site.email,
    ...(site.phone ? { telephone: site.phone } : {}),
    areaServed: site.serviceTowns.length > 0 ? site.serviceTowns : site.serviceAreaShort,
    sameAs: [site.instagram],
    founder: [
      { '@type': 'Person', name: site.owner.name },
      { '@type': 'Person', name: site.partner.name },
    ],
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    name: site.name,
    url: site.url,
    publisher: { '@id': `${site.url}/#business` },
  };

  // Mirrors the real header nav — the clearest signal of the site's actual
  // page structure, which is what sitelinks are drawn from.
  const siteNavigation = nav.map((item) => ({
    '@type': 'SiteNavigationElement',
    name: item.label,
    url: `${site.url}${item.href}`,
  }));

  const jsonLd = [business, website, ...siteNavigation];

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- static, server-generated JSON, no user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
