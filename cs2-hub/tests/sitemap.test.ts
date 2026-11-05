import { describe, it, expect } from 'vitest';
import { buildSitemapXml, escapeXml } from '../src/lib/sitemap';

const BASE = 'https://example.com';

describe('escapeXml', () => {
  it('escapes reserved characters', () => {
    expect(escapeXml('a&b<c>"d\'')).toBe('a&amp;b&lt;c&gt;&quot;d&apos;');
  });
});

describe('buildSitemapXml', () => {
  it('builds absolute urls and keeps the home page with a slash', () => {
    const xml = buildSitemapXml(BASE, [{ path: '/' }, { path: '/kalkulator' }]);
    expect(xml).toContain('<loc>https://example.com/</loc>');
    expect(xml).toContain('<loc>https://example.com/kalkulator</loc>');
  });

  it('accepts a base url with a trailing slash', () => {
    const xml = buildSitemapXml(`${BASE}/`, [{ path: '/skins' }]);
    expect(xml).toContain('<loc>https://example.com/skins</loc>');
  });

  it('includes lastmod only for valid dates and trims timestamps', () => {
    const xml = buildSitemapXml(BASE, [
      { path: '/a', lastmod: '2026-10-26T10:00:00Z' },
      { path: '/b', lastmod: 'wczoraj' },
      { path: '/c' },
    ]);
    expect(xml).toContain('<lastmod>2026-10-26</lastmod>');
    expect((xml.match(/<lastmod>/g) ?? []).length).toBe(1);
  });

  it('does not emit changefreq or priority', () => {
    const xml = buildSitemapXml(BASE, [{ path: '/a' }]);
    expect(xml).not.toContain('changefreq');
    expect(xml).not.toContain('priority');
  });

  it('drops duplicated urls', () => {
    const xml = buildSitemapXml(BASE, [{ path: '/a' }, { path: '/a' }]);
    expect((xml.match(/<loc>/g) ?? []).length).toBe(1);
  });

  it('escapes special characters inside urls', () => {
    const xml = buildSitemapXml(BASE, [{ path: '/a&b' }]);
    expect(xml).toContain('<loc>https://example.com/a&amp;b</loc>');
  });
});
