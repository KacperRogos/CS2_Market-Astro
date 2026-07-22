/**
 * Jednorazowy skrypt: dodaje WSZYSTKIE skiny broni (bez noży i rękawic) do tabeli
 * Supabase `skins`. Umieszczony w cs2-hub/src/scripts/seed-weapons-bulk.ts.
 *
 * Skąd biorą się dane: publiczne, darmowe źródło danych CS2 (ByMykel/CSGO-API,
 * https://github.com/ByMykel/CSGO-API) pobierane JEDNORAZOWO w trakcie działania
 * tego skryptu — NIE jest to żadne API używane na żywo przez stronę. Po
 * zakończeniu skryptu wszystkie dane leżą fizycznie w Twojej tabeli `skins`
 * w Supabase, dokładnie tak jak wpisy dodane ręcznie w /admin.
 *
 * Opisy (`description`) są generowane automatycznie po polsku na bazie
 * prawdziwych danych (broń, rzadkość, skrzynka/kolekcja, zakres float).
 * Rok wydania (`release_year`) jest szacowany na podstawie nazwy kolekcji/
 * skrzynki — to najlepsze możliwe przybliżenie bez ręcznego wpisywania
 * ~1450 dat; jeśli chcesz, możesz je później skorygować w /admin.
 *
 * Użycie (z katalogu cs2-hub, tak jak seed-skins.ts):
 *   1. npm install --save-dev tsx   (jeśli jeszcze nie masz)
 *   2. Ustaw SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY w zmiennych środowiskowych
 *      (Supabase Dashboard > Project Settings > API > service_role)
 *   3. npx tsx src/scripts/seed-weapons-bulk.ts
 *      (albo dodaj do package.json: "seed:weapons-bulk": "tsx src/scripts/seed-weapons-bulk.ts")
 *
 * Skrypt używa `upsert` po `id`, więc jest bezpieczny do wielokrotnego
 * uruchamiania — nie tworzy duplikatów.
 */

import { createClient } from '@supabase/supabase-js';
import { SEED_SKINS, WEAPONS_BY_CATEGORY, RARITY_MAP, type WeaponCategory } from '../data/skins';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Brak SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY w zmiennych środowiskowych.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const SOURCE_URL = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json';

// --- tylko kategorie broni (bez knife/gloves) ---
const WEAPON_CATEGORIES: WeaponCategory[] = ['rifle', 'pistol', 'smg', 'sniper', 'shotgun', 'heavy'];
const WEAPON_TO_CATEGORY = new Map<string, WeaponCategory>();
for (const cat of WEAPON_CATEGORIES) {
  for (const weapon of WEAPONS_BY_CATEGORY[cat]) WEAPON_TO_CATEGORY.set(weapon, cat);
}

const API_RARITY_TO_KEY: Record<string, SkinRarity> = {
  'Consumer Grade': 'consumer',
  'Industrial Grade': 'industrial',
  'Mil-Spec Grade': 'mil-spec',
  'Restricted': 'restricted',
  'Classified': 'classified',
  'Covert': 'covert',
  'Contraband': 'contraband',
};

type SkinRarity = keyof typeof RARITY_MAP;

// Rok wydania kolekcji/skrzynki — najlepsze możliwe przybliżenie.
const COLLECTION_YEAR: Record<string, number> = {
  'Limited Edition Item': 2014,
  'Achroma Collection': 2025, 'Alpha Collection': 2016, 'Ancient Collection': 2021,
  'Anubis Collection': 2023, 'Arabesque Collection': 2024, 'Arms Deal Collection': 2013,
  'Arms Deal 2 Collection': 2013, 'Arms Deal 3 Collection': 2013, 'Ascent Collection': 2025,
  'Assault Collection': 2013, 'Aztec Collection': 2013, 'Baggage Collection': 2013,
  'Bank Collection': 2014, 'Blacksite Collection': 2019, 'Boreal Collection': 2024,
  'Bravo Collection': 2013, 'Breakout Collection': 2014, 'CS20 Collection': 2019,
  'Cache Collection': 2014, 'Canals Collection': 2015, 'Chop Shop Collection': 2014,
  'Chroma Collection': 2015, 'Chroma 2 Collection': 2015, 'Chroma 3 Collection': 2016,
  'Clutch Collection': 2018, 'Cobblestone Collection': 2014, 'Control Collection': 2024,
  'Danger Zone Collection': 2018, 'Dead Hand Collection': 2020,
  'Dreams & Nightmares Collection': 2022, 'Dust Collection': 2013, 'Dust 2 Collection': 2013,
  'Falchion Collection': 2015, 'Fever Collection': 2024, 'Fracture Collection': 2020,
  'Gallery Collection': 2023, 'Gamma Collection': 2016, 'Gamma 2 Collection': 2016,
  'Genesis Collection': 2018, 'Glove Collection': 2016, 'Gods and Monsters Collection': 2025,
  'Graphic Design Collection': 2024, 'Harlequin Collection': 2025, 'Havoc Collection': 2025,
  'Horizon Collection': 2017, 'Huntsman Collection': 2014, 'Inferno Collection': 2013,
  'Italy Collection': 2013, 'Kilowatt Collection': 2024, 'Lake Collection': 2013,
  'Militia Collection': 2013, 'Mirage Collection': 2013, 'Norse Collection': 2025,
  'Nuke Collection': 2013, 'Office Collection': 2013,
  'Operation Broken Fang Collection': 2020, 'Operation Hydra Collection': 2017,
  'Operation Riptide Collection': 2021, 'Overpass Collection': 2014,
  'Phoenix Collection': 2014, 'Prisma Collection': 2019, 'Prisma 2 Collection': 2020,
  'Radiant Collection': 2020, 'Recoil Collection': 2022, 'Revolution Collection': 2023,
  'Revolver Case Collection': 2015, 'Rising Sun Collection': 2015, 'Safehouse Collection': 2013,
  'Shadow Collection': 2015, 'Shattered Web Collection': 2019, 'Snakebite Collection': 2021,
  'Spectrum Collection': 2017, 'Spectrum 2 Collection': 2017, 'Sport & Field Collection': 2020,
  'Spy Tech Collection': 2014, 'St. Marc Collection': 2024, 'Train Collection': 2013,
  'Vanguard Collection': 2014, 'Vertigo Collection': 2019, 'Wildfire Collection': 2016,
  'Winter Offensive Collection': 2014, 'X-Ray Collection': 2024,
};
const DEFAULT_YEAR = 2016; // fallback gdy nic nie pasuje

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function guessYear(collectionRaw: string | null, caseRaw: string | null): number {
  const yearMatch = (collectionRaw ?? caseRaw ?? '').match(/20\d{2}/);
  if (yearMatch) return parseInt(yearMatch[0], 10);
  const key = (collectionRaw ?? '').replace(/^The /, '');
  if (COLLECTION_YEAR[key] != null) return COLLECTION_YEAR[key];
  return DEFAULT_YEAR;
}

