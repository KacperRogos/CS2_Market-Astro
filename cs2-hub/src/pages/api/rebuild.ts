export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (!token) {
    return new Response(JSON.stringify({ error: 'Brak tokenu sesji.' }), { status: 401 });
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Nieprawidłowa lub wygasła sesja.' }), { status: 401 });
  }

  const { data: adminRow } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!adminRow) {
    return new Response(JSON.stringify({ error: 'To konto nie ma uprawnień admina.' }), { status: 403 });
  }

  const hookUrl = import.meta.env.NETLIFY_BUILD_HOOK_URL;
  if (!hookUrl) {
    return new Response(
      JSON.stringify({ error: 'Brak NETLIFY_BUILD_HOOK_URL w zmiennych środowiskowych.' }),
      { status: 500 }
    );
  }

  const res = await fetch(hookUrl, { method: 'POST' });
  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: `Netlify odrzucił żądanie rebuildu (status ${res.status}).` }),
      { status: 502 }
    );
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
