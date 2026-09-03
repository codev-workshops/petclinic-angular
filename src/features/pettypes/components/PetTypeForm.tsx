import { useState } from 'react';
import type { FormEvent } from 'react';
import Button from '../../../components/ui/Button';
import Field from '../../../components/ui/Field';
import Form from '../../../components/ui/Form';
import Input from '../../../components/ui/Input';

/** Same constraints as the `name` input of pettype-add / pettype-edit templates. */
export const NAME_MAX_LENGTH = 80;
export const NAME_PATTERN = /^[A-Za-z0-9].{0,79}$/;

export interface PetTypeFormErrors {
  required?: boolean;
  minlength?: boolean;
  maxlength?: boolean;
  pattern?: boolean;
}

/**
 * Mirrors Angular's validator semantics: `minlength`/`pattern` pass on an empty
 * value and only `required` reports it.
 */
export function validateName(name: string): PetTypeFormErrors {
  const errors: PetTypeFormErrors = {};
  if (name.length === 0) {
    errors.required = true;
    return errors;
  }
  if (name.length < 1) {
    errors.minlength = true;
  }
  if (name.length > NAME_MAX_LENGTH) {
    errors.maxlength = true;
  }
  if (!NAME_PATTERN.test(name)) {
    errors.pattern = true;
  }
  return errors;
}

interface PetTypeFormProps {
  initialName?: string;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (name: string) => void;
  /** Renders a "Cancel" button when provided (edit form only in Angular). */
  onCancel?: () => void;
  /**
   * pettype-add shows "Name is required" after a submit attempt even if the field
   * is pristine; pettype-edit only when the field is dirty.
   */
  showRequiredOnSubmit?: boolean;
}

export default function PetTypeForm({
  initialName = '',
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
  showRequiredOnSubmit = false,
}: PetTypeFormProps) {
  const [name, setName] = useState(initialName);
  const [dirty, setDirty] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errors = validateName(name);
  const isValid = Object.keys(errors).length === 0;
  const showRequired = errors.required && (dirty || (showRequiredOnSubmit && submitted));
  const hasVisibleError = dirty && !isValid;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!isValid || isSubmitting) {
      return;
    }
    onSubmit(name);
  };

  const messages: string[] = [];
  if (dirty && errors.maxlength) messages.push('Name may be only 80 characters long');
  if (dirty && errors.minlength) messages.push('Name may be at least 1 characters long');
  if (dirty && errors.pattern) messages.push('Name must begin with a letter or digit');
  if (showRequired) messages.push('Name is required');

  return (
    <Form id="pettype" inline onSubmit={handleSubmit}>
      <Field
        id="name"
        label="Name"
        status={dirty ? (isValid ? 'valid' : 'invalid') : null}
        errorsId="name-errors"
        errors={messages}
      >
        <Input
          id="name"
          name="name"
          type="text"
          value={name}
          required
          aria-invalid={hasVisibleError || showRequired ? true : undefined}
          aria-describedby="name-errors"
          onChange={(event) => {
            setName(event.target.value);
            setDirty(true);
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
