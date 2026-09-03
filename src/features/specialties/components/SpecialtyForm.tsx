import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import type { Specialty } from '@/models';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Form from '@/components/ui/Form';
import Input from '@/components/ui/Input';
import { SPECIALTY_NAME_MAX_LENGTH, fieldIssues, specialtyNameSchema } from '@/forms/schemas';

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

  const nameIssues = fieldIssues(specialtyNameSchema, name);
  const isValid = nameIssues.length === 0;
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
        errors={showNameErrors ? nameIssues.map((issue) => issue.message) : []}
      >
        <Input
          id={nameId}
          name="name"
          type="text"
          maxLength={SPECIALTY_NAME_MAX_LENGTH}
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
