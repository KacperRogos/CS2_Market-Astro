import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Brak SUPABASE_URL / SUPABASE_ANON_KEY (lub wariantów PUBLIC_...) w zmiennych środowiskowych.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const VALID_RARITIES = new Set([
  'consumer', 'industrial', 'mil-spec', 'restricted', 'classified', 'covert', 'contraband', 'extraordinary',
]);

async function fetchAll() {
  const rows: any[] = [];
  const PAGE_SIZE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase.from('skins').select('id, weapon, name, rarity').range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

async function main() {
  console.log('Pobieram skiny...');
  const rows = await fetchAll();
  console.log(`Razem: ${rows.length}.\n`);

  const bad = rows.filter(r => !VALID_RARITIES.has(r.rarity));
  console.log(`Skiny z nieprawidłową wartością rarity: ${bad.length}\n`);

  const counts: Record<string, number> = {};
  for (const r of bad) counts[r.rarity] = (counts[r.rarity] ?? 0) + 1;
  console.log('Wartości i ich liczba:');
  for (const [val, count] of Object.entries(counts)) console.log(`  "${val}" -> ${count}`);

  console.log('\nPrzykłady:');
  for (const r of bad.slice(0, 20)) console.log(`  ${r.id} | ${r.weapon} | ${r.name} | rarity="${r.rarity}"`);
}

main().catch(err => {
  console.error('Błąd skryptu:', err);
  process.exit(1);
});
