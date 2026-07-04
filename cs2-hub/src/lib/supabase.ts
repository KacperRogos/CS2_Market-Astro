import { createClient } from '@supabase/supabase-js';

// Zmienne bez prefiksu PUBLIC_ celowo — ten klient jest używany wyłącznie
// we frontmatterze .astro (build-time / server-side), nigdy w kodzie
// wysyłanym do przeglądarki, więc nie trzeba (i nie powinno się) go
// eksponować przez import.meta.env.PUBLIC_*.
const SUPABASE_URL = import.meta.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Brak SUPABASE_URL / SUPABASE_ANON_KEY w zmiennych środowiskowych. Sprawdź plik .env.'
  );
}

// Klucz anon wystarcza — tabela "skins" ma RLS z polityką "select" dla anon.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
