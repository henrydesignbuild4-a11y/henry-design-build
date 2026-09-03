/**
 * Dedicated location landing pages — one per town in site.serviceTowns.
 *
 * These exist for a specific SEO reason: a search for "cottage builder
 * Muskoka" or "kitchen renovation London Ontario" almost never surfaces a
 * generic homepage — it surfaces pages built around that exact phrase. The
 * competitors who rank for these searches all have a dedicated page per
 * town; this site didn't, until now.
 *
 * The local detail on each page is pulled from the real research already
 * written for the matching journal post (data/journal.ts) — not invented
 * for this page — so nothing here is duplicate filler, and nothing claims
 * a specific completed project in a town we haven't confirmed.
 */

import type { LocationId } from '@/lib/estimate';

export interface LocationConsideration {
  title: string;
  body: string;
}

export interface LocationPage {
  slug: string;
  town: string;
  /** Ties this page to the Design Studio's own regional pricing. */
  regionId: LocationId;
  metaTitle: string;
  metaDescription: string;
  heroKicker: string;
  heroLines: string[];
  intro: string;
  /** Which of data/site.ts's `services` are most relevant to lead with here. */
  leadServices: string[];
  considerations: LocationConsideration[];
  journalSlug: string;
  cover: { src: string; alt: string };
}

