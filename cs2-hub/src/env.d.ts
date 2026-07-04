/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly NETLIFY_BUILD_HOOK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
