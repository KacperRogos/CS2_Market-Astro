export interface SitemapEntry {
  path: string;
  lastmod?: string;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function validLastmod(value: string | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}/.test(value)) return null;
  return value.slice(0, 10);
}

export function buildSitemapXml(baseUrl: string, entries: SitemapEntry[]): string {
  const base = baseUrl.replace(/\/+$/, '');
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const entry of entries) {
    const path = entry.path.startsWith('/') ? entry.path : `/${entry.path}`;
    const loc = `${base}${path}`;
    if (seen.has(loc)) continue;
    seen.add(loc);
    const lastmod = validLastmod(entry.lastmod);
    urls.push(
      `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}
