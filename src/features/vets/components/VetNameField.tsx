import Field from '../../../components/ui/Field';
import Input from '../../../components/ui/Input';

/** Same constraints as the firstName / lastName inputs of vet-add / vet-edit templates. */
export const NAME_MIN_LENGTH = 1;
export const NAME_MAX_LENGTH = 30;
export const NAME_PATTERN = /^[A-Za-z]*$/;

export interface VetNameErrors {
  required?: boolean;
  minlength?: boolean;
  maxlength?: boolean;
  pattern?: boolean;
}

/**
 * Mirrors Angular's validator semantics: `minlength`/`maxlength`/`pattern` pass on an
 * empty value and only `required` reports it.
 */
export function validateName(value: string): VetNameErrors {
  const errors: VetNameErrors = {};
  if (value.length === 0) {
    errors.required = true;
    return errors;
  }
  if (value.length < NAME_MIN_LENGTH) {
    errors.minlength = true;
  }
  if (value.length > NAME_MAX_LENGTH) {
    errors.maxlength = true;
  }
  if (!NAME_PATTERN.test(value)) {
    errors.pattern = true;
  }
  return errors;
}

export interface VetNameFieldProps {
  id: 'firstName' | 'lastName';
  label: string;
  /** vet-add says "First name is required", vet-edit "First Name is required". */
  requiredLabel: string;
  value: string;
  dirty: boolean;
  showRequired: boolean;
  onChange: (value: string) => void;
}

export default function VetNameField({
  id,
  label,
  requiredLabel,
  value,
  dirty,
  showRequired,
  onChange,
}: VetNameFieldProps) {
  const errors = validateName(value);
  const isValid = Object.keys(errors).length === 0;
  const hasVisibleError = dirty && !isValid;

  const messages: string[] = [];
  if (dirty && errors.maxlength) messages.push(`${label} may be only ${NAME_MAX_LENGTH} characters long`);
  if (dirty && errors.minlength) messages.push(`${label} must be at least ${NAME_MIN_LENGTH} characters long`);
  if (dirty && errors.pattern) messages.push(`${label} may only consist of letters`);
  if (showRequired) messages.push(`${requiredLabel} is required`);

  return (
    <Field
      id={id}
      label={label}
      status={dirty ? (isValid ? 'valid' : 'invalid') : null}
      errorsId={`${id}-errors`}
      errors={messages}
    >
      <Input
        type="text"
        id={id}
        name={id}
        value={value}
        required
        aria-invalid={hasVisibleError || showRequired ? true : undefined}
        aria-describedby={`${id}-errors`}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}
