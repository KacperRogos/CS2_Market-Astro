import { describe, it, expect } from 'vitest';
import { slugify } from '../src/data/skins';

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('AK-47 Redline')).toBe('ak-47-redline');
  });

  it('keeps existing hyphens in weapon names intact', () => {
    expect(slugify('M4A1-S-Printstream')).toBe('m4a1-s-printstream');
  });

  it('strips accented characters instead of dropping the whole word', () => {
    expect(slugify('Glock-18-Azúcar')).toBe('glock-18-azucar');
  });

  it('collapses multiple separators into one hyphen', () => {
    expect(slugify('Five-SeveN  |  Pale Waves')).toBe('five-seven-pale-waves');
  });

  it('never leaves a leading or trailing hyphen', () => {
    expect(slugify('  Desert Eagle Emerald  ')).toBe('desert-eagle-emerald');
  });

  it('produces the same slug for the same weapon+name pair every time', () => {
    const a = slugify('USP-S-Jawbreaker');
    const b = slugify('USP-S-Jawbreaker');
    expect(a).toBe(b);
  });

  it('produces different slugs for genuinely different skins', () => {
    expect(slugify('AWP-Jawbreaker')).not.toBe(slugify('USP-S-Jawbreaker'));
  });
});
