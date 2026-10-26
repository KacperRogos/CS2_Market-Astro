import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { categoryClass, estimateReadMinutes, guideSlugify } from '../src/data/guides';

const seed = JSON.parse(readFileSync(new URL('../src/scripts/_guides_data.json', import.meta.url), 'utf8'));

describe('guideSlugify', () => {
  it('strips Polish diacritics including l with stroke', () => {
    expect(guideSlugify('Pułapka na początkujących')).toBe('pulapka-na-poczatkujacych');
  });

  it('collapses separators and trims hyphens', () => {
    expect(guideSlugify('  Float value: co to?  ')).toBe('float-value-co-to');
  });
});

describe('categoryClass', () => {
  it('maps known categories with diacritics', () => {
    expect(categoryClass('Bezpieczeństwo')).toBe('cat-bezpieczenstwo');
  });

  it('falls back for unknown categories', () => {
    expect(categoryClass('Nowa kategoria')).toBe('cat-inne');
  });
});

describe('estimateReadMinutes', () => {
  it('returns at least one minute', () => {
    expect(estimateReadMinutes('<p>krotko</p>')).toBe(1);
  });

  it('ignores html tags when counting words', () => {
    const words = Array(400).fill('slowo').join(' ');
    expect(estimateReadMinutes(`<p>${words}</p>`)).toBe(2);
  });
});

describe('guides seed data', () => {
  it('has unique slugs', () => {
    const slugs = seed.map((g: { slug: string }) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('has slugs that are already url safe', () => {
    for (const g of seed) expect(guideSlugify(g.slug)).toBe(g.slug);
  });

  it('has every required field filled', () => {
    for (const g of seed) {
      expect(g.title).toBeTruthy();
      expect(g.excerpt).toBeTruthy();
      expect(g.description).toBeTruthy();
      expect(g.category).toBeTruthy();
      expect(g.content.length).toBeGreaterThan(100);
      expect(g.published_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Array.isArray(g.tags)).toBe(true);
    }
  });
});
