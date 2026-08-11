import { describe, it, expect } from 'vitest';
import { RARITY_MAP, WEAPON_CATEGORIES, WEAPONS_BY_CATEGORY } from '../src/data/skins';

const ALL_RARITY_KEYS = [
  'consumer', 'industrial', 'mil-spec', 'restricted',
  'classified', 'covert', 'contraband', 'extraordinary',
] as const;

describe('RARITY_MAP', () => {
  it('has an entry for every rarity used across the site', () => {
    for (const key of ALL_RARITY_KEYS) {
      expect(RARITY_MAP, `missing RARITY_MAP entry for "${key}"`).toHaveProperty(key);
    }
  });

  it('every entry has both a label and a color', () => {
    for (const [key, value] of Object.entries(RARITY_MAP)) {
      expect(value.label, `${key} missing label`).toBeTruthy();
      expect(value.color, `${key} missing color`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe('WEAPON_CATEGORIES and WEAPONS_BY_CATEGORY', () => {
  it('define the exact same set of categories', () => {
    const labelKeys = Object.keys(WEAPON_CATEGORIES).sort();
    const weaponKeys = Object.keys(WEAPONS_BY_CATEGORY).sort();
    expect(weaponKeys).toEqual(labelKeys);
  });

  it('no category is left with an empty weapon list', () => {
    for (const [category, weapons] of Object.entries(WEAPONS_BY_CATEGORY)) {
      expect(weapons.length, `category "${category}" has no weapons`).toBeGreaterThan(0);
    }
  });

  it('no weapon is assigned to more than one category', () => {
    const seen = new Map<string, string>();
    for (const [category, weapons] of Object.entries(WEAPONS_BY_CATEGORY)) {
      for (const weapon of weapons) {
        const existing = seen.get(weapon);
        expect(existing, `"${weapon}" is listed in both "${existing}" and "${category}"`).toBeUndefined();
        seen.set(weapon, category);
      }
    }
  });
});
