import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Owner, Pet, PetType } from '../../../models';
import type { FieldStatus } from '../../../components/ui/Field';
import Button from '../../../components/ui/Button';
import Field from '../../../components/ui/Field';
import Form from '../../../components/ui/Form';
import FormActions from '../../../components/ui/FormActions';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { fieldIssues, petSchema } from '../../../forms/schemas';
import type { PetFormValues } from '../../../forms/schemas';

export type { PetFormValues } from '../../../forms/schemas';

export function toPetFormValues(pet: Pet | undefined): PetFormValues {
  return {
    name: pet?.name ?? '',
    birthDate: pet?.birthDate ?? '',
    typeId: pet?.type?.id !== undefined ? String(pet.type.id) : '',
  };
}

interface PetFormProps {
  pet?: Pet;
  owner: Owner | undefined;
  petTypes: PetType[];
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: PetFormValues, type: PetType) => void;
  onBack: () => void;
}

/** Shared add/edit form (pet-add.component.html / pet-edit.component.html). */
export default function PetForm({ pet, owner, petTypes, submitLabel, isSubmitting, onSubmit, onBack }: PetFormProps) {
  const [values, setValues] = useState<PetFormValues>(() => toPetFormValues(pet));
  const [dirty, setDirty] = useState({
    name: false,
    birthDate: false,
    typeId: false,
  });

  const nameIssues = fieldIssues(petSchema.shape.name, values.name);
  const birthDateIssues = fieldIssues(petSchema.shape.birthDate, values.birthDate);
  const typeIssues = fieldIssues(petSchema.shape.typeId, values.typeId);
  const isNameValid = nameIssues.length === 0;
  const isBirthDateValid = birthDateIssues.length === 0;
  const selectedType = petTypes.find((type) => String(type.id) === values.typeId);
  const isTypeValid = typeIssues.length === 0 && selectedType !== undefined;
  const isFormValid = isNameValid && isBirthDateValid && isTypeValid;

  const handleChange = (field: keyof PetFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setDirty((current) => ({ ...current, [field]: true }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || isSubmitting || !selectedType) {
      return;
    }
    onSubmit(values, selectedType);
  };

  const messages = (isDirty: boolean, issues: { message: string }[]) =>
    isDirty ? issues.map((issue) => issue.message) : [];

  const status = (isDirty: boolean, isValid: boolean): FieldStatus =>
    isDirty ? (isValid ? 'valid' : 'invalid') : null;

  const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : '';

  return (
    <Form onSubmit={handleSubmit}>
      <Field id="owner_name" label="Owner">
        <Input id="owner_name" name="owner_name" type="text" value={ownerName} readOnly />
      </Field>

      <Field
        id="name"
        label="Name"
        status={status(dirty.name, isNameValid)}
        errorsId="name-errors"
        errors={messages(dirty.name, nameIssues)}
      >
        <Input
          id="name"
          name="name"
          type="text"
          required
          value={values.name}
          aria-invalid={dirty.name && !isNameValid ? true : undefined}
          aria-describedby="name-errors"
          onChange={(event) => handleChange('name', event.target.value)}
        />
      </Field>

      <Field
        id="birthDate"
        label="Birth Date"
        status={status(dirty.birthDate, isBirthDateValid)}
        errorsId="birthDate-errors"
        errors={messages(dirty.birthDate, birthDateIssues)}
      >
        <Input
          id="birthDate"
          name="birthDate"
          type="date"
          required
          value={values.birthDate}
          aria-invalid={dirty.birthDate && !isBirthDateValid ? true : undefined}
          aria-describedby="birthDate-errors"
          onChange={(event) => handleChange('birthDate', event.target.value)}
        />
      </Field>

      <Field
        id="type"
        label="Type"
        status={status(dirty.typeId, isTypeValid)}
        errorsId="type-errors"
        errors={messages(dirty.typeId, typeIssues)}
      >
        <Select
          id="type"
          name="type"
          required
          value={values.typeId}
          aria-invalid={dirty.typeId && !isTypeValid ? true : undefined}
          aria-describedby="type-errors"
          onChange={(event) => handleChange('typeId', event.target.value)}
        >
          <option value=""></option>
          {petTypes.map((type) => (
            <option key={type.id} value={String(type.id)}>
              {type.name}
            </option>
          ))}
        </Select>
      </Field>

      <FormActions>
        <Button onClick={onBack}>&lt; Back</Button>
        <Button type="submit" disabled={!isFormValid || isSubmitting}>
          {submitLabel}
        </Button>
      </FormActions>
    </Form>
  );
}
