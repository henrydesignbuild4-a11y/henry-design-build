import type { Metadata } from 'next';
import { Architects_Daughter } from 'next/font/google';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import StructuredData from '@/components/StructuredData';
import ChatLauncher from '@/components/chat/ChatLauncher';
import { site } from '@/data/site';

const architectsDaughter = Architects_Daughter({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
  display: 'swap',
});

const body = Architects_Daughter({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: `Custom cottages, tiny homes, saunas, kitchens and renovations across ${site.serviceArea}. Design-build led hands-on by our team.`,
  keywords: [
    'custom cottage builder',
    'tiny home builder',
    'sauna builder',
    'kitchen renovation',
    'bathroom renovation',
    'design build',
    site.serviceAreaShort,
  ],
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: `Custom cottages, tiny homes, saunas and renovations. Small team. Big heart.`,
    url: site.url,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${architectsDaughter.variable} ${body.variable}`}>
      <head>
        <StructuredData />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-5 focus:py-3 focus:font-display focus:text-xs focus:uppercase focus:tracking-widest focus:text-bone"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        {/* Lives in the layout so the conversation survives navigation. */}
        <ChatLauncher />
      </body>
    </html>
  );
}
