export type PortfolioCategory = 'case' | 'knife' | 'gloves' | 'capsule' | 'sticker' | 'weapon' | 'other';

const CASE_PATTERN = /\bcase\b|weapon case|operation|clutch case|fracture|snakebite|riptide|dreams|nightmares|revolution|recoil|prisma|horizon|spectrum|danger zone|hydra case|phoenix|falchion case|chroma|bravo|esports|huntsman case|breakout|kilowatt|gallery|musica/;
const KNIFE_PATTERN = /knife|karambit|butterfly|bayonet|stiletto|talon|ursus|navaja|shadow|flip|gut|huntsman|falchion|bowie|m9|paracord|survival|nomad|skeleton|classic knife|kukri/;
const GLOVES_PATTERN = /gloves|wraps|hand wraps|moto gloves|specialist gloves|sport gloves|bloodhound|hydra/;
const CAPSULE_PATTERN = /capsule|autograph|legends|challengers|contenders/;
const STICKER_PATTERN = /sticker/;
const WEAPON_PATTERN = /ak-47|m4a4|m4a1|awp|sg 553|aug|famas|galil|scar-20|g3sg1|mac-10|mp5|mp7|mp9|pp-bizon|p90|ump-45|xm1014|nova|mag-7|sawed-off|negev|m249|p2000|usp-s|glock|p250|five-seven|cz75|tec-9|desert eagle|r8|dual berettas/;

export function getItemCategory(name: string): PortfolioCategory {
  const n = name.toLowerCase();
  const isContainer = !n.includes('|');
  if (isContainer && CASE_PATTERN.test(n)) return 'case';
  if (KNIFE_PATTERN.test(n)) return 'knife';
  if (GLOVES_PATTERN.test(n)) return 'gloves';
  if (isContainer && CAPSULE_PATTERN.test(n)) return 'capsule';
  if (STICKER_PATTERN.test(n)) return 'sticker';
  if (WEAPON_PATTERN.test(n)) return 'weapon';
  return 'other';
}

const STANDARD_WEARS = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];

export function getWearTag(name: string): string | null {
  for (const w of STANDARD_WEARS) {
    if (name.includes(w)) return w;
  }
  return null;
}

export interface PortfolioItem {
  price: number | null;
  snapshotPrice?: number | null;
  qty: number;
}

export function getPriceChange(item: PortfolioItem): number | null {
  if (!item.snapshotPrice || !item.price) return null;
  const pct = ((item.price - item.snapshotPrice) / item.snapshotPrice) * 100;
  if (Math.abs(pct) < 0.01) return null;
  return pct;
}

export function getTotalValue(items: PortfolioItem[]): number {
  return items.reduce((sum, i) => sum + (i.price || 0) * i.qty, 0);
}

export function getTotalQty(items: PortfolioItem[]): number {
  return items.reduce((sum, i) => sum + i.qty, 0);
}

export interface NamedPortfolioItem extends PortfolioItem {
  name: string;
}

export function getTopItem(items: NamedPortfolioItem[]): NamedPortfolioItem | null {
  const priced = items.filter(i => i.price !== null && i.price > 0);
  if (priced.length === 0) return null;
  return priced.sort((a, b) => (b.price as number) - (a.price as number))[0];
}

export interface PortfolioChange {
  diff: number;
  pct: number;
}

export function getPortfolioChange(items: PortfolioItem[]): PortfolioChange | null {
  const withSnapshot = items.filter(i => i.snapshotPrice && i.price && i.qty);
  if (withSnapshot.length === 0) return null;
  const totalNow = withSnapshot.reduce((s, i) => s + (i.price as number) * i.qty, 0);
  const totalYesterday = withSnapshot.reduce((s, i) => s + (i.snapshotPrice as number) * i.qty, 0);
  const diff = totalNow - totalYesterday;
  const pct = totalYesterday > 0 ? (diff / totalYesterday) * 100 : 0;
  if (Math.abs(diff) < 0.01) return null;
  return { diff, pct };
}
