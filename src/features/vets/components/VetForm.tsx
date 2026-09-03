import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Specialty } from '../../../models';
import VetNameField, { validateName } from './VetNameField';
import type { VetNameErrors } from './VetNameField';
import styles from './VetForm.module.css';

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

const EMPTY_VALUES: VetFormValues = { firstName: '', lastName: '', specialties: [] };

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

  const firstNameErrors = validateName(firstName);
  const lastNameErrors = validateName(lastName);
  const isValid = Object.keys(firstNameErrors).length === 0 && Object.keys(lastNameErrors).length === 0;
  const isAdd = variant === 'add';

  const showRequired = (dirty: boolean, errors: VetNameErrors) =>
    Boolean(errors.required) && (dirty || (isAdd && submitted));

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
    <form id={isAdd ? 'vet' : 'vet_form'} className="form-horizontal" onSubmit={handleSubmit} noValidate>
      <VetNameField
        id="firstName"
        label="First Name"
        requiredLabel={isAdd ? 'First name' : 'First Name'}
        value={firstName}
        dirty={firstNameDirty}
        showRequired={showRequired(firstNameDirty, firstNameErrors)}
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
        showRequired={showRequired(lastNameDirty, lastNameErrors)}
        onChange={(value) => {
          setLastName(value);
          setLastNameDirty(true);
        }}
      />
      <div className="control-group">
        <div className="form-group">
          <label htmlFor="specialties" className="col-sm-2 control-label">
            {isAdd ? 'Type' : 'Specialties'}
          </label>
          <div className="col-sm-10">
            <select
              id="specialties"
              name="specialties"
              className={`form-control ${styles.multiSelect}`}
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
            </select>
          </div>
        </div>
      </div>
      <div className="form-group">
        <div className="col-sm-offset-2 col-sm-10">
          <br />
          <button className="btn btn-default" type="button" onClick={onBack}>
            &lt; Back
          </button>
          <button className="btn btn-default" type="submit" disabled={!isValid || isSubmitting}>
            Save Vet
          </button>
        </div>
      </div>
    </form>
  );
}
