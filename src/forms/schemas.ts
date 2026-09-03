import { z } from 'zod';

/**
 * Single source of truth for form validation. Every rule is a transcription of the
 * Angular template validators (`required`, `minlength`, `maxlength`, `pattern`) that the
 * parity suite still asserts, including two Angular quirks:
 *   - `minlength` / `maxlength` / `pattern` PASS on an empty value; only `required` fires.
 *   - several rules can fail at once and each one shows its own message, in template order.
 * Messages are the exact strings of the Angular templates (spelling included).
 */

export type RuleKind = 'required' | 'minlength' | 'maxlength' | 'pattern';

export interface FieldIssue {
  kind: RuleKind;
  message: string;
}

export interface TextRules {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  /** Message per rule; a rule without a message is not checked. Key order = display order. */
  messages: Partial<Record<RuleKind, string>>;
}

export type TextSchema = z.ZodEffects<z.ZodString, string, string>;

/** Builds a string schema with Angular validator semantics (see file comment). */
export function textField(rules: TextRules): TextSchema {
  const failing = (value: string): Set<RuleKind> => {
    const failed = new Set<RuleKind>();
    if (value.length === 0) {
      failed.add('required');
      return failed;
    }
    if (rules.minLength !== undefined && value.length < rules.minLength) failed.add('minlength');
    if (rules.maxLength !== undefined && value.length > rules.maxLength) failed.add('maxlength');
    if (rules.pattern && !rules.pattern.test(value)) failed.add('pattern');
    return failed;
  };
  return z.string().superRefine((value, ctx) => {
    const failed = failing(value);
    for (const [kind, message] of Object.entries(rules.messages) as [RuleKind, string][]) {
      if (failed.has(kind)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message, params: { kind } });
      }
    }
  });
}

/** Runs a text schema and returns its issues in declaration order. */
export function fieldIssues(schema: TextSchema, value: string): FieldIssue[] {
  const result = schema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    kind: (issue.code === z.ZodIssueCode.custom ? (issue.params as { kind: RuleKind }).kind : 'required') as RuleKind,
    message: issue.message,
  }));
}

/** A value fails the field when the schema reports at least one issue. */
export function isFieldValid(schema: TextSchema, value: string): boolean {
  return schema.safeParse(value).success;
}

// ---------------------------------------------------------------------------
// Owner (owner-add / owner-edit templates)
// ---------------------------------------------------------------------------

const LETTERS_ONLY = /^[a-zA-Z]*$/;
const DIGITS_ONLY = /^[0-9]*$/;

export const ownerSchema = z.object({
  firstName: textField({
    minLength: 1,
    maxLength: 30,
    pattern: LETTERS_ONLY,
    messages: {
      required: 'First name is required',
      minlength: 'First name must be at least 1 characters long',
      maxlength: 'First name may be at most 30 characters long',
      pattern: 'First name must consist of letters only',
    },
  }),
  lastName: textField({
    minLength: 1,
    maxLength: 30,
    pattern: LETTERS_ONLY,
    messages: {
      required: 'Last name is required',
      minlength: 'Last name must be at least 1 characters long',
      maxlength: 'Last name may be at most 30 characters long',
      pattern: 'Last name must consist of letters only',
    },
  }),
  address: textField({
    maxLength: 255,
    messages: { required: 'Address is required', maxlength: 'Address may be at most 255 characters long' },
  }),
  city: textField({
    maxLength: 80,
    messages: { required: 'City is required', maxlength: 'City may be at most 80 characters long' },
  }),
  telephone: textField({
    minLength: 1,
    maxLength: 20,
    pattern: DIGITS_ONLY,
    messages: {
      required: 'Phone number is required',
      minlength: 'Phone number must be at least one digit long',
      maxlength: 'Phone number cannot be more than 20 digits long',
      pattern: 'Phone number only accept digits',
    },
  }),
});

export type OwnerFormValues = z.infer<typeof ownerSchema>;
export type OwnerFieldName = keyof OwnerFormValues;
export const OWNER_FIELD_ORDER: OwnerFieldName[] = ['firstName', 'lastName', 'address', 'city', 'telephone'];
export const OWNER_LABELS: Record<OwnerFieldName, string> = {
  firstName: 'First Name',
  lastName: 'Last Name',
  address: 'Address',
  city: 'City',
  telephone: 'Telephone',
};

