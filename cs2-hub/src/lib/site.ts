const RAW_SITE = import.meta.env?.SITE || 'http://localhost:4321';

export const SITE_URL: string = RAW_SITE.replace(/\/+$/, '');

export function absoluteUrl(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
