import { describe, it, expect } from 'vitest';
import {
  getItemCategory,
  getWearTag,
  getPriceChange,
  getTotalValue,
  getTotalQty,
  getTopItem,
  getPortfolioChange,
} from '../src/data/portfolio';

describe('getItemCategory', () => {
  it('classifies real weapon cases correctly', () => {
    expect(getItemCategory('Fracture Case')).toBe('case');
    expect(getItemCategory('Operation Broken Fang Case')).toBe('case');
  });

  it('does not misclassify cases whose name overlaps a knife name (regression test)', () => {
    expect(getItemCategory('Falchion Case')).toBe('case');
    expect(getItemCategory('Huntsman Weapon Case')).toBe('case');
  });

  it('does not misclassify "Case Hardened" skins as cases (regression test)', () => {
    expect(getItemCategory('Huntsman Knife | Case Hardened')).toBe('knife');
    expect(getItemCategory('AK-47 | Case Hardened')).toBe('weapon');
    expect(getItemCategory('Karambit | Case Hardened')).toBe('knife');
  });

  it('classifies knives correctly', () => {
    expect(getItemCategory('Falchion Knife | Doppler')).toBe('knife');
    expect(getItemCategory('★ Karambit | Fade')).toBe('knife');
  });

  it('classifies gloves correctly', () => {
    expect(getItemCategory("Sport Gloves | Pandora's Box")).toBe('gloves');
  });

  it('classifies stickers correctly even though the name contains a pipe', () => {
    expect(getItemCategory('Sticker | Katowice 2022')).toBe('sticker');
  });

  it('classifies plain weapon skins correctly', () => {
    expect(getItemCategory('AWP | Asiimov (Field-Tested)')).toBe('weapon');
    expect(getItemCategory('AK-47 | Redline')).toBe('weapon');
  });

  it('falls back to "other" for unrecognized items', () => {
    expect(getItemCategory('Some Random Item')).toBe('other');
  });
});

describe('getWearTag', () => {
  it('extracts the wear from a full skin name', () => {
    expect(getWearTag('AWP | Asiimov (Field-Tested)')).toBe('Field-Tested');
  });

  it('returns null when there is no wear in the name', () => {
    expect(getWearTag('Fracture Case')).toBeNull();
  });
});

describe('getPriceChange', () => {
  it('returns a positive percentage when price went up', () => {
    const pct = getPriceChange({ price: 110, snapshotPrice: 100, qty: 1 });
    expect(pct).toBeCloseTo(10, 5);
  });

  it('returns a negative percentage when price went down', () => {
    const pct = getPriceChange({ price: 90, snapshotPrice: 100, qty: 1 });
    expect(pct).toBeCloseTo(-10, 5);
  });

  it('returns null when there is no snapshot to compare against', () => {
    expect(getPriceChange({ price: 100, snapshotPrice: null, qty: 1 })).toBeNull();
  });

  it('returns null when the price is null', () => {
    expect(getPriceChange({ price: null, snapshotPrice: 100, qty: 1 })).toBeNull();
  });

  it('returns null for a negligible change under 0.01%', () => {
    expect(getPriceChange({ price: 100.0001, snapshotPrice: 100, qty: 1 })).toBeNull();
  });
});

describe('getTotalValue / getTotalQty', () => {
  const items = [
    { price: 10, qty: 2 },
    { price: 5, qty: 3 },
    { price: null, qty: 1 },
  ];

  it('sums price times quantity, treating null prices as zero', () => {
    expect(getTotalValue(items)).toBe(35);
  });

  it('sums quantities regardless of price', () => {
    expect(getTotalQty(items)).toBe(6);
  });

  it('returns 0 for an empty portfolio', () => {
    expect(getTotalValue([])).toBe(0);
    expect(getTotalQty([])).toBe(0);
  });
});

describe('getTopItem', () => {
  it('finds the highest-priced item', () => {
    const items = [
      { name: 'Cheap Skin', price: 5, qty: 1 },
      { name: 'Expensive Skin', price: 500, qty: 1 },
      { name: 'Mid Skin', price: 50, qty: 1 },
    ];
    expect(getTopItem(items)?.name).toBe('Expensive Skin');
  });

  it('ignores items with no price', () => {
    const items = [
      { name: 'Unpriced', price: null, qty: 1 },
      { name: 'Priced', price: 10, qty: 1 },
    ];
    expect(getTopItem(items)?.name).toBe('Priced');
  });

  it('returns null when nothing has a price', () => {
    const items = [{ name: 'Unpriced', price: null, qty: 1 }];
    expect(getTopItem(items)).toBeNull();
  });

  it('returns null for an empty portfolio', () => {
    expect(getTopItem([])).toBeNull();
  });
});

describe('getPortfolioChange', () => {
  it('calculates a positive overall change', () => {
    const items = [
      { price: 120, snapshotPrice: 100, qty: 1 },
      { price: 60, snapshotPrice: 50, qty: 1 },
    ];
    const change = getPortfolioChange(items);
    expect(change).not.toBeNull();
    expect(change!.diff).toBeCloseTo(30, 5);
    expect(change!.pct).toBeCloseTo(20, 5);
  });

  it('ignores items without a snapshot when computing the change', () => {
    const items = [
      { price: 120, snapshotPrice: 100, qty: 1 },
      { price: 999, snapshotPrice: null, qty: 5 },
    ];
    const change = getPortfolioChange(items);
    expect(change!.diff).toBeCloseTo(20, 5);
  });

  it('returns null when no items have a snapshot', () => {
    const items = [{ price: 100, snapshotPrice: null, qty: 1 }];
    expect(getPortfolioChange(items)).toBeNull();
  });

  it('returns null for a negligible overall change', () => {
    const items = [{ price: 100.001, snapshotPrice: 100, qty: 1 }];
    expect(getPortfolioChange(items)).toBeNull();
  });
});
