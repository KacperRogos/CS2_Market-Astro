import { describe, it, expect } from 'vitest';
import { parsePrice, buildSteamMarketUrl } from '../src/data/format';

describe('parsePrice', () => {
  it('parses a simple Polish price string', () => {
    expect(parsePrice('0,15 zł')).toBe(0.15);
  });

  it('parses a plain dot-decimal string', () => {
    expect(parsePrice('9.50')).toBe(9.50);
  });

  it('parses a price with a thousands separator', () => {
    expect(parsePrice('1.234,56 zł')).toBe(1234.56);
  });

  it('parses a whole number with no decimals', () => {
    expect(parsePrice('42 zł')).toBe(42);
  });

  it('returns null for empty or missing input', () => {
    expect(parsePrice('')).toBeNull();
    expect(parsePrice(null)).toBeNull();
    expect(parsePrice(undefined)).toBeNull();
  });

  it('returns null for text with no usable number', () => {
    expect(parsePrice('brak ofert')).toBeNull();
  });
});

describe('buildSteamMarketUrl', () => {
  it('builds a regular weapon skin URL', () => {
    const url = buildSteamMarketUrl('AK-47', 'Redline', 'Field-Tested');
    expect(url).toBe(
      'https://steamcommunity.com/market/listings/730/AK-47%20%7C%20Redline%20(Field-Tested)'
    );
  });

  it('adds the star prefix for knives and gloves', () => {
    const url = buildSteamMarketUrl('Karambit', 'Fade', 'Factory New', true);
    expect(url).toContain(encodeURIComponent('★ Karambit | Fade (Factory New)'));
  });

  it('never produces a URL containing a raw, un-encoded pipe character', () => {
    const url = buildSteamMarketUrl('M4A1-S', 'Printstream', 'Minimal Wear');
    expect(url).not.toContain('|');
  });
});
