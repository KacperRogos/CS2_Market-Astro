export interface Guide {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
  tags: string[];
  content: string;
  published: boolean;
}

export const DEFAULT_GUIDE_CATEGORIES = [
  'Podstawy',
  'Edukacja',
  'Inwestowanie',
  'Analiza',
  'Platformy',
  'Bezpieczeństwo',
  'Strategia',
  'Prawo',
];

const KNOWN_CATEGORY_KEYS = [
  'podstawy',
  'edukacja',
  'inwestowanie',
  'analiza',
  'platformy',
  'bezpieczenstwo',
  'strategia',
  'prawo',
];

export function guideSlugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function categoryClass(category: string): string {
  const key = guideSlugify(category);
  return `cat-${KNOWN_CATEGORY_KEYS.includes(key) ? key : 'inne'}`;
}

export function estimateReadMinutes(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
