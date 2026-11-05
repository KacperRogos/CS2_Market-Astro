import type { APIRoute } from 'astro';
import { getAllCases } from '../lib/cases';
import { getAllGuides } from '../lib/guides';
import { buildSitemapXml, type SitemapEntry } from '../lib/sitemap';
import { SITE_URL } from '../lib/site';

export const GET: APIRoute = async () => {
  const [cases, guides] = await Promise.all([getAllCases(), getAllGuides()]);

  const guideDates = guides.map(guide => guide.updatedAt).sort();
  const latestGuideDate = guideDates.length ? guideDates[guideDates.length - 1] : undefined;

  const entries: SitemapEntry[] = [
    { path: '/' },
    { path: '/kalkulator' },
    { path: '/skins' },
    { path: '/poradniki', lastmod: latestGuideDate },
    { path: '/porownaj' },
    ...cases.map(c => ({ path: `/kalkulator/${c.slug}` })),
    ...guides.map(guide => ({ path: `/poradniki/${guide.slug}`, lastmod: guide.updatedAt })),
  ];

  return new Response(buildSitemapXml(SITE_URL, entries), {
    status: 200,
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
