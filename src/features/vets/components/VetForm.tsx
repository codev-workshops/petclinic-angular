import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Specialty } from '../../../models';
import VetNameField from './VetNameField';
import Button from '../../../components/ui/Button';
import Field from '../../../components/ui/Field';
import Form from '../../../components/ui/Form';
import FormActions from '../../../components/ui/FormActions';
import Select from '../../../components/ui/Select';
import { vetSchema } from '../../../forms/schemas';

export interface VetFormValues {
  firstName: string;
  lastName: string;
  specialties: Specialty[];
}

interface VetFormProps {
  /** Template variant: vet-add.component.html vs vet-edit.component.html. */
  variant: 'add' | 'edit';
  initialValues?: VetFormValues;
  /** All specialties available for selection (SpecialtyService.getSpecialties). */
  specialties: Specialty[];
  isSubmitting: boolean;
  onSubmit: (values: VetFormValues) => void;
  onBack: () => void;
}

const EMPTY_VALUES: VetFormValues = {
  firstName: '',
  lastName: '',
  specialties: [],
};

/**
 * Shared add/edit form. Specialties are a multi-select (`<mat-select multiple>` in vet-edit;
 * vet-add's plain `<select>` is widened to the same control). Options are compared by id
 * like `compareSpecFn`.
 */
export default function VetForm({
  variant,
  initialValues = EMPTY_VALUES,
  specialties,
  isSubmitting,
  onSubmit,
  onBack,
}: VetFormProps) {
  const [firstName, setFirstName] = useState(initialValues.firstName);
  const [lastName, setLastName] = useState(initialValues.lastName);
  const [selectedIds, setSelectedIds] = useState<number[]>(initialValues.specialties.map((spec) => spec.id));
  const [firstNameDirty, setFirstNameDirty] = useState(false);
  const [lastNameDirty, setLastNameDirty] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isAdd = variant === 'add';
  const isValid = vetSchema(variant).safeParse({ firstName, lastName }).success;

  /** vet-add shows "… is required" after a submit attempt even for a pristine field; vet-edit only when dirty. */
  const showRequired = (dirty: boolean) => dirty || (isAdd && submitted);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!isValid || isSubmitting) {
      return;
    }
    const selected = specialties.filter((spec) => selectedIds.includes(spec.id));
    onSubmit({ firstName, lastName, specialties: selected });
  };

  return (
    <Form id={isAdd ? 'vet' : 'vet_form'} onSubmit={handleSubmit}>
      <VetNameField
        id="firstName"
        label="First Name"
        requiredLabel={isAdd ? 'First name' : 'First Name'}
        value={firstName}
        dirty={firstNameDirty}
        showRequired={showRequired(firstNameDirty)}
        onChange={(value) => {
          setFirstName(value);
          setFirstNameDirty(true);
        }}
      />
      <VetNameField
        id="lastName"
        label="Last Name"
        requiredLabel={isAdd ? 'Last name' : 'Last Name'}
        value={lastName}
        dirty={lastNameDirty}
        showRequired={showRequired(lastNameDirty)}
        onChange={(value) => {
          setLastName(value);
          setLastNameDirty(true);
        }}
      />
      <Field id="specialties" label={isAdd ? 'Type' : 'Specialties'}>
        <Select
          id="specialties"
          name="specialties"
          multiple
          value={selectedIds.map(String)}
          onChange={(event) =>
            setSelectedIds(Array.from(event.target.selectedOptions, (option) => Number(option.value)))
          }
        >
          {specialties.map((spec) => (
            <option key={spec.id} value={spec.id}>
              {spec.name}
            </option>
          ))}
        </Select>
      </Field>
      <FormActions>
        <Button onClick={onBack}>&lt; Back</Button>
        <Button type="submit" disabled={!isValid || isSubmitting}>
          Save Vet
        </Button>
      </FormActions>
    </Form>
  );
}
