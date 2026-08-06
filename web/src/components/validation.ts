export type ErrorKind =
  | "required"
  | "minlength"
  | "maxlength"
  | "pattern"
  | "date";

export interface FieldRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  date?: boolean;
}

export function validateField(value: unknown, rules: FieldRules): ErrorKind[] {
  const errors: ErrorKind[] = [];
  const empty =
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);
  if (rules.required && empty) errors.push("required");
  if (typeof value !== "string") return errors;
  if (rules.minLength !== undefined && value.length < rules.minLength) {
    if (!empty) errors.push("minlength");
  }
  if (rules.maxLength !== undefined && value.length > rules.maxLength) {
    errors.push("maxlength");
  }
  if (rules.pattern && !empty) {
    try {
      if (!new RegExp(`^(?:${rules.pattern})$`).test(value)) {
        errors.push("pattern");
      }
    } catch {
      errors.push("pattern");
    }
  }
  if (rules.date && !empty) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      errors.push("date");
    } else {
      const date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
      if (
        date.getUTCFullYear() !== +match[1] ||
        date.getUTCMonth() !== +match[2] - 1 ||
        date.getUTCDate() !== +match[3]
      ) {
        errors.push("date");
      }
    }
  }
  return errors;
}
