/**
 * Podmienia w każdej z 5 skrzynek pojedynczy wpis placeholder
 * "★ Nóż / Rękawice [Nazwa]" na PEŁNĄ listę realnie dostępnych w niej
 * noży/rękawic (każdy jako osobna pozycja — dokładnie tyle, ile faktycznie
 * można z niej wylosować).
 *
 * Wymaga wcześniejszego uruchomienia seed-case-specials.ts (żeby te noże/
 * rękawice miały już wiersze w tabeli `skins` i linki "Zobacz w bazie"
 * od razu działały).
 *
 * Użycie:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx src/scripts/expand-case-specials.ts
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
}

const data: Record<string, SpecialItem[]> = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_corrected_special_items.json'), 'utf8')
);

async function main() {
  console.log('Pobieram skrzynki...');
  const { data: cases, error } = await supabase.from('cases').select('name, slug, skins');
  if (error) throw new Error(`Błąd pobierania cases: ${error.message}`);

  for (const [caseName, items] of Object.entries(data)) {
    const caseRow = cases?.find(c => c.name === caseName);
    if (!caseRow) {
      console.warn(`⚠️  Nie znaleziono skrzynki "${caseName}" — pomijam.`);
      continue;
    }

    const existingSkins = (caseRow.skins ?? []) as any[];
    const regularSkins = existingSkins.filter(s => s.weapon !== '★'); // wszystko oprócz starego placeholdera

    const specials = items.map(item => {
      const defaultWear = item.wears.includes('Factory New') ? 'Factory New' : item.wears[0];
      return {
        weapon: item.weapon,
        name: item.name,
        rarity: 'rare-special',
        wears: item.wears,
        minFloat: item.minFloat,
        maxFloat: item.maxFloat,
        steamUrl: `https://steamcommunity.com/market/listings/730/${encodeURIComponent(`★ ${item.weapon} | ${item.name} (${defaultWear})`)}`,
      };
    });

    const finalSkins = [...regularSkins, ...specials];

    const { error: updateError } = await supabase
      .from('cases')
      .update({ skins: finalSkins })
      .eq('slug', caseRow.slug);

    if (updateError) {
      console.error(`❌ Błąd aktualizacji "${caseName}":`, updateError.message);
      continue;
    }
    console.log(`✅ ${caseName}: placeholder → ${specials.length} realnych noży/rękawic (np. ${specials[0]?.weapon} | ${specials[0]?.name}).`);
  }

  console.log('\nGotowe. Odpal npm run diagnose:case-links, żeby potwierdzić.');
}

main().catch(err => {
  console.error('Błąd skryptu:', err);
  process.exit(1);
});
