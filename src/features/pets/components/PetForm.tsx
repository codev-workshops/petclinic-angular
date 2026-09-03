import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Owner, Pet, PetType } from '../../../models';
import styles from './PetForm.module.css';

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
  const [dirty, setDirty] = useState({ name: false, birthDate: false, typeId: false });

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

  const groupClass = (isDirty: boolean, isValid: boolean) =>
    ['form-group', 'has-feedback', isDirty && isValid ? 'has-success' : '', isDirty && !isValid ? 'has-error' : '']
      .filter(Boolean)
      .join(' ');

  const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : '';

  return (
    <form className="form-horizontal" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="owner_name" className="col-sm-2 control-label">
          Owner
        </label>
        <div className="col-sm-10">
          <input id="owner_name" name="owner_name" className="form-control" type="text" value={ownerName} readOnly />
        </div>
      </div>
      <br />

      <div className={groupClass(dirty.name, isNameValid)}>
        <label htmlFor="name" className="col-sm-2 control-label">
          Name
        </label>
        <div className="col-sm-10">
          <input
            id="name"
            name="name"
            className="form-control"
            type="text"
            required
            value={values.name}
            aria-invalid={dirty.name && !isNameValid ? true : undefined}
            aria-describedby="name-errors"
            onChange={(event) => handleChange('name', event.target.value)}
          />
          <span
            className={`glyphicon form-control-feedback ${isNameValid ? 'glyphicon-ok' : 'glyphicon-remove'}`}
            aria-hidden="true"
          ></span>
          <div id="name-errors" className={styles.errors}>
            {dirty.name && nameErrors.required && <span className="help-block">Name is required</span>}
            {dirty.name && nameErrors.minlength && (
              <span className="help-block">Name must be at least 1 character long</span>
            )}
            {dirty.name && nameErrors.maxlength && (
              <span className="help-block">Name may be at most 30 character long</span>
            )}
            {dirty.name && nameErrors.pattern && <span className="help-block">Name must begin with a letter</span>}
          </div>
        </div>
      </div>

      <div className={groupClass(dirty.birthDate, isBirthDateValid)}>
        <label htmlFor="birthDate" className="col-sm-2 control-label">
          Birth Date
        </label>
        <div className="col-sm-10">
          <input
            id="birthDate"
            name="birthDate"
            className="form-control"
            type="date"
            required
            value={values.birthDate}
            aria-invalid={dirty.birthDate && !isBirthDateValid ? true : undefined}
            aria-describedby="birthDate-errors"
            onChange={(event) => handleChange('birthDate', event.target.value)}
          />
          <span
            className={`glyphicon form-control-feedback ${isBirthDateValid ? 'glyphicon-ok' : 'glyphicon-remove'}`}
            aria-hidden="true"
          ></span>
          <div id="birthDate-errors" className={styles.errors}>
            {dirty.birthDate && !isBirthDateValid && <span className="help-block">BirthDate is required</span>}
          </div>
        </div>
      </div>

      <div className="control-group">
        <div className={groupClass(dirty.typeId, isTypeValid)}>
          <label htmlFor="type" className="col-sm-2 control-label">
            Type{' '}
          </label>
          <div className="col-sm-10">
            <select
              id="type"
              name="type"
              className="form-control"
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
            </select>
            <span
              className={`glyphicon form-control-feedback ${isTypeValid ? 'glyphicon-ok' : 'glyphicon-remove'}`}
              aria-hidden="true"
            ></span>
            <div id="type-errors" className={styles.errors}>
              {dirty.typeId && !isTypeValid && <span className="help-block">pettype is required</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="col-sm-offset-2 col-sm-10">
          <br />
          <button className="btn btn-default" type="button" onClick={onBack}>
            &lt; Back
          </button>
          <button className="btn btn-default" type="submit" disabled={!isFormValid || isSubmitting}>
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
