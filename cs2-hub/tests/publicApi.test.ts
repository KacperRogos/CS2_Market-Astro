import { describe, it, expect } from 'vitest';
import { buildSelectUrl, ilikeAny, sanitizeSearch } from '../src/lib/publicApi';
import { optimizedImage, optimizedSrcset } from '../src/data/skins';

const BASE = 'https://example.supabase.co';

describe('sanitizeSearch', () => {
  it('removes characters that break PostgREST filters', () => {
    expect(sanitizeSearch('ak,47 (redline) *"%')).toBe('ak 47 redline');
  });

  it('collapses whitespace and trims', () => {
    expect(sanitizeSearch('  m4a1   s  ')).toBe('m4a1 s');
  });
});

describe('ilikeAny', () => {
  it('builds an or filter across columns', () => {
    expect(ilikeAny(['weapon', 'name'], 'Redline')).toBe('(weapon.ilike.*Redline*,name.ilike.*Redline*)');
  });

  it('returns null when nothing searchable is left', () => {
    expect(ilikeAny(['weapon'], ' ,() ')).toBeNull();
  });
});

describe('buildSelectUrl', () => {
  it('selects everything from the rest endpoint by default', () => {
    expect(buildSelectUrl(BASE, 'skins')).toBe(`${BASE}/rest/v1/skins?select=*`);
  });

  it('accepts a base url with a trailing slash', () => {
    expect(buildSelectUrl(`${BASE}/`, 'skins')).toBe(`${BASE}/rest/v1/skins?select=*`);
  });

  it('adds filters, ordering, limit and offset', () => {
    const url = buildSelectUrl(BASE, 'skins', {
      filters: { category: 'eq.rifle' },
      order: [['weapon', 'asc'], ['name', 'desc']],
      limit: 30,
      offset: 60,
    });
    expect(url).toContain('category=eq.rifle');
    expect(url).toContain('order=weapon.asc%2Cname.desc');
    expect(url).toContain('limit=30');
    expect(url).toContain('offset=60');
  });

  it('omits offset when it is zero', () => {
    expect(buildSelectUrl(BASE, 'skins', { limit: 5, offset: 0 })).not.toContain('offset');
  });

  it('encodes the or filter', () => {
    const url = buildSelectUrl(BASE, 'skins', { or: '(weapon.ilike.*a b*,name.ilike.*a b*)' });
    expect(url).toContain('or=(weapon.ilike.*a%20b*%2Cname.ilike.*a%20b*)');
  });
});

describe('optimizedSrcset', () => {
  it('lists every width with a w descriptor', () => {
    const srcset = optimizedSrcset('https://img.test/a', [256, 512]);
    expect(srcset).toBe(`${optimizedImage('https://img.test/a', 256)} 256w, ${optimizedImage('https://img.test/a', 512)} 512w`);
  });
});
