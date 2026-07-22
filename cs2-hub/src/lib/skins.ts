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

/** Wszystkie skiny — używane np. w getStaticPaths i na /skins */
export async function getAllSkins(): Promise<SkinEntry[]> {
  const { data, error } = await supabase
    .from('skins')
    .select('*')
    .order('weapon', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Nie udało się pobrać skinów z Supabase: ${error.message}`);
  }
  return (data as SkinRow[]).map(mapRow);
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
  const { data, error } = await supabase
    .from('skins')
    .select('*')
    .eq('category', category);

  if (error) {
    throw new Error(`Nie udało się pobrać skinów kategorii "${category}": ${error.message}`);
  }
  return (data as SkinRow[]).map(mapRow);
}

export async function getSkinsByWeapon(weapon: string): Promise<SkinEntry[]> {
  const { data, error } = await supabase
    .from('skins')
    .select('*')
    .eq('weapon', weapon);

  if (error) {
    throw new Error(`Nie udało się pobrać skinów dla broni "${weapon}": ${error.message}`);
  }
  return (data as SkinRow[]).map(mapRow);
}
