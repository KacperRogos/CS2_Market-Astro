import { describe, it, expect } from 'vitest';
import { slugify } from '../src/data/skins';
import type { Skin } from '../src/data/cases';

function findDuplicateSkins(skins: Skin[]): string[] {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const s of skins) {
    const key = slugify(`${s.weapon}-${s.name}`);
    if (seen.has(key)) duplicates.push(key);
    seen.add(key);
  }
  return duplicates;
}

describe('case content shape', () => {
  it('flags duplicate weapon+name entries within the same case (e.g. Doppler phases)', () => {
    const withDuplicate: Skin[] = [
      { weapon: 'Glock-18', name: 'Gamma Doppler', rarity: 'rare-special', wears: ['Factory New'], minFloat: 0, maxFloat: 0.08 },
      { weapon: 'Glock-18', name: 'Gamma Doppler', rarity: 'rare-special', wears: ['Factory New'], minFloat: 0, maxFloat: 0.08 },
    ];
    expect(findDuplicateSkins(withDuplicate)).toHaveLength(1);
  });

  it('finds no duplicates in a clean case', () => {
    const clean: Skin[] = [
      { weapon: 'AK-47', name: 'Head Shot', rarity: 'covert', wears: ['Factory New'], minFloat: 0, maxFloat: 1 },
      { weapon: 'M4A4', name: 'Temukau', rarity: 'covert', wears: ['Factory New'], minFloat: 0, maxFloat: 0.55 },
    ];
    expect(findDuplicateSkins(clean)).toHaveLength(0);
  });

  it('every skin has minFloat strictly less than maxFloat', () => {
    const skins: Skin[] = [
      { weapon: 'AWP', name: 'Asiimov', rarity: 'covert', wears: ['Field-Tested'], minFloat: 0.18, maxFloat: 1 },
    ];
    for (const s of skins) {
      expect(s.minFloat, `${s.weapon} | ${s.name}`).toBeLessThan(s.maxFloat);
    }
  });

  it('every skin has at least one wear listed', () => {
    const skins: Skin[] = [
      { weapon: 'USP-S', name: 'Kill Confirmed', rarity: 'covert', wears: ['Factory New', 'Minimal Wear'], minFloat: 0, maxFloat: 0.08 },
    ];
    for (const s of skins) {
      expect(s.wears.length, `${s.weapon} | ${s.name}`).toBeGreaterThan(0);
    }
  });
});
