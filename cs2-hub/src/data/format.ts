export function parsePrice(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^0-9,.\-]/g, '').trim();
  if (!cleaned) return null;

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  const decimalIndex = Math.max(lastComma, lastDot);

  if (decimalIndex === -1) {
    const value = parseFloat(cleaned);
    return Number.isFinite(value) ? value : null;
  }

  const integerPart = cleaned.slice(0, decimalIndex).replace(/[,.]/g, '');
  const decimalPart = cleaned.slice(decimalIndex + 1).replace(/[,.]/g, '');
  const value = parseFloat(`${integerPart || '0'}.${decimalPart}`);
  return Number.isFinite(value) ? value : null;
}

export function buildSteamMarketUrl(
  weapon: string,
  name: string,
  wear: string,
  isSpecial: boolean = false
): string {
  const displayName = isSpecial ? `★ ${weapon} | ${name}` : `${weapon} | ${name}`;
  return `https://steamcommunity.com/market/listings/730/${encodeURIComponent(`${displayName} (${wear})`)}`;
}
