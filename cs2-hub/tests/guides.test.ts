import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { categoryClass, estimateReadMinutes, getRelatedGuides, guideSlugify, type Guide } from '../src/data/guides';

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

function makeGuide(slug: string, category: string, tags: string[], date: string): Guide {
  return {
    id: slug,
    slug,
    title: slug,
    excerpt: '',
    description: '',
    category,
    readTime: '5 min',
    date,
    updatedAt: date,
    tags,
    content: '',
    published: true,
  };
}

describe('getRelatedGuides', () => {
  const current = makeGuide('a', 'Platformy', ['steam', 'prowizja'], '2026-01-01');
  const sameCategory = makeGuide('b', 'Platformy', [], '2026-02-01');
  const sameTags = makeGuide('c', 'Analiza', ['steam', 'prowizja'], '2026-03-01');
  const unrelated = makeGuide('d', 'Prawo', [], '2026-04-01');

  it('never returns the current guide', () => {
    const result = getRelatedGuides(current, [current, sameCategory, sameTags, unrelated]);
    expect(result.map(g => g.slug)).not.toContain('a');
  });

  it('ranks shared category and tags above unrelated guides', () => {
    const result = getRelatedGuides(current, [unrelated, sameCategory, sameTags]);
    expect(result.map(g => g.slug)).toEqual(['c', 'b', 'd']);
  });

  it('falls back to newest first when nothing is related', () => {
    const older = makeGuide('e', 'Prawo', [], '2026-01-01');
    const newer = makeGuide('f', 'Prawo', [], '2026-05-01');
    expect(getRelatedGuides(current, [older, newer]).map(g => g.slug)).toEqual(['f', 'e']);
  });

  it('respects the limit and handles an empty list', () => {
    expect(getRelatedGuides(current, [sameCategory, sameTags, unrelated], 2)).toHaveLength(2);
    expect(getRelatedGuides(current, [])).toEqual([]);
  });
});
