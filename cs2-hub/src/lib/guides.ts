import { supabase } from './supabase';
import type { Guide } from '../data/guides';

interface GuideRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  category: string;
  read_time: string;
  published_at: string;
  updated_at: string | null;
  tags: string[] | null;
  content: string;
  published: boolean;
}

function mapRow(row: GuideRow): Guide {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || row.description,
    description: row.description || row.excerpt,
    category: row.category,
    readTime: row.read_time,
    date: row.published_at,
    updatedAt: (row.updated_at ?? row.published_at).slice(0, 10),
    tags: row.tags ?? [],
    content: row.content,
    published: row.published,
  };
}

export async function getAllGuides(): Promise<Guide[]> {
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Nie udało się pobrać poradników z Supabase: ${error.message}`);
  }
  return (data as GuideRow[]).map(mapRow);
}
