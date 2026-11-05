export interface Guide {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
  updatedAt: string;
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

export function getRelatedGuides(current: Guide, all: Guide[], limit = 5): Guide[] {
  const currentTags = new Set(current.tags.map(tag => tag.toLowerCase()));

  return all
    .filter(guide => guide.slug !== current.slug)
    .map(guide => ({
      guide,
      score:
        (guide.category === current.category ? 2 : 0) +
        guide.tags.filter(tag => currentTags.has(tag.toLowerCase())).length,
    }))
    .sort((a, b) => b.score - a.score || b.guide.date.localeCompare(a.guide.date))
    .slice(0, limit)
    .map(item => item.guide);
}
