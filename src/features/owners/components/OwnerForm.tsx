import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Owner } from '../../../models';
import Button from '../../../components/ui/Button';
import Field from '../../../components/ui/Field';
import Form from '../../../components/ui/Form';
import FormActions from '../../../components/ui/FormActions';
import Input from '../../../components/ui/Input';
import { OWNER_FIELD_ORDER, OWNER_LABELS, fieldIssues, ownerSchema } from '../../../forms/schemas';
import type { OwnerFieldName, OwnerFormValues } from '../../../forms/schemas';

export type { OwnerFormValues } from '../../../forms/schemas';

export function toOwnerFormValues(owner: Owner | undefined): OwnerFormValues {
  return {
    firstName: owner?.firstName ?? '',
    lastName: owner?.lastName ?? '',
    address: owner?.address ?? '',
    city: owner?.city ?? '',
    telephone: owner?.telephone ?? '',
  };
}

interface OwnerFormProps {
  owner?: Owner;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: OwnerFormValues) => void;
  onBack: () => void;
  /**
   * owner-add colours a field only once it is dirty; owner-edit colours every field
   * from the start (`[class.has-success]="firstName.valid"`).
   */
  showFeedbackWhenPristine?: boolean;
}

/** Shared add/edit form (owner-add.component.html / owner-edit.component.html). */
export default function OwnerForm({
  owner,
  submitLabel,
  isSubmitting,
  onSubmit,
  onBack,
  showFeedbackWhenPristine = false,
}: OwnerFormProps) {
  const [values, setValues] = useState<OwnerFormValues>(() => toOwnerFormValues(owner));
  const [dirty, setDirty] = useState<Record<OwnerFieldName, boolean>>({
    firstName: false,
    lastName: false,
    address: false,
    city: false,
    telephone: false,
  });

  const isFormValid = ownerSchema.safeParse(values).success;

  const handleChange = (field: OwnerFieldName, value: string) => {
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

  return (
    <Form onSubmit={handleSubmit}>
      {OWNER_FIELD_ORDER.map((field) => {
        const issues = fieldIssues(ownerSchema.shape[field], values[field]);
        const isValid = issues.length === 0;
        const isDirty = dirty[field];
        const showFeedback = isDirty || showFeedbackWhenPristine;
        const errorsId = `${field}-errors`;
        const messages = isDirty ? issues.map((issue) => issue.message) : [];
        return (
          <Field
            key={field}
            id={field}
            label={OWNER_LABELS[field]}
            status={showFeedback ? (isValid ? 'valid' : 'invalid') : null}
            errorsId={errorsId}
            errors={messages}
          >
            <Input
              type="text"
              id={field}
              name={field}
              value={values[field]}
              required
              aria-invalid={isDirty && !isValid ? true : undefined}
              aria-describedby={errorsId}
              onChange={(event) => handleChange(field, event.target.value)}
            />
          </Field>
        );
      })}
      <FormActions>
        <Button onClick={onBack}>Back</Button>
        <Button type="submit" disabled={!isFormValid || isSubmitting}>
          {submitLabel}
        </Button>
      </FormActions>
    </Form>
  );
}
