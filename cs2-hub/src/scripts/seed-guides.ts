import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Brak SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY w zmiennych środowiskowych.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const dataPath = join(dirname(fileURLToPath(import.meta.url)), '_guides_data.json');
const guides = JSON.parse(readFileSync(dataPath, 'utf8'));

async function seed() {
  const { data, error } = await supabase
    .from('guides')
    .upsert(guides, { onConflict: 'slug' })
    .select('slug');

  if (error) {
    console.error('Błąd podczas zapisu do Supabase:', error);
    process.exit(1);
  }

  console.log(`Zapisano lub zaktualizowano ${data?.length ?? 0} poradników w tabeli 'guides'.`);
}

seed();
