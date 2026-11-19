-- Dzienna historia cen przedmiotów w portfelu, per user.
-- Zastępuje kruche śledzenie "snapshotPrice/snapshotDate" trzymane w samym
-- obiekcie przedmiotu (localStorage + kolumna portfolios.items) — tamto
-- aktualizowało się tylko wtedy, gdy przeglądarka akurat tego dnia udanie
-- odświeżyła cenę. Tu cena dnia jest jedna wartość per (user, przedmiot,
-- dzień), niezależnie od tego ile razy i kiedy w ciągu dnia się odświeży.

create table if not exists public.portfolio_item_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_name text not null,
  price numeric not null,
  snapshot_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_name, snapshot_date)
);

create index if not exists portfolio_item_snapshots_user_date_idx
  on public.portfolio_item_snapshots (user_id, snapshot_date);

alter table public.portfolio_item_snapshots enable row level security;

create policy "portfolio item snapshots select own"
  on public.portfolio_item_snapshots for select
  to authenticated
  using (auth.uid() = user_id);

create policy "portfolio item snapshots insert own"
  on public.portfolio_item_snapshots for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "portfolio item snapshots update own"
  on public.portfolio_item_snapshots for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Porządkowanie starych wierszy: trzymamy tylko ostatnie 30 dni historii per user.
-- Bez tego tabela rośnie bez końca (1 wiersz / przedmiot / dzień / user).
-- Odpalać okresowo (np. ręcznie albo przez pg_cron, jeśli masz go włączonego).
-- delete from public.portfolio_item_snapshots where snapshot_date < current_date - interval '30 days';
