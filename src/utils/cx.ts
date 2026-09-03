/** Joins truthy class names (CSS Module classes and parity hook classes). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
