create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  description text not null default '',
  category text not null default 'Podstawy',
  read_time text not null default '5 min',
  published_at date not null default current_date,
  tags text[] not null default '{}',
  content text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.guides_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists guides_updated_at on public.guides;
create trigger guides_updated_at
  before update on public.guides
  for each row execute function public.guides_set_updated_at();

alter table public.guides enable row level security;

drop policy if exists "guides public read published" on public.guides;
create policy "guides public read published"
  on public.guides for select
  using (published = true);

drop policy if exists "guides admin read all" on public.guides;
create policy "guides admin read all"
  on public.guides for select
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "guides admin insert" on public.guides;
create policy "guides admin insert"
  on public.guides for insert
  to authenticated
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "guides admin update" on public.guides;
create policy "guides admin update"
  on public.guides for update
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "guides admin delete" on public.guides;
create policy "guides admin delete"
  on public.guides for delete
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create index if not exists guides_published_at_idx on public.guides (published_at desc);
