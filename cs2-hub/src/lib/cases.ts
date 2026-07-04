import { supabase } from './supabase';
import type { Case, Skin } from '../data/cases';

interface CaseRow {
  id: string;
  slug: string;
  name: string;
  release_year: number;
  key_price: number;
  case_price: number;
  description: string;
  skins: Skin[]; // jsonb -> Supabase zwraca to już jako sparsowany obiekt/tablicę JS
}

function mapRow(row: CaseRow): Case {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    releaseYear: row.release_year,
    keyPrice: row.key_price,
    casePrice: row.case_price,
    description: row.description,
    skins: row.skins,
  };
}

/** Wszystkie skrzynki — używane np. w getStaticPaths, /, /kalkulator */
export async function getAllCases(): Promise<Case[]> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('release_year', { ascending: false });

  if (error) {
    throw new Error(`Nie udało się pobrać skrzynek z Supabase: ${error.message}`);
  }
  return (data as CaseRow[]).map(mapRow);
}

export async function getCaseBySlug(slug: string): Promise<Case | undefined> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Nie udało się pobrać skrzynki "${slug}" z Supabase: ${error.message}`);
  }
  return data ? mapRow(data as CaseRow) : undefined;
}
