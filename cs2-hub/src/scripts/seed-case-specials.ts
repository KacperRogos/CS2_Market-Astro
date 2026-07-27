/**
 * Dodaje do tabeli `skins` wszystkie noże/rękawice faktycznie dostępne
 * w 5 skrzynkach (Revolution, Recoil, Kilowatt, Fracture, Dreams & Nightmares).
 * Dane zweryfikowane względem publicznego zbioru (ByMykel/CSGO-API) i opisów
 * tych skrzynek (csgoskins.gg, steamdb, swap.gg) — każda z tych skrzynek daje
 * albo tylko noże, albo tylko rękawice (nigdy oba naraz), z jedną wspólną pulą
 * wykończeń (finish) na kilku modelach.
 *
 * W przeciwieństwie do seed-weapons-bulk.ts / sync-missing-case-skins.ts,
 * te wiersze MAJĄ zdjęcie (image_url) — dane źródłowe je zawierały.
 *
 * Użycie:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx src/scripts/seed-case-specials.ts
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Brak SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY w zmiennych środowiskowych.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface SpecialItem {
  weapon: string;
  name: string;
  category: 'knife' | 'gloves';
  rarity: string;
  wears: string[];
  minFloat: number;
  maxFloat: number;
  image: string | null;
}

const data: Record<string, SpecialItem[]> = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_corrected_special_items.json'), 'utf8')
);

// Rok wydania każdej skrzynki (do release_year)
const CASE_YEAR: Record<string, number> = {
  'Revolution Case': 2023,
  'Recoil Case': 2022,
  'Kilowatt Case': 2024,
  'Fracture Case': 2020,
  'Dreams & Nightmares Case': 2022,
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const RARITY_LABELS: Record<string, string> = { extraordinary: 'Extraordinary (★)' };

async function main() {
  const rows: any[] = [];
  const seenSlugs = new Set<string>();

  for (const [caseName, items] of Object.entries(data)) {
    const releaseYear = CASE_YEAR[caseName];
    for (const item of items) {
      const slug = slugify(`${item.weapon}-${item.name}`);
      if (seenSlugs.has(slug)) continue; // ta sama para broń+wzór już dodana (nie powinno się zdarzyć, ale na wszelki wypadek)
      seenSlugs.add(slug);

      const defaultWear = item.wears.includes('Factory New') ? 'Factory New' : item.wears[0];
      const rarityLabel = RARITY_LABELS[item.rarity] || item.rarity;

      rows.push({
        id: slug,
        slug,
        weapon: item.weapon,
        name: item.name,
        category: item.category,
        rarity: item.rarity,
        min_float: item.minFloat,
        max_float: item.maxFloat,
        wears: item.wears,
        description: `★ ${item.weapon} | ${item.name} to rzadki przedmiot specjalny (${rarityLabel}) ze skrzynki ${caseName}. Dostępny float: ${item.minFloat.toFixed(2)}–${item.maxFloat.toFixed(2)} (${item.wears.join(', ')}).`,
        lore: null,
        collection: null,
        case_source: caseName,
        release_year: releaseYear,
        steam_market_url: `https://steamcommunity.com/market/listings/730/${encodeURIComponent(`★ ${item.weapon} | ${item.name} (${defaultWear})`)}`,
        tags: [item.rarity, item.category],
        image_url: item.image ?? null,
      });
    }
  }

  console.log(`Przygotowano ${rows.length} noży/rękawic do zapisu.`);

  const BATCH = 100;
  let saved = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { data: res, error } = await supabase.from('skins').upsert(batch, { onConflict: 'id' }).select('id');
    if (error) {
      console.error(`Błąd w paczce ${i}-${i + batch.length}:`, error);
      process.exit(1);
    }
    saved += res?.length ?? 0;
    console.log(`  zapisano ${saved}/${rows.length}...`);
  }

  console.log(`✅ Gotowe. Dodano ${saved} noży/rękawic ze zdjęciami.`);
}

main().catch(err => {
  console.error('Błąd skryptu:', err);
  process.exit(1);
});
