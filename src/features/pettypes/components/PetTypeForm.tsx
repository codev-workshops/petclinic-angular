import { useState } from 'react';
import type { FormEvent } from 'react';
import Button from '../../../components/ui/Button';
import Field from '../../../components/ui/Field';
import Form from '../../../components/ui/Form';
import Input from '../../../components/ui/Input';
import { fieldIssues, petTypeNameSchema } from '../../../forms/schemas';

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

  const issues = fieldIssues(petTypeNameSchema, name);
  const isValid = issues.length === 0;
  const showRequired = dirty || (showRequiredOnSubmit && submitted);
  const hasVisibleError = dirty && !isValid;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!isValid || isSubmitting) {
      return;
    }
    onSubmit(name);
  };

  const messages = issues
    .filter((issue) => (issue.kind === 'required' ? showRequired : dirty))
    .map((issue) => issue.message);

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
          aria-invalid={hasVisibleError || (showRequired && !isValid) ? true : undefined}
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
