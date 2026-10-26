import type { APIRoute } from 'astro';
import { getAllCases } from '../lib/cases';
import { getAllGuides } from '../lib/guides';

export const GET: APIRoute = async () => {
  const CASES = await getAllCases();
  const GUIDES = await getAllGuides();

  const baseUrl = 'https://cs2-market.netlify.app';

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/kalkulator', priority: '0.9', changefreq: 'weekly' },
    { url: '/skins', priority: '0.9', changefreq: 'weekly' },
    { url: '/poradniki', priority: '0.7', changefreq: 'weekly' },
    { url: '/porownaj', priority: '0.6', changefreq: 'weekly' },
  ];

  const casePages = CASES.map(c => ({
    url: `/kalkulator/${c.slug}`,
    priority: '0.8',
    changefreq: 'monthly',
  }));

  const guidePages = GUIDES.map(guide => ({
    url: `/poradniki/${guide.slug}`,
    priority: '0.6',
    changefreq: 'monthly',
  }));

  const allPages = [...staticPages, ...casePages, ...guidePages];
  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
