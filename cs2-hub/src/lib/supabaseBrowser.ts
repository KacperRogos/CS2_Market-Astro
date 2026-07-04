import { createClient } from '@supabase/supabase-js';

// Prefiks PUBLIC_ jest tu wymagany — Vite/Astro wstrzykuje do kodu wysyłanego
// do przeglądarki tylko zmienne zaczynające się od PUBLIC_. To jest bezpieczne,
// bo to i tak jest klucz "anon" (publiczny) — realna ochrona to RLS w Supabase,
// nie ukrywanie tego klucza.
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Brak PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY w .env (potrzebne dla panelu admina).'
  );
}

export const supabaseBrowser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
