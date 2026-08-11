import { describe, it, expect } from 'vitest';
import { DROP_RATES, RARITY_LABELS, avgCasesNeeded, avgCostNeeded } from '../src/data/cases';

describe('DROP_RATES', () => {
  it('sums to 100% (Valve official probabilities)', () => {
    const total = Object.values(DROP_RATES).reduce((sum, p) => sum + p, 0);
    expect(total).toBeCloseTo(1, 4);
  });

  it('has a label for every rarity with a drop rate', () => {
    for (const rarity of Object.keys(DROP_RATES)) {
      expect(RARITY_LABELS, `missing label for "${rarity}"`).toHaveProperty(rarity);
    }
  });

  it('rare-special is the rarest outcome', () => {
    const rareSpecial = DROP_RATES['rare-special'];
    for (const [rarity, rate] of Object.entries(DROP_RATES)) {
      if (rarity === 'rare-special') continue;
      expect(rate, `"${rarity}" should be more common than rare-special`).toBeGreaterThan(rareSpecial);
    }
  });
});

describe('avgCasesNeeded', () => {
  it('matches the real-world "~385 cases for a knife" figure', () => {
    expect(avgCasesNeeded('rare-special')).toBe(385);
  });

  it('is the inverse of the drop rate, rounded', () => {
    for (const rarity of Object.keys(DROP_RATES) as (keyof typeof DROP_RATES)[]) {
      expect(avgCasesNeeded(rarity)).toBe(Math.round(1 / DROP_RATES[rarity]));
    }
  });
});

describe('avgCostNeeded', () => {
  it('multiplies cases needed by total cost per case (case + key)', () => {
    const cost = avgCostNeeded('covert', 0.15, 9.50);
    const expectedCases = avgCasesNeeded('covert');
    expect(cost).toBeCloseTo(expectedCases * (0.15 + 9.50), 5);
  });

  it('is zero when both case and key are free (sanity check)', () => {
    expect(avgCostNeeded('mil-spec', 0, 0)).toBe(0);
  });
});
