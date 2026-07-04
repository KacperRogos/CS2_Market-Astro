export type Rarity = 'mil-spec' | 'restricted' | 'classified' | 'covert' | 'rare-special';

export interface Skin {
  name: string;
  weapon: string;
  rarity: Rarity;
  wears: string[];
  minFloat: number;
  maxFloat: number;
  steamUrl?: string;
}

export interface Case {
  id: string;
  name: string;
  slug: string;
  releaseYear: number;
  keyPrice: number; // PLN
  casePrice: number; // PLN approx
  description: string;
  skins: Skin[];
}

// Oficjalne prawdopodobieństwa Valve
export const DROP_RATES: Record<Rarity, number> = {
  'mil-spec':     0.7992,
  'restricted':   0.1598,
  'classified':   0.032,
  'covert':       0.0064,
  'rare-special': 0.0026, // nóż / rękawice
};

export const RARITY_LABELS: Record<Rarity, string> = {
  'mil-spec':     'Mil-Spec (niebieskie)',
  'restricted':   'Restricted (fioletowe)',
  'classified':   'Classified (różowe)',
  'covert':       'Covert (czerwone)',
  'rare-special': 'Nóż / Rękawice (złote)',
};

export const RARITY_COLORS: Record<Rarity, string> = {
  'mil-spec':     '#4b69ff',
  'restricted':   '#8847ff',
  'classified':   '#d32ce6',
  'covert':       '#eb4b4b',
  'rare-special': '#e4ae39',
};

