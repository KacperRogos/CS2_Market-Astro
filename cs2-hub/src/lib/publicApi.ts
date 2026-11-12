export interface SelectOptions {
  filters?: Record<string, string>;
  or?: string;
  order?: Array<[string, 'asc' | 'desc']>;
  limit?: number;
  offset?: number;
}

export interface SelectResult<T> {
  data: T[] | null;
  error: Error | null;
}

export function sanitizeSearch(value: string): string {
  return value.replace(/[,()*"\\%]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function ilikeAny(columns: string[], value: string): string | null {
  const clean = sanitizeSearch(value);
  if (!clean) return null;
  return `(${columns.map(column => `${column}.ilike.*${clean}*`).join(',')})`;
}

export function buildSelectUrl(baseUrl: string, table: string, options: SelectOptions = {}): string {
  const params: string[] = ['select=*'];

  for (const [column, condition] of Object.entries(options.filters ?? {})) {
    params.push(`${encodeURIComponent(column)}=${encodeURIComponent(condition)}`);
  }
  if (options.or) params.push(`or=${encodeURIComponent(options.or)}`);
  if (options.order?.length) {
    params.push(`order=${encodeURIComponent(options.order.map(([column, direction]) => `${column}.${direction}`).join(','))}`);
  }
  if (options.limit !== undefined) params.push(`limit=${options.limit}`);
  if (options.offset) params.push(`offset=${options.offset}`);

  return `${baseUrl.replace(/\/+$/, '')}/rest/v1/${table}?${params.join('&')}`;
}

export async function selectRows<T = Record<string, any>>(
  table: string,
  options: SelectOptions = {}
): Promise<SelectResult<T>> {
  const baseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  try {
    const response = await fetch(buildSelectUrl(baseUrl, table, options), {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
    });
    if (!response.ok) {
      return { data: null, error: new Error(`Supabase odpowiedział kodem ${response.status}`) };
    }
    return { data: (await response.json()) as T[], error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
