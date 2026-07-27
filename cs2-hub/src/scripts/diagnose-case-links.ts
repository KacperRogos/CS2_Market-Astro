/**
 * Diagnostyka: dla każdej skrzynki sprawdza, które skiny z jej zawartości (JSONB)
 * NIE mają dopasowania w tabeli `skins` (czyli nie dostaną linku "Zobacz w bazie").
 *
 * Tylko odczyt — bezpieczne, można odpalać ile razy chcesz. Używa klucza anon
 * (publiczny odczyt), nie trzeba service_role.
 *
 * Użycie:
 *   SUPABASE_URL=... PUBLIC_SUPABASE_ANON_KEY=... npx tsx src/scripts/diagnose-case-links.ts
 * (albo ustaw też jako PUBLIC_SUPABASE_URL — skrypt sprawdza oba warianty nazw)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Brak SUPABASE_URL / SUPABASE_ANON_KEY (lub wariantów PUBLIC_...) w zmiennych środowiskowych.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchAllSkinSlugs(): Promise<Set<string>> {
  const slugs = new Set<string>();
  const PAGE_SIZE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase.from('skins').select('slug, weapon, name').range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`Błąd pobierania skins: ${error.message}`);
    for (const row of data ?? []) slugs.add(row.slug);
    if (!data || data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return slugs;
}

async function main() {
  console.log('Pobieram skiny i skrzynki...');
  const [skinSlugs, casesRes] = await Promise.all([
    fetchAllSkinSlugs(),
    supabase.from('cases').select('name, slug, skins'),
  ]);

  if (casesRes.error) throw new Error(`Błąd pobierania cases: ${casesRes.error.message}`);
  console.log(`W tabeli 'skins': ${skinSlugs.size} wierszy.`);
  console.log(`Skrzynek: ${casesRes.data?.length ?? 0}.\n`);

  let totalCaseSkins = 0;
  let totalMatched = 0;
  const missingByCase: Record<string, { weapon: string; name: string; computedSlug: string; rarity: string }[]> = {};

  for (const c of casesRes.data ?? []) {
    const skins = (c.skins ?? []) as { weapon: string; name: string; rarity: string }[];
    for (const s of skins) {
      totalCaseSkins++;
      const computedSlug = slugify(`${s.weapon}-${s.name}`);
      if (skinSlugs.has(computedSlug)) {
        totalMatched++;
      } else {
        (missingByCase[c.name] ??= []).push({ weapon: s.weapon, name: s.name, computedSlug, rarity: s.rarity });
      }
    }
  }

  console.log(`Dopasowano: ${totalMatched}/${totalCaseSkins} skinów ze skrzynek.\n`);
  console.log('--- BRAKUJĄCE DOPASOWANIA (pogrupowane po skrzynce) ---\n');

  for (const [caseName, items] of Object.entries(missingByCase)) {
    console.log(`\n${caseName} (${items.length} brakujących):`);
    for (const item of items) {
      console.log(`  [${item.rarity}] "${item.weapon}" | "${item.name}"  ->  szukany slug: ${item.computedSlug}`);
    }
  }

  if (Object.keys(missingByCase).length === 0) {
    console.log('Wszystko dopasowane — brak problemów.');
  }
}

main().catch(err => {
  console.error('Błąd skryptu:', err);
  process.exit(1);
});
