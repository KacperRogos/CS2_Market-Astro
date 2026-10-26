# CS2 Trading Hub

Strona internetowa dla traderów skinów CS2: kalkulator skrzynek, baza skinów, tracker portfela, porównywarka cen i poradniki. Zbudowana na Astro, z Supabase jako backendem i wdrożona na Netlify.

Wersja online: [cs2-market.netlify.app](https://cs2-market.netlify.app)

## Spis treści

* [Funkcje](#funkcje)
* [Technologie](#technologie)
* [Struktura](#struktura)
* [Instalacja](#instalacja)
* [Konfiguracja](#konfiguracja)
* [Baza](#baza)
* [Administracja](#administracja)
* [Poradniki](#poradniki)
* [Deploy](#deploy)
* [Testy](#testy)
* [Skrypty](#skrypty)
* [Ograniczenia](#ograniczenia)

## Funkcje

* **Kalkulator skrzynek** (`/kalkulator`): szanse dropu, oczekiwany koszt zdobycia konkretnego skina i oficjalne stawki Valve.
* **Baza skinów** (`/skins`): opisy, zakres floatu, rzadkość oraz wyszukiwarka po nazwie lub broni.
* **Porównywarka** (`/porownaj`): zestawia do 4 skinów obok siebie i pokazuje float, rzadkość, kolekcję oraz cenę na żywo ze Steam Market.
* **Tracker portfela** (`/app`): import ekwipunku, śledzenie wartości portfela, wyszukiwarka skinów, historia wartości dla zalogowanych, tryb demo i AI doradca.
* **Poradniki** (`/poradniki`): artykuły o handlu, inwestowaniu i bezpieczeństwie na rynku CS2, zarządzane z panelu admina.
* **Panel admina** (`/admin`): zarządzanie skinami, skrzynkami, poradnikami i cache obrazków, chronione logowaniem.
* **Analityka i kontakt**: Google Analytics ładuje się dopiero po zgodzie użytkownika (baner zgody działa na całej stronie, razem z `/app`), a formularz kontaktowy wysyła wiadomości przez Formspree.

## Technologie

* **Framework:** [Astro](https://astro.build) (strony statyczne, adapter Netlify)
* **Stylowanie:** Tailwind CSS v4 (`@tailwindcss/vite`)
* **Baza danych i uwierzytelnianie:** [Supabase](https://supabase.com) (Postgres, RLS, Auth, Edge Functions)
* **Hosting:** Netlify (Continuous Deployment z GitHuba, audyt Lighthouse przy każdym deployu)
* **Dane cenowe:** Steam Community Market (nieoficjalne API, przez Supabase Edge Function jako proxy)
* **Testy:** Vitest

## Struktura

```
cs2-hub/
  src/
    components/
      Icon.astro                 wspólny komponent ikon SVG
    data/
      skins.ts                   typy i stałe skinów, dane seedowe
      cases.ts                   typy, drop rates i dane seedowe skrzynek
      guides.ts                  typy poradników, generowanie slugów, kategorie, czas czytania
      portfolio.ts               kategorie przedmiotów i obliczenia wartości portfela
      format.ts                  parsowanie cen i linki do Steam Market
    lib/
      supabase.ts                klient Supabase po stronie serwera (czas builda)
      supabaseBrowser.ts         klient Supabase w przeglądarce (publiczny odczyt)
      adminAuth.ts               wspólna logika logowania panelu admina
      skins.ts                   zapytania do tabeli skins
      cases.ts                   zapytania do tabeli cases
      guides.ts                  zapytania do tabeli guides
    layouts/
      Layout.astro               wspólny layout: nawigacja, stopka, meta tagi, baner zgody, menu mobilne
    pages/
      index.astro                strona główna
      404.astro                  strona błędu 404
      kalkulator/                lista skrzynek i podstrona [slug]
      skins/                     lista skinów i podstrona [slug]
      poradniki.astro            lista poradników
      poradniki/[slug].astro     treść pojedynczego poradnika
      porownaj.astro             porównywarka skinów
      app.astro                  tracker portfela (samodzielny, bez wspólnego Layout)
      sitemap.xml.ts             dynamiczna sitemapa (endpoint, nie strona)
      api/
        rebuild.ts               endpoint uruchamiający Netlify Build Hook
      admin/
        index.astro              strona główna panelu z kartami i przyciskiem rebuildu
        dodaj.astro              formularz dodawania skina
        skiny.astro              lista i usuwanie skinów
        dodaj-skrzynke.astro     formularz dodawania skrzynki
        skrzynki.astro           lista i usuwanie skrzynek
        poradniki.astro          lista poradników, usuwanie
        poradnik-edytor.astro    formularz dodawania i edycji poradnika
        ikonki.astro             cache obrazków przedmiotów
    scripts/
      caseCalculator.ts          logika kalkulatora skrzynek po stronie przeglądarki
      seed i fix oraz diagnose   skrypty jednorazowe i naprawcze dla bazy (patrz sekcja Skrypty)
    styles/
      global.css                 zmienne CSS i wspólne klasy, w tym panel admina
    env.d.ts                     typy zmiennych środowiskowych
  supabase/
    guides_schema.sql            schemat tabeli guides wraz z uprawnieniami (RLS)
  tests/                         testy Vitest
  public/                        favicon, logo, robots.txt, plik weryfikacyjny Google
  astro.config.mjs
  netlify.toml                   komenda builda, nagłówki, redirecty, plugin Lighthouse
  dev.cmd                        uruchamianie netlify dev na Windows
  .env.example                   wzór zmiennych środowiskowych
  package.json
```

## Instalacja

```bash
npm install
cp .env.example .env
npm run dev
```

Po skopiowaniu pliku uzupełnij w `.env` prawdziwe wartości (opis w sekcji Konfiguracja).

Funkcje zależne od Netlify, na przykład Image CDN, wymagają uruchomienia przez `netlify dev` zamiast `npm run dev`. Na Windows użyj pliku `dev.cmd`, który obchodzi znany błąd w narzędziu CLI Netlify.

## Konfiguracja

Zmienne środowiskowe ustawiasz lokalnie w pliku `.env`, a na produkcji w ustawieniach Netlify. Żadne klucze ani adresy nie są zapisane w kodzie.

* `SUPABASE_URL`: adres projektu Supabase, używany po stronie serwera podczas builda.
* `SUPABASE_ANON_KEY`: klucz anon, używany po stronie serwera podczas builda. Jest publiczny z założenia, a dostęp do danych chroni RLS.
* `PUBLIC_SUPABASE_URL`: ta sama wartość co `SUPABASE_URL`, wstrzykiwana do kodu przeglądarki.
* `PUBLIC_SUPABASE_ANON_KEY`: ta sama wartość co `SUPABASE_ANON_KEY`, wstrzykiwana do kodu przeglądarki.
* `PUBLIC_FORMSPREE_ID`: identyfikator formularza kontaktowego w Formspree.
* `PUBLIC_GA_MEASUREMENT_ID`: identyfikator pomiaru Google Analytics 4. Gdy zmiennej brakuje, analityka się nie ładuje.
* `NETLIFY_BUILD_HOOK_URL`: adres Build Hooka, używany przez endpoint `/api/rebuild`. Ustawiaj go tylko w Netlify, nie lokalnie.

Zmienne z przedrostkiem `PUBLIC_` Astro wstawia do zbudowanego kodu, więc są widoczne w przeglądarce. Dotyczy to też klucza anon, który do tego jest przeznaczony.

`SUPABASE_SERVICE_ROLE_KEY` jest potrzebny wyłącznie do skryptów z katalogu `src/scripts`, które zapisują dane do bazy. Podajesz go jednorazowo w terminalu przy uruchamianiu skryptu i nigdy nie trafia on do pliku `.env` używanego przez samą stronę.

## Baza

Główne tabele w Supabase:

* `skins`: dane skinów (nazwa, kategoria, rzadkość, float, opis, link do Steam Market). Odczyt publiczny, zapis tylko dla adminów.
* `cases`: dane skrzynek, a zawartość (lista skinów) jest w kolumnie JSONB. Ten sam model uprawnień.
* `guides`: poradniki (tytuł, adres, kategoria, zajawka, opis, treść HTML, tagi, data, flaga publikacji). Publicznie widać tylko opublikowane, zapisywać mogą admini.
* `admins`: lista `user_id` z uprawnieniami do zapisu (odwołanie do `auth.users`). RLS pozwala użytkownikowi zobaczyć tylko własny wiersz.
* `item_icons`: cache nazwy przedmiotu na adres obrazka, żeby portfel i porównywarka nie musiały za każdym razem pobierać obrazków z zawodnego Steam Community Market.
* `portfolios`: portfele użytkowników trackera, przedmioty zapisane jako JSONB.
* `portfolio_snapshots`: zapisy wartości portfela w czasie, z których powstaje historia w trackerze.
* `profiles`: profile użytkowników trackera (nazwa użytkownika, alias email).
* `demo_pool_skins`: pula skinów używana w trybie demo trackera.

Schemat tabeli `guides` znajduje się w pliku `supabase/guides_schema.sql` i uruchamia się go ręcznie w Supabase SQL Editor. Pozostałe tabele zostały utworzone bezpośrednio w Supabase, a ich definicje nie są częścią tego repozytorium.

Supabase Edge Functions używane przez stronę to `steam-price` (proxy do cen ze Steam Market) oraz `ai-chat` (AI doradca w trackerze). Ich kod nie jest częścią tego repozytorium.

## Administracja

Panel jest dostępny pod `/admin` i chroniony logowaniem Supabase Auth oraz sprawdzeniem członkostwa w tabeli `admins`. Żeby założyć własne konto admina:

1. W Supabase Dashboard otwórz Authentication, potem Users, potem Add user (zaznacz Auto Confirm).
2. Skopiuj wygenerowany UID.
3. W SQL Editor wykonaj: `insert into public.admins (user_id, email) values ('UID', 'twoj@email.com');`

Panel pozwala:

* dodawać i usuwać skiny oraz skrzynki,
* dodawać, edytować i usuwać poradniki,
* zarządzać cache obrazków przedmiotów,
* ręcznie uruchomić rebuild strony na Netlify.

Strona jest statyczna, więc zmiana danych w Supabase nie pojawia się na żywo. Widoczna staje się po nowym buildzie, który uruchomisz przyciskiem w `/admin` albo przez Netlify Build Hook.

## Poradniki

Treść poradników jest przechowywana w tabeli `guides` i zarządzana z panelu admina.

* Lista poradników: `/admin/poradniki` (wyszukiwarka, edycja, usuwanie).
* Dodawanie i edycja: `/admin/poradnik-edytor`. Formularz ma pola: tytuł, adres (slug generowany z tytułu), kategoria, data publikacji, czas czytania, tagi, zajawka na liście, opis (wstęp artykułu i opis dla wyszukiwarek) oraz treść w HTML. Edytor ma pasek skrótów (nagłówki, pogrubienie, lista, link) i podgląd.
* Pole opublikowany pozwala zapisać szkic, który nie jest widoczny na stronie.
* Poradniki można też dodawać bezpośrednio w Supabase Table Editor. Wymagane są pola `slug`, `title`, `category` i `content`, a slug składa się z małych liter, cyfr i myślników.
* Po każdej zmianie uruchom rebuild strony, bo lista, podstrony i sitemapa generują się podczas builda.

Pierwszy import poradników do pustej tabeli wykonuje polecenie `npm run seed:guides` (wymaga `SUPABASE_URL` i `SUPABASE_SERVICE_ROLE_KEY` ustawionych w terminalu).

## Deploy

* **Base directory:** `cs2-hub` (repozytorium ma strukturę zagnieżdżoną, więc jego root nie jest rootem projektu)
* **Build command:** `npm run build`
* **Publish directory:** `dist`
* **Node:** 22 (ustawione w `netlify.toml`)
* **Zmienne środowiskowe:** wszystkie z sekcji Konfiguracja ustaw w Netlify, w Site configuration, w Environment variables.
* Push na gałąź `main` uruchamia automatyczny build, a przy każdym deployu działa audyt Lighthouse.
* Zmiany danych z panelu admina wymagają ręcznego rebuildu: przycisk w `/admin` albo Netlify Build Hook.
* Build pobiera dane z Supabase, więc tabele `skins`, `cases` i `guides` muszą istnieć i zawierać dane przed pierwszym deployem.

## Testy

```bash
npm run test          # jednorazowy przebieg
npm run test:watch    # tryb ciągły
```

Testy Vitest leżą w katalogu `tests` i obejmują obliczenia kalkulatora skrzynek, formatowanie cen, logikę portfela, generowanie slugów oraz kształt danych skinów, skrzynek i poradników.

## Skrypty

```bash
npm run dev                      serwer developerski
npm run build                    build produkcyjny
npm run preview                  podgląd builda lokalnie
npm run test                     testy
npm run seed:skins               import skinów do Supabase
npm run seed:cases               import skrzynek do Supabase
npm run seed:guides              import poradników do Supabase
npm run seed:all-cases           dodanie wszystkich skrzynek CS2 wraz z zawartością
npm run seed:weapons-bulk        masowy import skinów broni z publicznego zbioru danych
npm run seed:case-specials       dodanie noży i rękawic dostępnych w wybranych skrzynkach
npm run expand:case-specials     rozwinięcie wpisów zbiorczych na pełne listy noży i rękawic
npm run sync:missing-case-skins  uzupełnienie brakujących skinów na podstawie zawartości skrzynek
npm run fix:case-contents        naprawa zawartości wybranych skrzynek
npm run fix:key-price            korekta ceny klucza do skrzynek
npm run diagnose:case-links      raport skinów ze skrzynek bez dopasowania w tabeli skins
npm run diagnose:rarity          raport rzadkości skinów
```

Skrypty z przedrostkiem `seed`, `expand`, `sync` i `fix` zapisują dane, więc wymagają `SUPABASE_URL` oraz `SUPABASE_SERVICE_ROLE_KEY` podanych w terminalu. Skrypty `diagnose` tylko czytają dane i działają na kluczu anon.

## Ograniczenia

* **Ceny i obrazki ze Steam Market** pochodzą z nieoficjalnego i nieudokumentowanego API, które bywa zawodne (limity zapytań, tymczasowe błędy). Tabela `item_icons` łagodzi ten problem dla popularnych przedmiotów.
* **Edycja skinów i skrzynek** wymaga obecnie usunięcia i dodania od nowa, bo panel nie ma jeszcze trybu edycji w miejscu. Poradniki można edytować normalnie.
* **Treść poradników** jest zapisana jako HTML. Edytor ma pasek skrótów i podgląd, ale nie jest edytorem wizualnym.
* **Dane są statyczne do następnego builda.** Zmiany w Supabase pojawiają się na stronie dopiero po rebuildzie.
* **Tracker `/app`** nie korzysta ze wspólnego `Layout.astro` i ma własną strukturę HTML, nagłówek oraz stopkę.
* **Schematy tabel (poza `guides`) i kod Edge Functions** nie są częścią repozytorium.
