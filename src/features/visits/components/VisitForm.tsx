import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Visit } from '@/models';
import type { FieldStatus } from '@/components/ui/Field';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Form from '@/components/ui/Form';
import FormActions from '@/components/ui/FormActions';
import Input from '@/components/ui/Input';
import { fieldIssues, visitSchema } from '@/forms/schemas';
import type { VisitFormValues } from '@/forms/schemas';

export type { VisitFormValues } from '@/forms/schemas';

export function toVisitFormValues(visit: Visit | undefined): VisitFormValues {
  return { date: visit?.date ?? '', description: visit?.description ?? '' };
}

interface VisitFormProps {
  visit?: Visit;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: VisitFormValues) => void;
  onBack: () => void;
}

/** Shared add/edit form (visit-add.component.html / visit-edit.component.html). */
export default function VisitForm({ visit, submitLabel, isSubmitting, onSubmit, onBack }: VisitFormProps) {
  const [values, setValues] = useState<VisitFormValues>(() => toVisitFormValues(visit));
  const [dirty, setDirty] = useState({ date: false, description: false });

  const dateIssues = fieldIssues(visitSchema.shape.date, values.date);
  const descriptionIssues = fieldIssues(visitSchema.shape.description, values.description);
  const isDateValid = dateIssues.length === 0;
  const isDescriptionValid = descriptionIssues.length === 0;
  const isFormValid = isDateValid && isDescriptionValid;

  const handleChange = (field: keyof VisitFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setDirty((current) => ({ ...current, [field]: true }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || isSubmitting) {
      return;
    }
    onSubmit(values);
  };

  const status = (isDirty: boolean, isValid: boolean): FieldStatus =>
    isDirty ? (isValid ? 'valid' : 'invalid') : null;

  return (
    <Form id="visit" onSubmit={handleSubmit}>
      <Field
        id="date"
        label="Date"
        status={status(dirty.date, isDateValid)}
        errorsId="date-errors"
        errors={dirty.date ? dateIssues.map((issue) => issue.message) : []}
      >
        <Input
          id="date"
          name="date"
          type="date"
          required
          value={values.date}
          aria-invalid={dirty.date && !isDateValid ? true : undefined}
          aria-describedby="date-errors"
          onChange={(event) => handleChange('date', event.target.value)}
        />
      </Field>
      <Field
        id="description"
        label="Description"
        status={status(dirty.description, isDescriptionValid)}
        errorsId="description-errors"
        errors={dirty.description ? descriptionIssues.map((issue) => issue.message) : []}
      >
        <Input
          id="description"
          name="description"
          type="text"
          required
          value={values.description}
          aria-invalid={dirty.description && !isDescriptionValid ? true : undefined}
          aria-describedby="description-errors"
          onChange={(event) => handleChange('description', event.target.value)}
        />
      </Field>
      <FormActions>
        <Button onClick={onBack}>Back</Button>
        <Button type="submit" disabled={!isFormValid || isSubmitting}>
          {submitLabel}
        </Button>
      </FormActions>
    </Form>
  );
}
