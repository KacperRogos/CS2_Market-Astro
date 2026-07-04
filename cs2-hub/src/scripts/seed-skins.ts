/**
 * Jednorazowy / wielokrotny skrypt wgrywający skiny z src/data/skins.ts do tabeli Supabase `skins`.
 * Umieszczony w cs2-hub/src/scripts/seed-skins.ts.
 *
 * Użycie:
 *   1. npm install --save-dev tsx   (jednorazowo)
 *   2. Ustaw SUPABASE_SERVICE_ROLE_KEY (Supabase Dashboard > Project Settings > API > service_role)
 *      NIE ten sam co SUPABASE_ANON_KEY z .env — service_role omija RLS i pozwala zapisywać.
 *      W PowerShell:
 *        $env:SUPABASE_URL="https://sacxklpjteqsbevowrmt.supabase.co"
 *        $env:SUPABASE_SERVICE_ROLE_KEY="wklej_tutaj"
 *   3. Uruchom z katalogu cs2-hub:
 *        npm run seed:skins
 *
 * Ten klucz nigdy nie może trafić do .env używanego przez stronę ani do repo.
 */

import { createClient } from '@supabase/supabase-js';
import { SEED_SKINS } from '../data/skins';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Brak SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY w zmiennych środowiskowych.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  const rows = SEED_SKINS.map(s => ({
    id: s.id,
    slug: s.slug,
    weapon: s.weapon,
    name: s.name,
    category: s.category,
    rarity: s.rarity,
    min_float: s.minFloat,
    max_float: s.maxFloat,
    wears: s.wears,
    description: s.description,
    lore: s.lore ?? null,
    collection: s.collection ?? null,
    case_source: s.caseSource ?? null,
    release_year: s.releaseYear,
    steam_market_url: s.steamMarketUrl,
    tags: s.tags,
  }));

  const { data, error } = await supabase
    .from('skins')
    .upsert(rows, { onConflict: 'id' })
    .select('id');

  if (error) {
    console.error('Błąd podczas zapisu do Supabase:', error);
    process.exit(1);
  }

  console.log(`✅ Zapisano/zaktualizowano ${data?.length ?? 0} skinów w tabeli 'skins'.`);
}

seed();
