/**
 * Uzupełnia brakujące skiny w tabeli `skins` na podstawie danych, które już
 * masz w zawartości skrzynek (`cases.skins`, JSONB) — bez żadnego zewnętrznego
 * źródła. Rozwiązuje sytuację, w której publiczny zbiór danych użyty w
 * seed-weapons-bulk.ts nie miał niektórych nowszych skinów (np. z Kilowatt
 * Case, Recoil Case, Fracture Case, Dreams & Nightmares Case, Revolution Case).
 *
 * Bezpieczne do wielokrotnego odpalania — upsert po id, nie nadpisuje skinów,
 * które już mają pełne dane (obrazek itd.) z bulk-importu, bo pomija te, które
 * już istnieją w tabeli `skins`.
 *
 * Użycie:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx src/scripts/sync-missing-case-skins.ts
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

const WEAPON_TO_CATEGORY = new Map<string, WeaponCategory>();
for (const cat of Object.keys(WEAPONS_BY_CATEGORY) as WeaponCategory[]) {
  for (const weapon of WEAPONS_BY_CATEGORY[cat]) WEAPON_TO_CATEGORY.set(weapon, cat);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Ta sama logika co w /admin/dodaj-skrzynke.astro
function skinRarityFromCase(caseRarity: string): string {
  return caseRarity === 'rare-special' ? 'extraordinary' : caseRarity;
}

const RARITY_LABELS: Record<string, string> = {
  'mil-spec': 'Mil-Spec', 'restricted': 'Restricted', 'classified': 'Classified',
  'covert': 'Covert', 'extraordinary': 'Extraordinary',
};

interface CaseSkin {
  weapon: string;
  name: string;
  rarity: string;
  wears: string[];
  minFloat: number;
  maxFloat: number;
  steamUrl?: string;
}
interface CaseRow {
  name: string;
  slug: string;
  release_year: number;
  skins: CaseSkin[];
}

async function fetchAllSkinSlugs(): Promise<Set<string>> {
  const slugs = new Set<string>();
  const PAGE_SIZE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase.from('skins').select('slug').range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`Błąd pobierania skins: ${error.message}`);
    for (const row of data ?? []) slugs.add(row.slug);
    if (!data || data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return slugs;
}

async function main() {
  console.log('Pobieram skrzynki i istniejące skiny...');
  const [existingSlugs, casesRes] = await Promise.all([
    fetchAllSkinSlugs(),
    supabase.from('cases').select('name, slug, release_year, skins'),
  ]);
  if (casesRes.error) throw new Error(`Błąd pobierania cases: ${casesRes.error.message}`);

  const rowsToInsert: any[] = [];
  const seenInThisRun = new Set<string>();
  let skippedPlaceholder = 0;
  let skippedUnknownWeapon = 0;

  for (const c of (casesRes.data ?? []) as CaseRow[]) {
    for (const s of c.skins ?? []) {
      if (s.weapon === '★') { skippedPlaceholder++; continue; } // nóż/rękawice — placeholder, nie prawdziwy skin
      const slug = slugify(`${s.weapon}-${s.name}`);
      if (existingSlugs.has(slug) || seenInThisRun.has(slug)) continue;

      const category = WEAPON_TO_CATEGORY.get(s.weapon);
      if (!category) { skippedUnknownWeapon++; console.warn(`  pomijam — nieznana broń "${s.weapon}" (${s.name})`); continue; }

      const rarity = skinRarityFromCase(s.rarity);
      const rarityLabel = RARITY_LABELS[rarity] || rarity;
      const defaultWear = s.wears?.includes('Factory New') ? 'Factory New' : s.wears?.[0] || 'Field-Tested';

      seenInThisRun.add(slug);
      rowsToInsert.push({
        id: slug,
        slug,
        weapon: s.weapon,
        name: s.name,
        category,
        rarity,
        min_float: s.minFloat,
        max_float: s.maxFloat,
        wears: s.wears,
        description: `${s.weapon} | ${s.name} to skin klasy ${rarityLabel}. Dostępny float: ${s.minFloat.toFixed(2)}–${s.maxFloat.toFixed(2)} (${(s.wears || []).join(', ')}). Pochodzi ze skrzynki ${c.name}.`,
        lore: null,
        collection: null,
        case_source: c.name,
        release_year: c.release_year,
        steam_market_url: s.steamUrl || `https://steamcommunity.com/market/listings/730/${encodeURIComponent(`${s.weapon} | ${s.name} (${defaultWear})`)}`,
        tags: [rarity],
        image_url: null,
      });
    }
  }

  console.log(`\nDo dodania: ${rowsToInsert.length} skinów.`);
  console.log(`Pominięto (placeholder nóż/rękawice): ${skippedPlaceholder}.`);
  if (skippedUnknownWeapon) console.log(`Pominięto (nieznana broń): ${skippedUnknownWeapon}.`);

  if (rowsToInsert.length === 0) {
    console.log('Nic do zrobienia.');
    return;
  }

  const BATCH = 200;
  let saved = 0;
  for (let i = 0; i < rowsToInsert.length; i += BATCH) {
    const batch = rowsToInsert.slice(i, i + BATCH);
    const { data, error } = await supabase.from('skins').upsert(batch, { onConflict: 'id' }).select('id');
    if (error) {
      console.error(`Błąd w paczce ${i}-${i + batch.length}:`, error);
      process.exit(1);
    }
    saved += data?.length ?? 0;
    console.log(`  zapisano ${saved}/${rowsToInsert.length}...`);
  }

  console.log(`✅ Gotowe. Dodano ${saved} brakujących skinów (bez zdjęcia — to jedyny brak; opis, float, wears, link do Steam są kompletne).`);
}

main().catch(err => {
  console.error('Błąd skryptu:', err);
  process.exit(1);
});
