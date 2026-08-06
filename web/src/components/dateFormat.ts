export function parseLegacyDate(value: string): string | null {
  const match = /^(\d{4})[-/](\d{2})[-/](\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(+year, +month - 1, +day));
  if (
    date.getUTCFullYear() !== +year ||
    date.getUTCMonth() !== +month - 1 ||
    date.getUTCDate() !== +day
  ) {
    return null;
  }
  return `${year}-${month}-${day}`;
}

export function formatLegacyDate(value: string): string {
  const iso = parseLegacyDate(value);
  return iso ? iso.replace(/-/g, "/") : value;
}