const STANDARD_WEARS = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];
const NO_FN_WEARS = ['Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];

/**
 * @deprecated Dane skrzynek żyją teraz w Supabase (tabela `cases`).
 * Ta tablica została użyta wyłącznie do jednorazowego seedu (seed-cases.ts)
 * i zostaje tu jako historyczny backup — strony NIE powinny jej już importować.
 * Zamiast tego używaj funkcji z `src/lib/cases.ts`.
 */
export const SEED_CASES: Case[] = [
  {
    id: 'revolution',
    name: 'Revolution Case',
    slug: 'revolution-case',
    releaseYear: 2023,
    keyPrice: 10.49,
    casePrice: 0.10,
    description: 'Skrzynka Revolution Case zawiera 17 skinów w tym ikoniczne wzory jak AK-47 Calm Waters i M4A4 Temukau. Wydana w lutym 2023.',
    skins: [
      { name: 'Calm Waters',    weapon: 'AK-47',          rarity: 'covert',       wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Temukau',        weapon: 'M4A4',           rarity: 'covert',       wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Tidal Wave',     weapon: 'USP-S',          rarity: 'classified',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Gold Cartel',    weapon: 'M4A1-S',         rarity: 'classified',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Amber Fade',     weapon: 'MP9',            rarity: 'classified',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Azúcar',         weapon: 'Glock-18',       rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Cassette',       weapon: 'SG 553',         rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.06, maxFloat: 0.80 },
      { name: 'Jawbreaker',     weapon: 'AWP',            rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Neural Net',     weapon: 'FAMAS',          rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Emerald',        weapon: 'Desert Eagle',   rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Digital Wave',   weapon: 'Tec-9',          rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Yellow Jacket',  weapon: 'MP7',            rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Mortar',         weapon: 'XM1014',         rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Slipstream',     weapon: 'P250',           rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Contractor',     weapon: 'PP-Bizon',       rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Night Ops',      weapon: 'CZ75-Auto',      rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Oxide Blaze',    weapon: 'MAC-10',         rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: '★ Nóż / Rękawice Revolution', weapon: '★', rarity: 'rare-special', wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 1.00 },
    ],
  },
  {
    id: 'recoil',
    name: 'Recoil Case',
    slug: 'recoil-case',
    releaseYear: 2022,
    keyPrice: 10.49,
    casePrice: 0.08,
    description: 'Recoil Case z lipca 2022 słynie z AK-47 Ice Coaled i M4A1-S Emphorosaur-S. Jedna z popularniejszych skrzynek ostatnich lat.',
    skins: [
      { name: 'Ice Coaled',       weapon: 'AK-47',        rarity: 'covert',       wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Emphorosaur-S',    weapon: 'M4A1-S',       rarity: 'covert',       wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.60 },
      { name: 'Turbine',          weapon: 'AWP',          rarity: 'classified',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Magma',            weapon: 'Glock-18',     rarity: 'classified',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Dazzle',           weapon: 'P250',         rarity: 'classified',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Rangeen',          weapon: 'MAC-10',       rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Nidhogg',          weapon: 'Tec-9',        rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Trigger Discipline',weapon: 'MP9',         rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Hot Rod',          weapon: 'FAMAS',        rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.50 },
      { name: 'Spike Rush',       weapon: 'MP5-SD',       rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Roll Cage',        weapon: 'XM1014',       rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Midnight Storm',   weapon: 'P90',          rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Tempered Steel',   weapon: 'UMP-45',       rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Flashpoint',       weapon: 'CZ75-Auto',    rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Pale Waves',       weapon: 'Five-SeveN',   rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Drift',            weapon: 'Dual Berettas', rarity: 'mil-spec',    wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: '★ Nóż / Rękawice Recoil', weapon: '★',    rarity: 'rare-special', wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 1.00 },
    ],
  },
  {
    id: 'kilowatt',
    name: 'Kilowatt Case',
    slug: 'kilowatt-case',
    releaseYear: 2024,
    keyPrice: 10.49,
    casePrice: 0.08,
    description: 'Kilowatt Case z 2024 roku to jedna z najnowszych skrzynek CS2. Zawiera AK-47 Inheritance i M4A1-S Black Lotus — bardzo poszukiwane skiny.',
    skins: [
      { name: 'Inheritance',      weapon: 'AK-47',        rarity: 'covert',       wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Black Lotus',      weapon: 'M4A1-S',       rarity: 'covert',       wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Exoskeleton',      weapon: 'AWP',          rarity: 'classified',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Grinder',          weapon: 'Glock-18',     rarity: 'classified',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Azurite Wave',     weapon: 'USP-S',        rarity: 'classified',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Induction',        weapon: 'M4A4',         rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Sparkplug',        weapon: 'MAC-10',       rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Relay',            weapon: 'MP9',          rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Circuit Breaker',  weapon: 'Five-SeveN',   rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Short Circuit',    weapon: 'Tec-9',        rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Power Surge',      weapon: 'SG 553',       rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Watt\'s Up',       weapon: 'MP7',          rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Overtime',         weapon: 'P2000',        rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Converge',         weapon: 'FAMAS',        rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Flux',             weapon: 'P90',          rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Impact Drill',     weapon: 'Nova',         rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: '★ Nóż / Rękawice Kilowatt', weapon: '★',  rarity: 'rare-special', wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 1.00 },
    ],
  },
  {
    id: 'fracture',
    name: 'Fracture Case',
    slug: 'fracture-case',
    releaseYear: 2020,
    keyPrice: 10.49,
    casePrice: 0.07,
    description: 'Fracture Case z 2020 roku zawiera kultowe skiny jak Desert Eagle Printstream i MP5-SD Liquidation. Jedna z bardziej opłacalnych skrzynek do otwarcia.',
    skins: [
      { name: 'Printstream',      weapon: 'Desert Eagle', rarity: 'covert',       wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Cranberry Splash', weapon: 'MP9',          rarity: 'covert',       wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Liquidation',      weapon: 'MP5-SD',       rarity: 'classified',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Spectre',          weapon: 'M4A4',         rarity: 'classified',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.60 },
      { name: 'Yellow Jacket',    weapon: 'Glock-18',     rarity: 'classified',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Jade Imperator',   weapon: 'CZ75-Auto',    rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'System Failure',   weapon: 'FAMAS',        rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Circuit Breaker',  weapon: 'AUG',          rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Flashback',        weapon: 'AWP',          rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Amber Fade',       weapon: 'PP-Bizon',     rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Blood Money',      weapon: 'P250',         rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Green Apple',      weapon: 'Tec-9',        rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Whitefish',        weapon: 'R8 Revolver',  rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Rolling Loader',   weapon: 'XM1014',       rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Junk Yard',        weapon: 'SG 553',       rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Neon Rider',       weapon: 'MAC-10',       rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: '★ Nóż / Rękawice Fracture', weapon: '★',  rarity: 'rare-special', wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 1.00 },
    ],
  },
  {
    id: 'dreams-nightmares',
    name: 'Dreams & Nightmares Case',
    slug: 'dreams-and-nightmares-case',
    releaseYear: 2022,
    keyPrice: 10.49,
    casePrice: 0.09,
    description: 'Dreams & Nightmares Case z 2022 roku to wyjątkowa skrzynka — wszystkie skiny zaprojektowali gracze w ramach konkursu społeczności. Zawiera AWP Goo i AK-47 Magula.',
    skins: [
      { name: 'Goo',              weapon: 'AWP',          rarity: 'covert',       wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Magula',           weapon: 'AK-47',        rarity: 'covert',       wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Emerald Slip',     weapon: 'MP9',          rarity: 'classified',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Lucid Eye',        weapon: 'Glock-18',     rarity: 'classified',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Natural Observer', weapon: 'M4A1-S',       rarity: 'classified',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Mirrorverse',      weapon: 'USP-S',        rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Lifeweaver',       weapon: 'SG 553',       rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Twilight Galaxy',  weapon: 'MP7',          rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Night Terror',     weapon: 'FAMAS',        rarity: 'restricted',   wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Night Terror',     weapon: 'MAC-10',       rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Azurewrath',       weapon: 'P250',         rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Dark Water',       weapon: 'Dual Berettas', rarity: 'mil-spec',    wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Monster Mash',     weapon: 'Five-SeveN',   rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Abyssal Apparition', weapon: 'XM1014',     rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Sonar',            weapon: 'PP-Bizon',     rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: 'Coral Venom',      weapon: 'MP5-SD',       rarity: 'mil-spec',     wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 0.80 },
      { name: '★ Nóż / Rękawice D&N', weapon: '★',       rarity: 'rare-special', wears: STANDARD_WEARS, minFloat: 0.00, maxFloat: 1.00 },
    ],
  },
];

export function getSkinsByRarity(c: Case, rarity: Rarity): Skin[] {
  return c.skins.filter(s => s.rarity === rarity);
}

// Ile skrzynek statystycznie potrzeba na dany rarity
export function avgCasesNeeded(rarity: Rarity): number {
  return Math.round(1 / DROP_RATES[rarity]);
}

// Koszt statystyczny (skrzynka + klucz) na zdobycie skina danego rarity
export function avgCostNeeded(rarity: Rarity, casePrice: number, keyPrice: number): number {
  return avgCasesNeeded(rarity) * (casePrice + keyPrice);
}
