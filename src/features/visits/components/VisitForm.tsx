import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Visit } from '../../../models';
import styles from './VisitForm.module.css';

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

  const groupClass = (isDirty: boolean, isValid: boolean) =>
    ['form-group', 'has-feedback', isDirty && isValid ? 'has-success' : '', isDirty && !isValid ? 'has-error' : '']
      .filter(Boolean)
      .join(' ');

  return (
    <form id="visit" className="form-horizontal" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <div className={groupClass(dirty.date, isDateValid)}>
          <label htmlFor="date" className="col-sm-2 control-label">
            Date
          </label>
          <div className="col-sm-10">
            <input
              id="date"
              name="date"
              className="form-control"
              type="date"
              required
              value={values.date}
              aria-invalid={dirty.date && !isDateValid ? true : undefined}
              aria-describedby="date-errors"
              onChange={(event) => handleChange('date', event.target.value)}
            />
            <span
              className={`glyphicon form-control-feedback ${isDateValid ? 'glyphicon-ok' : 'glyphicon-remove'}`}
              aria-hidden="true"
            ></span>
            <div id="date-errors" className={styles.errors}>
              {dirty.date && !isDateValid && <span className="help-block">Date is required</span>}
            </div>
          </div>
        </div>
        <div className={groupClass(dirty.description, isDescriptionValid)}>
          <label htmlFor="description" className="col-sm-2 control-label">
            Description
          </label>
          <div className="col-sm-10">
            <input
              id="description"
              name="description"
              className="form-control"
              type="text"
              required
              value={values.description}
              aria-invalid={dirty.description && !isDescriptionValid ? true : undefined}
              aria-describedby="description-errors"
              onChange={(event) => handleChange('description', event.target.value)}
            />
            <span
              className={`glyphicon form-control-feedback ${isDescriptionValid ? 'glyphicon-ok' : 'glyphicon-remove'}`}
              aria-hidden="true"
            ></span>
            <div id="description-errors" className={styles.errors}>
              {dirty.description && descriptionErrors.required && (
                <span className="help-block">Description is required</span>
              )}
              {dirty.description && descriptionErrors.minlength && (
                <span className="help-block">Description must be at least 1 characters long</span>
              )}
              {dirty.description && descriptionErrors.maxlength && (
                <span className="help-block">Description may be at most 255 characters long</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="form-group">
        <div className="col-sm-offset-2 col-sm-10">
          <button className="btn btn-default" type="button" onClick={onBack}>
            Back
          </button>
          <button className="btn btn-default" type="submit" disabled={!isFormValid || isSubmitting}>
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