export const locationPages: LocationPage[] = [
  {
    slug: 'muskoka',
    town: 'Muskoka',
    regionId: 'muskoka',
    metaTitle: 'Custom Cottage Builder & Renovations in Muskoka, Ontario',
    metaDescription:
      'Cottage renovations and custom builds in Muskoka — four-season conversions, boathouse work and additions that respect the original character.',
    heroKicker: 'Serving Muskoka',
    heroLines: ['Built for', 'Muskoka', 'cottage country'],
    intro:
      'Muskoka cottages carry generations of memories — the goal is never to erase that, it’s to build on it. Most of what we do here is renovation: bringing an older, summer-only cottage up to four-season standard without losing the stone fireplace or the knotty pine that makes it feel like this cottage.',
    leadServices: ['Renovations & restoration', 'Custom cottages', 'Custom carpentry'],
    considerations: [
      {
        title: 'Built for summer, being asked to do winter',
        body: 'Older Muskoka cottages were built for July and August, not January — thin walls, minimal insulation, small windows. Bringing one to real four-season comfort touches almost every system, not just the finishes.',
      },
      {
        title: 'Rock, and decades of additions',
        body: 'Many Muskoka properties are built on rock, with additions layered on over the years by different builders. A structural assessment before any renovation starts is essential — what looks simple can turn out to depend entirely on what a previous addition can actually support.',
      },
      {
        title: 'The details people won’t let you touch',
        body: 'A stone fireplace a grandfather built, original panelling, a particular view from the porch — the best Muskoka renovation listens to what actually matters to the family before reaching for a sledgehammer.',
      },
    ],
    journalSlug: 'renovating-a-muskoka-cottage',
    cover: {
      src: '/journal/muskoka-cottage-lake-dock.jpg',
      alt: 'Two Muskoka chairs on a wooden dock overlooking a calm lake at sunset',
    },
  },
  {
    slug: 'tobermory',
    town: 'Tobermory & the Bruce Peninsula',
    regionId: 'tobermory',
    metaTitle: 'Cottage & Cabin Builder in Tobermory, Bruce Peninsula',
    metaDescription:
      'Building on the Bruce Peninsula means designing around rock, remote access and conservation rules — a builder who knows the peninsula, not a standard southern-Ontario process applied to it.',
    heroKicker: 'Serving Tobermory & the Bruce Peninsula',
    heroLines: ['Built for', 'rock, remoteness', 'and the peninsula'],
    intro:
      'Building at the tip of the Bruce Peninsula is a different exercise than building almost anywhere else in southwestern Ontario. Between the escarpment rock underfoot, the remote access most lots have, and the region’s conservation rules, a Tobermory project takes a builder who has actually worked with the peninsula’s specifics.',
    leadServices: ['Custom cottages', 'Outdoor living spaces', 'Renovations & restoration'],
    considerations: [
      {
        title: 'Escarpment rock, not standard soil',
        body: 'The peninsula sits on the Niagara Escarpment — shallow soil over limestone bedrock in many places. Foundations sometimes need blasting or specialized footing systems where a standard dig isn’t possible. Knowing what’s under a lot before finalizing a design saves real cost and timeline surprises later.',
      },
      {
        title: 'Access shapes the whole schedule',
        body: 'Many Tobermory properties sit on rural roads, private lanes, or waterfront lots with limited access. Material delivery, equipment access and trade scheduling all get planned around this — the timeline here isn’t the timeline for a lot in town with a paved driveway.',
      },
      {
        title: 'Conservation approvals, on top of permits',
        body: 'Lots near the escarpment, wetlands or shoreline can fall under conservation authority approvals in addition to standard municipal permitting. Worth understanding at the very start — it can affect where a building sits on the lot and how long approvals take.',
      },
    ],
    journalSlug: 'building-on-the-bruce-peninsula',
    cover: {
      src: '/journal/bruce-peninsula-rocky-shoreline.jpg',
      alt: 'A stone cairn on the white dolomite rock shoreline of Georgian Bay near the Bruce Peninsula, turquoise water and forest behind it',
    },
  },
  {
    slug: 'grand-bend',
    town: 'Grand Bend',
    regionId: 'grand-bend',
    metaTitle: 'Cottage Builder & Renovations in Grand Bend, Lake Huron',
    metaDescription:
      'Building and renovating in Grand Bend means designing for sandy soil, lake wind and sun exposure — and for a growing number of owners going year-round.',
    heroKicker: 'Serving Grand Bend & the Lake Huron shoreline',
    heroLines: ['Built for', 'sand, sun', 'and the lake'],
    intro:
      'Grand Bend draws people for the beach and the sunsets over Lake Huron — but building here means designing for a specific environment. Sandy soil, prevailing lake wind, and a growing number of owners converting a seasonal cottage into a full-time home all shape the decisions that go into a build that actually holds up.',
    leadServices: ['Custom cottages', 'Renovations & restoration', 'Outdoor living spaces'],
    considerations: [
      {
        title: 'West-facing views cut both ways',
        body: 'Lake Huron sunsets are the whole point of a Grand Bend property, but west exposure also means strong prevailing wind and intense afternoon sun. Overhangs, covered porches and window placement all get designed around it, not added as an afterthought.',
      },
      {
        title: 'Sandy, well-draining soil',
        body: 'Much of the Grand Bend area sits on sandy soil, which changes foundation design. It rewards a builder who understands the local ground rather than applying a generic approach built for clay or till.',
      },
      {
        title: 'Seasonal cottage, year-round ambitions',
        body: 'Plenty of Grand Bend properties started as summer-only cottages and are being converted to full-time homes. That decision touches insulation, heating, window performance, and how plumbing gets protected through the coldest months if it won’t be occupied.',
      },
    ],
    journalSlug: 'building-a-cottage-in-grand-bend',
    cover: {
      src: '/journal/grand-bend-lake-huron-dunes.jpg',
      alt: 'Sand dunes and marram grass along the Lake Huron shoreline near Grand Bend at golden hour',
    },
  },
  {
    slug: 'london',
    town: 'London, Ontario',
    regionId: 'london',
    metaTitle: 'Home Renovation Contractor in London, Ontario',
    metaDescription:
      'Kitchen, bathroom and whole-home renovations for London character homes — Old North, Wortley Village, Byron and beyond — handled by a local design-build team.',
    heroKicker: 'Serving London, Ontario',
    heroLines: ['Built for', 'London’s character', 'homes'],
    intro:
      'London is full of character homes — from century properties in Old North and Wortley Village to the mid-century bungalows spread through the city’s established neighbourhoods. That character is part of what makes London worth renovating in, and it comes with its own quirks: plaster walls, original brick, and permit timelines worth understanding before you start.',
    leadServices: ['Kitchens & baths', 'Renovations & restoration', 'Custom carpentry'],
    considerations: [
      {
        title: 'Know the era before you plan',
        body: 'A 1920s character home in Old North and a 1960s bungalow in Byron behave very differently once a wall opens up — plaster and knob-and-tube on one side, straightforward systems that may just need better insulation on the other. Worth a walkthrough before budgeting.',
      },
      {
        title: 'Permits move faster when you plan for them',
        body: 'The City of London requires permits for structural changes, additions, and new electrical or plumbing work — a kitchen renovation that moves plumbing or takes out a wall usually needs one. Review can add a few weeks depending on scope, which is worth building into the timeline from day one.',
      },
      {
        title: 'What we build most often here',
        body: 'Kitchen renovations that open sightlines in older, more closed-off floor plans; basement finishing; second-storey additions on bungalows where the lot won’t allow a horizontal one; whole-home updates that keep original trim and hardwood while modernizing kitchens, baths and mechanicals.',
      },
    ],
    journalSlug: 'renovating-your-london-home',
    cover: {
      src: '/portfolio/real-kitchen-dining.jpg',
      alt: 'Open kitchen and dining room with a live-edge table, leather chairs and pendant lighting over the island',
    },
  },
];

export function getLocationPage(slug: string) {
  return locationPages.find((l) => l.slug === slug);
}
