import { format, isValid, parse } from 'date-fns';

/** Wire format used by the REST API for pet `birthDate` and visit `date` (RFC3339 date, local time). */
export const API_DATE_FORMAT = 'yyyy-MM-dd';

/** Formats a Date as YYYY-MM-DD in LOCAL time (never `toISOString`, which would shift the day in non-UTC zones). */
export function formatApiDate(date: Date): string {
  return format(date, API_DATE_FORMAT);
}

/** Parses a YYYY-MM-DD string as a LOCAL date; returns `undefined` for empty or invalid input. */
export function parseApiDate(value: string | null | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = parse(value.slice(0, API_DATE_FORMAT.length), API_DATE_FORMAT, new Date());
  return isValid(parsed) ? parsed : undefined;
}

/** Returns today's date as YYYY-MM-DD in local time. */
export function todayApiDate(): string {
  return formatApiDate(new Date());
}
