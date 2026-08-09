import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Brak SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY w zmiennych środowiskowych.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const CORRECT_KEY_PRICE = 9.50;

async function main() {
  const { data, error } = await supabase
    .from('cases')
    .update({ key_price: CORRECT_KEY_PRICE })
    .neq('id', '')
    .select('id');

  if (error) {
    console.error('Błąd aktualizacji:', error.message);
    process.exit(1);
  }

  console.log(`Zaktualizowano cenę klucza na ${CORRECT_KEY_PRICE} zł dla ${data?.length ?? 0} skrzynek.`);
}

main();
