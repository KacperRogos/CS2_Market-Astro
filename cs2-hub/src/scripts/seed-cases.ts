/**
 * Jednorazowy / wielokrotny skrypt wgrywający skrzynki z src/data/cases.ts do tabeli Supabase `cases`.
 * Umieszczony w cs2-hub/src/scripts/seed-cases.ts.
 *
 * Użycie (tak samo jak seed-skins.ts):
 *   $env:SUPABASE_URL="https://sacxklpjteqsbevowrmt.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="wklej_tutaj"
 *   npm run seed:cases
 */

import { createClient } from '@supabase/supabase-js';
import { SEED_CASES } from '../data/cases';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Brak SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY w zmiennych środowiskowych.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  const rows = SEED_CASES.map(c => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    release_year: c.releaseYear,
    key_price: c.keyPrice,
    case_price: c.casePrice,
    description: c.description,
    skins: c.skins,
  }));

  const { data, error } = await supabase
    .from('cases')
    .upsert(rows, { onConflict: 'id' })
    .select('id');

  if (error) {
    console.error('Błąd podczas zapisu do Supabase:', error);
    process.exit(1);
  }

  console.log(`✅ Zapisano/zaktualizowano ${data?.length ?? 0} skrzynek w tabeli 'cases'.`);
}

seed();
