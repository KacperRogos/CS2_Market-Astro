import { supabaseBrowser } from './supabaseBrowser';

export const supabase = supabaseBrowser;

/**
 * Podpina cały ekran logowania (formularz email/hasło) i zabezpiecza treść strony.
 * Wywołaj raz na każdej podstronie /admin/*.
 *
 * @param onReady - wywoływane po pierwszym udanym zalogowaniu / gdy sesja już istnieje.
 *                  Tu wstaw logikę specyficzną dla danej podstrony (np. wczytanie listy skinów).
 */
export function guardAdminPage(onReady: () => void | Promise<void>) {
  const authScreen = document.getElementById('authScreen');
  const content = document.getElementById('adminContent');
  const loginForm = document.getElementById('loginForm') as HTMLFormElement | null;
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');

  if (!authScreen || !content) {
    console.error('guardAdminPage: brak #authScreen lub #adminContent na stronie.');
    return;
  }

  function showLogin() {
    authScreen!.style.display = 'flex';
    content!.style.display = 'none';
  }

  async function showContent() {
    authScreen!.style.display = 'none';
    content!.style.display = 'block';
    await onReady();
  }

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (loginError) loginError.textContent = '';
    const email = (document.getElementById('loginEmail') as HTMLInputElement).value.trim();
    const password = (document.getElementById('loginPassword') as HTMLInputElement).value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (loginError) loginError.textContent = 'Błąd logowania: ' + error.message;
      return;
    }
    await showContent();
  });

  logoutBtn?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    showLogin();
  });

  (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await showContent();
    } else {
      showLogin();
    }
  })();
}
