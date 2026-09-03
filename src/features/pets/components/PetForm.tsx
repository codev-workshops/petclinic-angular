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

/** pet-add/pet-edit templates: `pattern="^[A-Za-z0-9].{0,29}$"`. */
const PET_NAME_PATTERN = /^[A-Za-z0-9].{0,29}$/;
const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 30;

export interface PetFormValues {
  name: string;
  birthDate: string;
  typeId: string;
}

export interface PetNameErrors {
  required?: true;
  minlength?: true;
  maxlength?: true;
  pattern?: true;
}

/** Angular's minlength/maxlength/pattern validators pass on an empty value; only `required` fires. */
export function validatePetName(value: string): PetNameErrors {
  if (value.length === 0) {
    return { required: true };
  }
  const errors: PetNameErrors = {};
  if (value.length < NAME_MIN_LENGTH) {
    errors.minlength = true;
  }
  if (value.length > NAME_MAX_LENGTH) {
    errors.maxlength = true;
  }
  if (!PET_NAME_PATTERN.test(value)) {
    errors.pattern = true;
  }
  return errors;
}

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

  const nameErrors = validatePetName(values.name);
  const isNameValid = Object.keys(nameErrors).length === 0;
  const isBirthDateValid = values.birthDate !== '';
  const selectedType = petTypes.find((type) => String(type.id) === values.typeId);
  const isTypeValid = selectedType !== undefined;
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

  const status = (isDirty: boolean, isValid: boolean): FieldStatus =>
    isDirty ? (isValid ? 'valid' : 'invalid') : null;

  const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : '';

  const nameMessages: string[] = [];
  if (dirty.name && nameErrors.required) nameMessages.push('Name is required');
  if (dirty.name && nameErrors.minlength) nameMessages.push('Name must be at least 1 character long');
  if (dirty.name && nameErrors.maxlength) nameMessages.push('Name may be at most 30 character long');
  if (dirty.name && nameErrors.pattern) nameMessages.push('Name must begin with a letter');

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
        errors={nameMessages}
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
        errors={dirty.birthDate && !isBirthDateValid ? ['BirthDate is required'] : []}
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
        errors={dirty.typeId && !isTypeValid ? ['pettype is required'] : []}
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
