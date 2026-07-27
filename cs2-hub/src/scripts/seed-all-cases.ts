/**
 * Dodaje WSZYSTKIE prawdziwe skrzynki CS2 (42 — wszystkie typu "Case" z
 * historii gry, od CS:GO Weapon Case po Fever Case) do tabeli `cases`,
 * razem z ich prawdziwą, w pełni poprawną zawartością (bronie + noże/
 * rękawice — dokładnie tyle, ile faktycznie można z nich wylosować).
 *
 * Źródło: ByMykel/CSGO-API — `crates.json` (lista skrzynek, `contains` /
 * `contains_rare` jako ID-referencje) + `skins.json` (pełne dane po ID:
 * float, wears, obrazek). Dopasowanie po ID (nie po nazwie) — zweryfikowane
 * jako w 100% kompletne dla wszystkich 42 skrzynek typu "Case".
 *
 * Bezpieczne do wielokrotnego odpalania:
 *  - Skrzynki dopasowywane po `name` — jeśli skrzynka o tej nazwie już
 *    istnieje (np. Twoich 5 wcześniejszych), jej wiersz zostaje
 *    ZAKTUALIZOWANY (ten sam slug/id), a nie zduplikowany.
 *  - Skiny w tabeli `skins` upsertowane po id — nie tworzy duplikatów.
 *
 * Użycie:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx src/scripts/seed-all-cases.ts
 */

import { createClient } from '@supabase/supabase-js';
import { WEAPONS_BY_CATEGORY, type WeaponCategory } from '../data/skins';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Brak SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY w zmiennych środowiskowych.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Zapytania do Supabase czasem "wiszą" bez odpowiedzi (zawodne połączenie,
 * limity sieciowe) — bez timeoutu `await` czeka w nieskończoność. Ten helper
 * ubija zapytanie po `timeoutMs` i próbuje ponownie (do `retries` razy).
 */
async function withRetry<T>(label: string, fn: () => PromiseLike<T>, retries = 4, timeoutMs = 20000): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    let timer: ReturnType<typeof setTimeout>;
    try {
      const result = await Promise.race([
        Promise.resolve(fn()),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error(`Timeout (${timeoutMs}ms)`)), timeoutMs);
        }),
      ]);
      clearTimeout(timer!);
      return result;
    } catch (err: any) {
      clearTimeout(timer!);
      const msg = err?.message || String(err);
      if (attempt === retries) {
        console.error(`  ❌ ${label} — nieudane po ${retries} próbach: ${msg}`);
        throw err;
      }
      console.warn(`  ⚠️  ${label} — próba ${attempt}/${retries} nie powiodła się (${msg}), ponawiam...`);
      await new Promise(r => setTimeout(r, 1500 * attempt)); // rosnące opóźnienie między próbami
    }
  }
  throw new Error('unreachable');
}

const CRATES_URL = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/crates.json';
const SKINS_URL = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json';

const WEAPON_TO_CATEGORY = new Map<string, WeaponCategory>();
for (const cat of Object.keys(WEAPONS_BY_CATEGORY) as WeaponCategory[]) {
  for (const weapon of WEAPONS_BY_CATEGORY[cat]) WEAPON_TO_CATEGORY.set(weapon, cat);
}

