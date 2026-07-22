# CS2 Trading Hub

Strona internetowa dla traderów skinów CS2 — kalkulator skrzynek, baza skinów, tracker portfela, porównywarka i poradniki. Zbudowana na Astro, z Supabase jako backendem i wdrożona na Netlify.

🔗 Live: [cs2-market.netlify.app](https://cs2-market.netlify.app)

---

## Spis treści

- [Funkcje](#funkcje)
- [Stack technologiczny](#stack-technologiczny)
- [Struktura projektu](#struktura-projektu)
- [Instalacja lokalna](#instalacja-lokalna)
- [Zmienne środowiskowe](#zmienne-środowiskowe)
- [Baza danych (Supabase)](#baza-danych-supabase)
- [Panel admina](#panel-admina)
- [Deploy (Netlify)](#deploy-netlify)
- [Skrypty pomocnicze](#skrypty-pomocnicze)
- [Znane ograniczenia](#znane-ograniczenia)

---

## Funkcje

- **Kalkulator skrzynek** (`/kalkulator`) — szanse drop rate, oczekiwany koszt zdobycia konkretnego skina, oficjalne stawki Valve.
- **Baza skinów** (`/skins`) — opisy, float range, rzadkość, wyszukiwarka po nazwie/broni.
- **Porównywarka** (`/porownaj`) — zestawia do 4 skinów obok siebie: float, rzadkość, kolekcja, cena live ze Steam Market.
- **Tracker portfela** (`/app`) — import ekwipunku, śledzenie wartości w czasie, historia, tryb demo, AI doradca.
- **Poradniki** (`/poradniki`) — kilkadziesiąt artykułów o handlu, inwestowaniu i bezpieczeństwie na rynku CS2.
- **Panel admina** (`/admin`) — zarządzanie skinami, skrzynkami i cache'em obrazków, chronione logowaniem.

## Stack technologiczny

| Warstwa | Technologia |
|---|---|
| Framework | [Astro](https://astro.build) (SSG, adapter Netlify) |
| Stylowanie | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Baza danych / Auth | [Supabase](https://supabase.com) (Postgres + RLS + Auth + Edge Functions) |
| Hosting | Netlify (Continuous Deployment z GitHuba) |
| Dane cenowe | Steam Community Market (live, nieoficjalne API, przez Supabase Edge Function jako proxy) |

## Struktura projektu

```
cs2-hub/
├── src/
│   ├── components/
│   │   └── Icon.astro          # wspólny komponent ikon SVG (bez emotek)
│   ├── data/
│   │   ├── skins.ts             # typy, stałe (WEAPON_CATEGORIES, RARITY_MAP), dane seedowe
│   │   └── cases.ts             # typy, drop rates, dane seedowe skrzynek
│   ├── lib/
│   │   ├── supabase.ts          # klient Supabase (server-side, build-time)
│   │   ├── supabaseBrowser.ts   # klient Supabase (browser, publiczny odczyt)
│   │   ├── adminAuth.ts         # wspólna logika logowania panelu admina
│   │   ├── skins.ts             # zapytania do tabeli `skins`
│   │   └── cases.ts             # zapytania do tabeli `cases`
│   ├── layouts/
│   │   └── Layout.astro         # wspólny layout: nav, stopka, meta tagi, mobilne menu
│   ├── pages/
│   │   ├── index.astro          # strona główna
│   │   ├── kalkulator/          # lista + [slug] pojedynczej skrzynki
│   │   ├── skins/                # lista + [slug] pojedynczego skina
│   │   ├── poradniki.astro      # lista poradników
│   │   ├── poradniki/[slug].astro  # treść pojedynczego poradnika
│   │   ├── porownaj.astro       # porównywarka skinów
│   │   ├── app.astro            # tracker portfela (samodzielny, bez wspólnego Layout)
│   │   ├── trending.astro       # placeholder "coming soon"
│   │   ├── sitemap.xml.ts       # dynamiczna sitemapa (endpoint, nie strona)
│   │   ├── api/
│   │   │   └── rebuild.ts       # endpoint triggerujący Netlify Build Hook
│   │   └── admin/               # panel admina (chroniony logowaniem)
│   │       ├── index.astro      # hub z kartami nawigacyjnymi + przycisk rebuild
│   │       ├── dodaj.astro      # formularz dodawania skina
│   │       ├── skiny.astro      # lista + usuwanie skinów
│   │       ├── dodaj-skrzynke.astro  # formularz dodawania skrzynki
│   │       ├── skrzynki.astro   # lista + usuwanie skrzynek
│   │       └── ikonki.astro     # cache obrazków (market_hash_name → icon_url)
│   ├── scripts/
│   │   ├── seed-skins.ts        # jednorazowy import danych seedowych do Supabase
│   │   └── seed-cases.ts        # jw. dla skrzynek
│   ├── styles/
│   │   └── global.css           # zmienne CSS, wspólne klasy (w tym panel admina)
│   └── env.d.ts                 # typy dla zmiennych środowiskowych
├── public/
│   ├── favicon.png / .ico / .webp
│   ├── logo.webp                # zoptymalizowane logo (72×72, ~4KB)
│   └── robots.txt
├── astro.config.mjs
├── netlify.toml                 # build command, publish dir, nagłówki, NODE_VERSION
└── package.json
```

## Instalacja lokalna

```bash
npm install
cp .env.example .env   # i uzupełnij wartości (patrz niżej)
npm run dev
```

> **Uwaga:** jeśli `npm install` rzuca błędem `ERESOLVE`, prawdopodobnie masz starszą wersję `package.json` z nieużywaną zależnością `@astrojs/tailwind` (konflikt z Astro 7). Usuń ją z `package.json` — projekt korzysta wyłącznie z `@tailwindcss/vite`.

## Zmienne środowiskowe

| Zmienna | Gdzie używana | Opis |
|---|---|---|
| `SUPABASE_URL` | server (build-time, Astro frontmatter) | URL projektu Supabase |
| `SUPABASE_ANON_KEY` | server (build-time) | klucz anon, bezpieczny do ujawnienia (chroniony przez RLS) |
| `PUBLIC_SUPABASE_URL` | browser | to samo co wyżej, ale wstrzykiwane do kodu klienckiego |
| `PUBLIC_SUPABASE_ANON_KEY` | browser | jw. |
| `NETLIFY_BUILD_HOOK_URL` | tylko Netlify env (nigdy lokalnie) | URL Build Hooka, używany przez `/api/rebuild` |

Pełny wzorzec w `.env.example`. `SUPABASE_SERVICE_ROLE_KEY` jest potrzebny **tylko** do jednorazowych skryptów seedujących (`npm run seed:skins`, `npm run seed:cases`) — nigdy nie trafia do `.env` używanego przez samą stronę.

## Baza danych (Supabase)

Główne tabele:

- **`skins`** — pełne dane skinów (nazwa, kategoria, rzadkość, float, opis, link do Steam Market). Odczyt publiczny, zapis tylko dla adminów.
- **`cases`** — dane skrzynek, zawartość (lista skinów) jako kolumna JSONB. Ten sam model uprawnień.
- **`admins`** — lista `user_id` z uprawnieniami do zapisu (referencja do `auth.users`). RLS: user widzi tylko swój własny wiersz.
- **`item_icons`** — cache `market_hash_name → icon_url`, żeby portfel i porównywarka nie musiały za każdym razem scrapować (zawodnego) Steam Community Market po obrazek.
- **`portfolios`** — portfele użytkowników trackera (`/app`), items jako JSONB.
- **`profiles`** — profile użytkowników trackera (username, alias e-mail).

Pliki SQL do skonfigurowania schematu (uruchamiane ręcznie w Supabase SQL Editor, w tej kolejności):
`supabase_skins_schema.sql` → `supabase_admin_setup.sql` → `supabase_cases_schema.sql` → `supabase_item_icons_schema.sql`.

## Panel admina

Dostępny pod `/admin`, chroniony logowaniem Supabase Auth + weryfikacją członkostwa w tabeli `admins`. Żeby założyć własne konto admina:

1. Supabase Dashboard → Authentication → Users → Add user (zaznacz Auto Confirm)
2. Skopiuj wygenerowany UID
3. `insert into public.admins (user_id, email) values ('UID', 'twój@email.com');`

Panel pozwala dodawać/usuwać skiny i skrzynki, zarządzać cache'em obrazków oraz ręcznie triggerować rebuild strony na Netlify (bo strona jest statyczna — zmiana danych w Supabase **nie** aktualizuje się na żywo, wymaga nowego builda).

## Deploy (Netlify)

- **Base directory:** `cs2-hub` (repo ma strukturę zagnieżdżoną, root repo ≠ root projektu)
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node:** 22 (ustawione w `netlify.toml`, `[build.environment] NODE_VERSION`)
- Push na branch `main` triggeruje automatyczny build. Zmiany w danych (przez panel admina) wymagają ręcznego rebuildu — przycisk w `/admin` albo Netlify Build Hook.

## Skrypty pomocnicze

```bash
npm run dev           # serwer developerski
npm run build          # build produkcyjny
npm run preview        # podgląd builda lokalnie
npm run seed:skins     # jednorazowy import danych seedowych skinów do Supabase
npm run seed:cases     # jednorazowy import danych seedowych skrzynek do Supabase
```

## Znane ograniczenia

- **Ceny i obrazki ze Steam Market** pochodzą z nieoficjalnego, nieudokumentowanego API — bywa zawodne (rate-limit, tymczasowe błędy). Tabela `item_icons` łagodzi to dla znanych, popularnych przedmiotów.
- **Edycja istniejącego skina/skrzynki** wymaga obecnie usunięcia i dodania od nowa — nie ma trybu edycji w miejscu.
- **Poradniki** są danymi statycznymi wpisanymi w kod (nie w Supabase) — dodanie nowego wymaga edycji trzech miejsc: `poradniki.astro`, `poradniki/[slug].astro` i listy slugów w `sitemap.xml.ts`.
- `/app` (tracker portfela) nie korzysta ze wspólnego `Layout.astro` — ma własny, samodzielny nagłówek i strukturę HTML.
