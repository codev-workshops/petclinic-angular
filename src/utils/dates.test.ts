import { describe, expect, it } from 'vitest';
import { formatApiDate, parseApiDate } from './dates';

describe('dates', () => {
  it('formats a local Date as YYYY-MM-DD without UTC shifting', () => {
    expect(formatApiDate(new Date(2024, 0, 1, 0, 30))).toBe('2024-01-01');
    expect(formatApiDate(new Date(2024, 11, 31, 23, 59))).toBe('2024-12-31');
  });

  it('parses YYYY-MM-DD into a local midnight Date', () => {
    const parsed = parseApiDate('2012-09-04');
    expect(parsed?.getFullYear()).toBe(2012);
    expect(parsed?.getMonth()).toBe(8);
    expect(parsed?.getDate()).toBe(4);
    expect(parsed?.getHours()).toBe(0);
  });

  it('returns undefined for empty or invalid values', () => {
    expect(parseApiDate('')).toBeUndefined();
    expect(parseApiDate(undefined)).toBeUndefined();
    expect(parseApiDate('not-a-date')).toBeUndefined();
  });
});
