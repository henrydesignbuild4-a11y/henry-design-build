import type { MetadataRoute } from 'next';
import { furniture } from '@/data/furniture';
import { journalPosts } from '@/data/journal';
import { projects } from '@/data/projects';
import { site } from '@/data/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/portfolio',
    '/visualizer',
    '/start',
    '/about',
    '/journal',
    '/papas-shop',
    '/faq',
    '/contact',
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const projectRoutes = projects.map((p) => ({
    url: `${site.url}/portfolio/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.7,
  }));

  const journalRoutes = journalPosts.map((post) => ({
    url: `${site.url}/journal/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  const furnitureRoutes = furniture.map((item) => ({
    url: `${site.url}/papas-shop/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...routes, ...projectRoutes, ...journalRoutes, ...furnitureRoutes];
}