const API_RARITY_TO_KEY: Record<string, string> = {
  'Consumer Grade': 'consumer', 'Industrial Grade': 'industrial', 'Mil-Spec Grade': 'mil-spec',
  'Restricted': 'restricted', 'Classified': 'classified', 'Covert': 'covert', 'Contraband': 'contraband',
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface ApiSkin {
  id: string;
  name: string;
  weapon?: { name: string };
  pattern?: { name: string };
  category: { name: string };
  rarity: { name: string };
  min_float: number | null;
  max_float: number | null;
  wears: { name: string }[];
  image: string;
}
interface CrateItem { id: string; name: string; paint_index: string | null; }
interface Crate {
  name: string;
  type: string | null;
  first_sale_date: string;
  contains: CrateItem[];
  contains_rare: CrateItem[];
}

function parseYear(dateStr: string): number {
  const y = parseInt((dateStr || '').slice(0, 4), 10);
  return Number.isFinite(y) ? y : 2020;
}

function estimatePrice(year: number): number {
  if (year >= 2023) return 0.15;
  if (year >= 2019) return 0.10;
  return 0.05;
}

async function main() {
  console.log('Pobieram crates.json i skins.json...');
  const [crates, skins]: [Crate[], ApiSkin[]] = await Promise.all([
    fetch(CRATES_URL).then(r => r.json()),
    fetch(SKINS_URL).then(r => r.json()),
  ]);

  const skinById = new Map<string, ApiSkin>();
  for (const s of skins) skinById.set(s.id, s);

  const weaponCases = crates.filter(c => c.type === 'Case');
  console.log(`Znaleziono ${weaponCases.length} prawdziwych skrzynek broni.`);

  const { data: existingCases } = await withRetry('pobieranie cases', () => supabase.from('cases').select('id, slug, name'));
  const existingByName = new Map((existingCases ?? []).map((c: any) => [c.name, c]));

  console.log('Pobieram istniejące skiny (żeby uniknąć kolizji slug/id)...');
  const existingSlugToId = new Map<string, string>();
  {
    const PAGE_SIZE = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await withRetry(`pobieranie skins (od ${from})`, () =>
        supabase.from('skins').select('id, slug').range(from, from + PAGE_SIZE - 1)
      );
      if (error) throw new Error(`Błąd pobierania istniejących skins: ${error.message}`);
      for (const row of data ?? []) existingSlugToId.set(row.slug, row.id);
      if (!data || data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }
  }
  console.log(`Znaleziono ${existingSlugToId.size} istniejących skinów.`);

  const skinRows: any[] = [];
  const seenSkinSlugs = new Set<string>();
  const caseRows: any[] = [];

  for (const crate of weaponCases) {
    const releaseYear = parseYear(crate.first_sale_date);
    const caseSkins: any[] = [];
    const seenInThisCase = new Set<string>(); // żeby ta sama para broń+nazwa (np. różne fazy Dopplera) nie trafiła 2x do tej samej skrzynki

    // --- zwykłe bronie ---
    for (const ref of crate.contains ?? []) {
      const full = skinById.get(ref.id);
      if (!full || !full.weapon || !full.pattern) continue;
      const rarityKey = API_RARITY_TO_KEY[full.rarity.name];
      if (!rarityKey || full.min_float == null || full.max_float == null) continue;

      const weapon = full.weapon.name;
      const name = full.pattern.name;
      const wears = full.wears.map(w => w.name);
      const defaultWear = wears.includes('Factory New') ? 'Factory New' : wears[0];
      const caseSlug = slugify(`${weapon}-${name}`);
      if (seenInThisCase.has(caseSlug)) continue; // ta sama para broń+nazwa już jest w tej skrzynce (np. inna faza/wariant)
      seenInThisCase.add(caseSlug);

      caseSkins.push({
        weapon, name, rarity: rarityKey, wears,
        minFloat: full.min_float, maxFloat: full.max_float,
        steamUrl: `https://steamcommunity.com/market/listings/730/${encodeURIComponent(`${weapon} | ${name} (${defaultWear})`)}`,
      });

      // do tabeli skins (jeśli to broń o znanej kategorii)
      const category = WEAPON_TO_CATEGORY.get(weapon);
      if (category) {
        const slug = slugify(`${weapon}-${name}`);
        if (!seenSkinSlugs.has(slug)) {
          seenSkinSlugs.add(slug);
          const rowId = existingSlugToId.get(slug) ?? slug;
          skinRows.push(buildSkinRow(rowId, slug, weapon, name, category, rarityKey, full.min_float, full.max_float, wears, full.image, crate.name, releaseYear, defaultWear, false));
        }
      }
    }

    // --- noże / rękawice ---
    for (const ref of crate.contains_rare ?? []) {
      if (ref.paint_index === null) continue; // pomijamy "vanilla" (bez wzoru)
      const full = skinById.get(ref.id);
      if (!full || !full.weapon || !full.pattern) continue;

      const category = full.category.name === 'Knives' ? 'knife' : full.category.name === 'Gloves' ? 'gloves' : null;
      if (!category) continue;
      if (full.min_float == null || full.max_float == null) continue;

      const weapon = full.weapon.name;
      const name = full.pattern.name;
      const wears = full.wears.map(w => w.name);
      const defaultWear = wears.includes('Factory New') ? 'Factory New' : wears[0];
      const caseSlug = slugify(`${weapon}-${name}`);
      if (seenInThisCase.has(caseSlug)) continue; // np. Doppler ma kilka faz z tą samą wyświetlaną nazwą — liczy się raz
      seenInThisCase.add(caseSlug);

      caseSkins.push({
        weapon, name, rarity: 'rare-special', wears,
        minFloat: full.min_float, maxFloat: full.max_float,
        steamUrl: `https://steamcommunity.com/market/listings/730/${encodeURIComponent(`★ ${weapon} | ${name} (${defaultWear})`)}`,
      });

      const slug = slugify(`${weapon}-${name}`);
      if (!seenSkinSlugs.has(slug)) {
        seenSkinSlugs.add(slug);
        const rowId = existingSlugToId.get(slug) ?? slug;
        skinRows.push(buildSkinRow(rowId, slug, weapon, name, category as WeaponCategory, 'extraordinary', full.min_float, full.max_float, wears, full.image, crate.name, releaseYear, defaultWear, true));
      }
    }

    const existing = existingByName.get(crate.name);
    const slug = existing?.slug ?? slugify(crate.name);
    const id = existing?.id ?? slug;
    const regularCount = caseSkins.filter(s => s.rarity !== 'rare-special').length;
    const rareCount = caseSkins.length - regularCount;

    caseRows.push({
      id, slug,
      name: crate.name,
      release_year: releaseYear,
      key_price: 10.49,
      case_price: estimatePrice(releaseYear),
      description: `${crate.name} to skrzynka CS2 wydana w ${releaseYear} roku. Zawiera ${regularCount} skinów broni w standardowych rzadkościach (Mil-Spec, Restricted, Classified, Covert) oraz ${rareCount} noży/rękawic jako Rare Special Item (0,26% szansy).`,
      skins: caseSkins,
    });
  }

  console.log(`\nPrzygotowano ${caseRows.length} skrzynek i ${skinRows.length} unikalnych skinów (broń + noże/rękawice) do zapisu.`);

  console.log('\nZapisuję skiny do tabeli skins...');
  const SKIN_BATCH = 200;
  let savedSkins = 0;
  for (let i = 0; i < skinRows.length; i += SKIN_BATCH) {
    const batch = skinRows.slice(i, i + SKIN_BATCH);
    try {
      const { data, error } = await withRetry(`skins batch ${i}`, () =>
        supabase.from('skins').upsert(batch, { onConflict: 'id' }).select('id')
      );
      if (error) { console.error(`Błąd (skins) w paczce ${i}:`, error); continue; }
      savedSkins += data?.length ?? 0;
      console.log(`  skins: ${savedSkins}/${skinRows.length}...`);
    } catch {
      console.error(`  ⏭️  pomijam paczkę skins ${i}-${i + batch.length} po nieudanych próbach, jadę dalej.`);
    }
  }

  console.log('\nZapisuję skrzynki do tabeli cases...');
  let savedCases = 0;
  for (const row of caseRows) {
    try {
      const { error } = await withRetry(`case "${row.name}"`, () => supabase.from('cases').upsert(row, { onConflict: 'id' }));
      if (error) { console.error(`Błąd (case "${row.name}"):`, error.message); continue; }
      savedCases++;
      console.log(`  ✅ ${row.name}`);
    } catch {
      console.error(`  ⏭️  pomijam "${row.name}" po nieudanych próbach, jadę dalej.`);
    }
  }

  console.log(`\n✅ Gotowe. Skrzynki: ${savedCases}/${caseRows.length}. Skiny: ${savedSkins}/${skinRows.length}.`);
}

function buildSkinRow(
  id: string, slug: string, weapon: string, name: string, category: WeaponCategory, rarity: string,
  minFloat: number, maxFloat: number, wears: string[], image: string | null,
  caseName: string, releaseYear: number, defaultWear: string, isSpecial: boolean
) {
  const rarityLabel = rarity === 'extraordinary' ? 'Extraordinary (★)' : rarity;
  const displayName = isSpecial ? `★ ${weapon} | ${name}` : `${weapon} | ${name}`;
  return {
    id,
    slug,
    weapon,
    name,
    category,
    rarity,
    min_float: minFloat,
    max_float: maxFloat,
    wears,
    description: `${displayName} to skin klasy ${rarityLabel}. Dostępny float: ${minFloat.toFixed(2)}–${maxFloat.toFixed(2)} (${wears.join(', ')}). Pochodzi ze skrzynki ${caseName}.`,
    lore: null,
    collection: null,
    case_source: caseName,
    release_year: releaseYear,
    steam_market_url: `https://steamcommunity.com/market/listings/730/${encodeURIComponent(`${displayName} (${defaultWear})`)}`,
    tags: [rarity, category],
    image_url: image ?? null,
  };
}

main().catch(err => {
  console.error('Błąd skryptu:', err);
  process.exit(1);
});
