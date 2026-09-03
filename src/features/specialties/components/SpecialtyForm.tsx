import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import type { Specialty } from '../../../models';
import Button from '../../../components/ui/Button';
import Field from '../../../components/ui/Field';
import Form from '../../../components/ui/Form';
import Input from '../../../components/ui/Input';

/** Same rule as `pattern="^[A-Za-z0-9].{0,79}$"` in the Angular templates. */
const NAME_PATTERN = /^[A-Za-z0-9].{0,79}$/;
const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 80;

type NameError = 'maxlength' | 'minlength' | 'pattern' | 'required';

const NAME_MESSAGES: Record<NameError, string> = {
  maxlength: `Name may be only ${NAME_MAX_LENGTH} characters long`,
  minlength: `Name must be at least ${NAME_MIN_LENGTH} characters long`,
  pattern: 'Name must begin with a letter or digit',
  required: 'Name is required',
};

/**
 * Mirrors Angular's `required` + `minlength` + `maxlength` + `pattern` validators:
 * the length/pattern validators pass on an empty value, which only fails `required`.
 */
export function validateSpecialtyName(name: string): NameError[] {
  const errors: NameError[] = [];
  if (name.length > NAME_MAX_LENGTH) {
    errors.push('maxlength');
  }
  if (name.length > 0 && name.length < NAME_MIN_LENGTH) {
    errors.push('minlength');
  }
  if (name.length > 0 && !NAME_PATTERN.test(name)) {
    errors.push('pattern');
  }
  if (name.length === 0) {
    errors.push('required');
  }
  return errors;
}

interface SpecialtyFormProps {
  /** Existing specialty for the edit form; `undefined` for the inline add form. */
  specialty?: Specialty;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (specialty: Specialty) => void;
  /** Rendered as a "Cancel" button when provided (edit form only, like Angular). */
  onCancel?: () => void;
}

/**
 * Shared add/edit form (specialty-add.component.html / specialty-edit.component.html).
 * The initial value is read once; remount (e.g. with `key`) to reset it for another specialty.
 */
export default function SpecialtyForm({
  specialty,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: SpecialtyFormProps) {
  const [name, setName] = useState(specialty?.name ?? '');
  const [nameDirty, setNameDirty] = useState(false);
  const nameId = useId();
  const nameErrorId = `${nameId}-error`;

  const nameErrors = validateSpecialtyName(name);
  const isValid = nameErrors.length === 0;
  const showNameErrors = nameDirty && !isValid;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || isSubmitting) {
      return;
    }
    onSubmit({ id: specialty?.id as number, name });
  };

  return (
    <Form inline onSubmit={handleSubmit}>
      <Field
        id={nameId}
        label="Name"
        status={nameDirty ? (isValid ? 'valid' : 'invalid') : null}
        errorsId={showNameErrors ? nameErrorId : undefined}
        errors={showNameErrors ? nameErrors.map((error) => NAME_MESSAGES[error]) : []}
      >
        <Input
          id={nameId}
          name="name"
          type="text"
          maxLength={NAME_MAX_LENGTH}
          required
          value={name}
          aria-invalid={showNameErrors}
          aria-describedby={showNameErrors ? nameErrorId : undefined}
          onChange={(event) => {
            setName(event.target.value);
            setNameDirty(true);
          }}
        />
      </Field>
      <Button type="submit" disabled={!isValid || isSubmitting}>
        {submitLabel}
      </Button>
      {onCancel && <Button onClick={onCancel}>Cancel</Button>}
    </Form>
  );
}
