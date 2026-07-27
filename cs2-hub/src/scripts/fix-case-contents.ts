/**
 * Naprawia zawartość 5 skrzynek (Revolution, Recoil, Kilowatt, Fracture,
 * Dreams & Nightmares), których obecna zawartość w bazie nie zgadzała się
 * z prawdziwymi skinami tych skrzynek w CS2 (błędne pary broń+nazwa,
 * np. "AWP | Jawbreaker" zamiast "USP-S | Jawbreaker").
 *
 * Dane w _corrected_cases_data.json zweryfikowane względem publicznego
 * zbioru danych (ByMykel/CSGO-API, poprawnie otagowanego per-crate) oraz
 * krzyżowo sprawdzone przez wyszukiwanie (csgoskins.gg, Steam Market).
 *
 * Co robi:
 *  - Dla każdej z 5 skrzynek PODMIENIA całą listę broni na poprawną.
 *  - Zachowuje istniejący wpis "★ Nóż / Rękawice ..." bez zmian (nie ruszamy
 *    tej części — to osobny mechanizm, nie dotyczy tej naprawy).
 *  - Nie usuwa i nie modyfikuje żadnych innych skrzynek.
 *
 * Po tym skrypcie WSZYSTKIE skiny w tych 5 skrzynkach powinny mieć link
 * "Zobacz w bazie" (bo są to te same skiny, które już mają wiersze w `skins`
 * ze zdjęciami z seed-weapons-bulk.ts — nie trzeba nic dodatkowo dosyłać).
 *
 * Użycie:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx src/scripts/fix-case-contents.ts
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

interface CorrectedSkin {
  weapon: string;
  name: string;
  rarity: 'mil-spec' | 'restricted' | 'classified' | 'covert';
  wears: string[];
  minFloat: number;
  maxFloat: number;
}

const correctedData: Record<string, CorrectedSkin[]> = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_corrected_cases_data.json'), 'utf8')
);

async function main() {
  console.log('Pobieram skrzynki...');
  const { data: cases, error } = await supabase.from('cases').select('name, slug, skins');
  if (error) throw new Error(`Błąd pobierania cases: ${error.message}`);

  for (const caseName of Object.keys(correctedData)) {
    const caseRow = cases?.find(c => c.name === caseName);
    if (!caseRow) {
      console.warn(`⚠️  Nie znaleziono skrzynki "${caseName}" w bazie — pomijam.`);
      continue;
    }

    const existingSkins = (caseRow.skins ?? []) as any[];
    const placeholder = existingSkins.filter(s => s.weapon === '★'); // zachowaj nóż/rękawice bez zmian

    const newSkins = correctedData[caseName].map(s => {
      const defaultWear = s.wears.includes('Factory New') ? 'Factory New' : s.wears[0];
      return {
        weapon: s.weapon,
        name: s.name,
        rarity: s.rarity,
        wears: s.wears,
        minFloat: s.minFloat,
        maxFloat: s.maxFloat,
        steamUrl: `https://steamcommunity.com/market/listings/730/${encodeURIComponent(`${s.weapon} | ${s.name} (${defaultWear})`)}`,
      };
    });

    const finalSkins = [...newSkins, ...placeholder];

    const { error: updateError } = await supabase
      .from('cases')
      .update({ skins: finalSkins })
      .eq('slug', caseRow.slug);

    if (updateError) {
      console.error(`❌ Błąd aktualizacji "${caseName}":`, updateError.message);
      continue;
    }
    console.log(`✅ ${caseName}: podmieniono ${existingSkins.length - placeholder.length} → ${newSkins.length} broni (placeholder nóż/rękawice zachowany: ${placeholder.length}).`);
  }

  console.log('\nGotowe. Odpal teraz jeszcze raz: npm run diagnose:case-links, żeby potwierdzić.');
}

main().catch(err => {
  console.error('Błąd skryptu:', err);
  process.exit(1);
});
