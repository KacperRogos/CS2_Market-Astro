import { supabase } from './supabase';
import type { SkinEntry, WeaponCategory } from '../data/skins';

// Wiersz zwracany przez Supabase (snake_case, zgodnie ze schematem SQL)
interface SkinRow {
  id: string;
  slug: string;
  weapon: string;
  name: string;
  category: WeaponCategory;
  rarity: SkinEntry['rarity'];
  min_float: number;
  max_float: number;
  wears: string[];
  description: string;
  lore: string | null;
  collection: string | null;
  case_source: string | null;
  release_year: number;
  steam_market_url: string;
  tags: string[];
  image_url: string | null;
}

function mapRow(row: SkinRow): SkinEntry {
  return {
    id: row.id,
    slug: row.slug,
    weapon: row.weapon,
    name: row.name,
    category: row.category,
    rarity: row.rarity,
    minFloat: row.min_float,
    maxFloat: row.max_float,
    wears: row.wears,
    description: row.description,
    lore: row.lore ?? '',
    collection: row.collection ?? undefined,
    caseSource: row.case_source ?? undefined,
    releaseYear: row.release_year,
    steamMarketUrl: row.steam_market_url,
    tags: row.tags,
    imageUrl: row.image_url ?? undefined,
  };
}

const PAGE_SIZE = 1000; // domyślny limit wierszy na request w Supabase/PostgREST

/**
 * Pobiera WSZYSTKIE wiersze z tabeli `skins` pasujące do danego filtra,
 * omijając domyślny limit 1000 wierszy na jedno zapytanie (Supabase/PostgREST
 * zwraca maks. 1000 rekordów per request niezależnie od tego, ile ich jest
 * w tabeli — trzeba to obejść paginacją przez `.range()`).
 */
async function fetchAllRows(applyFilter?: (q: any) => any): Promise<SkinRow[]> {
  const rows: SkinRow[] = [];
  let from = 0;
  while (true) {
    let query = supabase
      .from('skins')
      .select('*')
      .order('weapon', { ascending: true })
      .order('name', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (applyFilter) query = applyFilter(query);

    const { data, error } = await query;
    if (error) {
      throw new Error(`Nie udało się pobrać skinów z Supabase: ${error.message}`);
    }
    const page = (data ?? []) as SkinRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break; // ostatnia strona
    from += PAGE_SIZE;
  }
  return rows;
}

/** Wszystkie skiny — używane np. w getStaticPaths i na /skins */
export async function getAllSkins(): Promise<SkinEntry[]> {
  const rows = await fetchAllRows();
  return rows.map(mapRow);
}

export async function getSkinBySlug(slug: string): Promise<SkinEntry | undefined> {
  const { data, error } = await supabase
    .from('skins')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Nie udało się pobrać skina "${slug}" z Supabase: ${error.message}`);
  }
  return data ? mapRow(data as SkinRow) : undefined;
}

export async function getSkinsByCategory(category: WeaponCategory): Promise<SkinEntry[]> {
  const rows = await fetchAllRows(q => q.eq('category', category));
  return rows.map(mapRow);
}

export async function getSkinsByWeapon(weapon: string): Promise<SkinEntry[]> {
  const rows = await fetchAllRows(q => q.eq('weapon', weapon));
  return rows.map(mapRow);
}

export interface SkinsPageFilter {
  category?: WeaponCategory | null;
  rarity?: string | null;
  search?: string | null;
}

/** Jedna "strona" skinów — do infinite scroll na /skins (build-time i client-side). */
export async function getSkinsPage(filter: SkinsPageFilter, from: number, to: number): Promise<SkinEntry[]> {
  let query = supabase
    .from('skins')
    .select('*')
    .order('weapon', { ascending: true })
    .order('name', { ascending: true })
    .range(from, to);

  if (filter.category) query = query.eq('category', filter.category);
  if (filter.rarity) query = query.eq('rarity', filter.rarity);
  if (filter.search) {
    const q = filter.search.trim();
    query = query.or(`weapon.ilike.%${q}%,name.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Nie udało się pobrać strony skinów: ${error.message}`);
  return (data as SkinRow[]).map(mapRow);
}

/** Liczba skinów łącznie i w podziale na kategorie — do etykiet filtrów. */
export async function getSkinCounts(): Promise<{ total: number; byCategory: Record<string, number> }> {
  const categories: WeaponCategory[] = ['rifle', 'pistol', 'smg', 'sniper', 'shotgun', 'heavy', 'equipment', 'knife', 'gloves'];
  const { count: total, error: totalError } = await supabase
    .from('skins').select('*', { count: 'exact', head: true });
  if (totalError) throw new Error(`Nie udało się policzyć skinów: ${totalError.message}`);

  const byCategory: Record<string, number> = {};
  await Promise.all(categories.map(async cat => {
    const { count, error } = await supabase
      .from('skins').select('*', { count: 'exact', head: true }).eq('category', cat);
    if (error) throw new Error(`Nie udało się policzyć skinów kategorii "${cat}": ${error.message}`);
    if (count) byCategory[cat] = count;
  }));

  return { total: total ?? 0, byCategory };
}
