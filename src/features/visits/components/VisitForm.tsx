import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Visit } from '../../../models';
import type { FieldStatus } from '../../../components/ui/Field';
import Button from '../../../components/ui/Button';
import Field from '../../../components/ui/Field';
import Form from '../../../components/ui/Form';
import FormActions from '../../../components/ui/FormActions';
import Input from '../../../components/ui/Input';

const DESCRIPTION_MIN_LENGTH = 1;
const DESCRIPTION_MAX_LENGTH = 255;

export interface VisitFormValues {
  date: string;
  description: string;
}

export interface DescriptionErrors {
  required?: true;
  minlength?: true;
  maxlength?: true;
}

/** Angular's minlength/maxlength validators pass on an empty value; only `required` fires. */
export function validateDescription(value: string): DescriptionErrors {
  if (value.length === 0) {
    return { required: true };
  }
  const errors: DescriptionErrors = {};
  if (value.length < DESCRIPTION_MIN_LENGTH) {
    errors.minlength = true;
  }
  if (value.length > DESCRIPTION_MAX_LENGTH) {
    errors.maxlength = true;
  }
  return errors;
}

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

  const descriptionErrors = validateDescription(values.description);
  const isDescriptionValid = Object.keys(descriptionErrors).length === 0;
  const isDateValid = values.date !== '';
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

  const descriptionMessages: string[] = [];
  if (dirty.description && descriptionErrors.required) descriptionMessages.push('Description is required');
  if (dirty.description && descriptionErrors.minlength) {
    descriptionMessages.push('Description must be at least 1 characters long');
  }
  if (dirty.description && descriptionErrors.maxlength) {
    descriptionMessages.push('Description may be at most 255 characters long');
  }

  return (
    <Form id="visit" onSubmit={handleSubmit}>
      <Field
        id="date"
        label="Date"
        status={status(dirty.date, isDateValid)}
        errorsId="date-errors"
        errors={dirty.date && !isDateValid ? ['Date is required'] : []}
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
        errors={descriptionMessages}
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