function pickCase(crates: { name: string }[]): string | null {
  if (!crates?.length) return null;
  const real = crates.find(c => /Case/i.test(c.name) && !/Souvenir|Package/i.test(c.name));
  return (real ?? crates[0]).name;
}

function buildDescription(weapon: string, name: string, rarityLabel: string, collection: string | null, caseSource: string | null, minFloat: number, maxFloat: number, wears: string[]): string {
  const source = caseSource
    ? ` Pochodzi ze skrzynki ${caseSource}.`
    : collection
      ? ` Należy do kolekcji ${collection}.`
      : '';
  return `${weapon} | ${name} to skin klasy ${rarityLabel}. Dostępny float: ${minFloat.toFixed(2)}–${maxFloat.toFixed(2)} (${wears.join(', ')}).${source}`;
}

interface ApiSkin {
  name: string;
  weapon: { name: string };
  rarity: { name: string };
  min_float: number | null;
  max_float: number | null;
  wears: { name: string }[];
  collections: { name: string }[];
  crates: { name: string }[];
  paint_index: string;
  image: string;
}

async function main() {
  console.log('Pobieram dane źródłowe...');
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Nie udało się pobrać danych: ${res.status}`);
  const all: ApiSkin[] = await res.json();

  const existingSlugToId = new Map(SEED_SKINS.map(s => [s.slug, s.id]));

  const rows = [];
  const usedSlugs = new Set<string>();
  for (const item of all) {
    const category = WEAPON_TO_CATEGORY.get(item.weapon.name);
    if (!category) continue; // pomijamy noże, rękawice, sprzęt itd.
    const pipeIdx = item.name.indexOf(' | ');
    if (pipeIdx === -1) continue; // pomijamy warianty bez skina (vanilla)
    const skinName = item.name.slice(pipeIdx + 3).trim();
    const rarityKey = API_RARITY_TO_KEY[item.rarity.name];
    if (!rarityKey) continue;
    if (item.min_float == null || item.max_float == null) continue;

    const weapon = item.weapon.name;
    let slug = slugify(`${weapon}-${skinName}`);
    if (usedSlugs.has(slug)) slug = `${slug}-${item.paint_index}`; // rzadkie kolizje (np. fazy Dopplera)
    usedSlugs.add(slug);
    const id = existingSlugToId.get(slug) ?? slug;
    const collection = item.collections?.[0]?.name.replace(/^The /, '') ?? null;
    const caseSource = pickCase(item.crates);
    const wears = item.wears.map(w => w.name);
    const rarityLabel = RARITY_MAP[rarityKey].label;
    const releaseYear = guessYear(collection, caseSource);
    const defaultWear = wears.includes('Factory New') ? 'Factory New' : wears[0];

    const tags: string[] = [rarityKey];
    if (!wears.includes('Factory New')) tags.push('no-fn');
    if (!wears.includes('Minimal Wear')) tags.push('no-mw');
    if (!wears.includes('Battle-Scarred')) tags.push('low-max-float');
    if (caseSource) tags.push(slugify(caseSource));

    rows.push({
      id,
      slug,
      weapon,
      name: skinName,
      category,
      rarity: rarityKey,
      min_float: item.min_float,
      max_float: item.max_float,
      wears,
      description: buildDescription(weapon, skinName, rarityLabel, collection, caseSource, item.min_float, item.max_float, wears),
      lore: null,
      collection,
      case_source: caseSource,
      release_year: releaseYear,
      steam_market_url: `https://steamcommunity.com/market/listings/730/${encodeURIComponent(`${weapon} | ${skinName} (${defaultWear})`)}`,
      tags,
      image_url: item.image ?? null,
    });
  }

  console.log(`Przygotowano ${rows.length} skinów broni do zapisu.`);

  const BATCH = 200;
  let saved = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { data, error } = await supabase.from('skins').upsert(batch, { onConflict: 'id' }).select('id');
    if (error) {
      console.error(`Błąd w paczce ${i}-${i + batch.length}:`, error);
      process.exit(1);
    }
    saved += data?.length ?? 0;
    console.log(`  zapisano ${saved}/${rows.length}...`);
  }

  console.log(`✅ Gotowe. Zapisano/zaktualizowano ${saved} skinów broni w tabeli 'skins'.`);
}

main().catch(err => {
  console.error('Błąd skryptu:', err);
  process.exit(1);
});