// ---------------------------------------------------------------------------
// Pet (pet-add / pet-edit templates)
// ---------------------------------------------------------------------------

export const petNameSchema = textField({
  minLength: 1,
  maxLength: 30,
  pattern: /^[A-Za-z0-9].{0,29}$/,
  messages: {
    required: 'Name is required',
    minlength: 'Name must be at least 1 character long',
    maxlength: 'Name may be at most 30 character long',
    pattern: 'Name must begin with a letter',
  },
});

export const petSchema = z.object({
  name: petNameSchema,
  birthDate: textField({ messages: { required: 'BirthDate is required' } }),
  typeId: textField({ messages: { required: 'pettype is required' } }),
});

export type PetFormValues = z.infer<typeof petSchema>;

// ---------------------------------------------------------------------------
// Visit (visit-add / visit-edit templates)
// ---------------------------------------------------------------------------

export const visitSchema = z.object({
  date: textField({ messages: { required: 'Date is required' } }),
  description: textField({
    minLength: 1,
    maxLength: 255,
    messages: {
      required: 'Description is required',
      minlength: 'Description must be at least 1 characters long',
      maxlength: 'Description may be at most 255 characters long',
    },
  }),
});

export type VisitFormValues = z.infer<typeof visitSchema>;

// ---------------------------------------------------------------------------
// Vet (vet-add / vet-edit templates)
// ---------------------------------------------------------------------------

export const VET_NAME_MIN_LENGTH = 1;
export const VET_NAME_MAX_LENGTH = 30;

/**
 * vet-add says "First name is required", vet-edit "First Name is required", hence the
 * separate `requiredLabel`. Message order follows the templates: maxlength, minlength,
 * pattern, required.
 */
export function vetNameSchema(label: string, requiredLabel: string): TextSchema {
  return textField({
    minLength: VET_NAME_MIN_LENGTH,
    maxLength: VET_NAME_MAX_LENGTH,
    pattern: /^[A-Za-z]*$/,
    messages: {
      maxlength: `${label} may be only ${VET_NAME_MAX_LENGTH} characters long`,
      minlength: `${label} must be at least ${VET_NAME_MIN_LENGTH} characters long`,
      pattern: `${label} may only consist of letters`,
      required: `${requiredLabel} is required`,
    },
  });
}

export function vetSchema(variant: 'add' | 'edit') {
  const isAdd = variant === 'add';
  return z.object({
    firstName: vetNameSchema('First Name', isAdd ? 'First name' : 'First Name'),
    lastName: vetNameSchema('Last Name', isAdd ? 'Last name' : 'Last Name'),
  });
}

export type VetNameValues = z.infer<ReturnType<typeof vetSchema>>;

// ---------------------------------------------------------------------------
// Pet type (pettype-add / pettype-edit templates)
// ---------------------------------------------------------------------------

export const PETTYPE_NAME_MAX_LENGTH = 80;

export const petTypeNameSchema = textField({
  minLength: 1,
  maxLength: PETTYPE_NAME_MAX_LENGTH,
  pattern: /^[A-Za-z0-9].{0,79}$/,
  messages: {
    maxlength: 'Name may be only 80 characters long',
    minlength: 'Name may be at least 1 characters long',
    pattern: 'Name must begin with a letter or digit',
    required: 'Name is required',
  },
});

export const petTypeSchema = z.object({ name: petTypeNameSchema });

// ---------------------------------------------------------------------------
// Specialty (specialty-add / specialty-edit templates)
// ---------------------------------------------------------------------------

export const SPECIALTY_NAME_MAX_LENGTH = 80;

export const specialtyNameSchema = textField({
  minLength: 1,
  maxLength: SPECIALTY_NAME_MAX_LENGTH,
  pattern: /^[A-Za-z0-9].{0,79}$/,
  messages: {
    maxlength: `Name may be only ${SPECIALTY_NAME_MAX_LENGTH} characters long`,
    minlength: 'Name must be at least 1 characters long',
    pattern: 'Name must begin with a letter or digit',
    required: 'Name is required',
  },
});

export const specialtySchema = z.object({ name: specialtyNameSchema });
