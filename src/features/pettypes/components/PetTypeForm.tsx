import { useState } from 'react';
import type { FormEvent } from 'react';
import styles from './PetTypeForm.module.css';

/** Same constraints as the `name` input of pettype-add / pettype-edit templates. */
export const NAME_MAX_LENGTH = 80;
export const NAME_PATTERN = /^[A-Za-z0-9].{0,79}$/;

export interface PetTypeFormErrors {
  required?: boolean;
  minlength?: boolean;
  maxlength?: boolean;
  pattern?: boolean;
}

/**
 * Mirrors Angular's validator semantics: `minlength`/`pattern` pass on an empty
 * value and only `required` reports it.
 */
export function validateName(name: string): PetTypeFormErrors {
  const errors: PetTypeFormErrors = {};
  if (name.length === 0) {
    errors.required = true;
    return errors;
  }
  if (name.length < 1) {
    errors.minlength = true;
  }
  if (name.length > NAME_MAX_LENGTH) {
    errors.maxlength = true;
  }
  if (!NAME_PATTERN.test(name)) {
    errors.pattern = true;
  }
  return errors;
}

interface PetTypeFormProps {
  initialName?: string;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (name: string) => void;
  /** Renders a "Cancel" button when provided (edit form only in Angular). */
  onCancel?: () => void;
  /**
   * pettype-add shows "Name is required" after a submit attempt even if the field
   * is pristine; pettype-edit only when the field is dirty.
   */
  showRequiredOnSubmit?: boolean;
}

export default function PetTypeForm({
  initialName = '',
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
  showRequiredOnSubmit = false,
}: PetTypeFormProps) {
  const [name, setName] = useState(initialName);
  const [dirty, setDirty] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errors = validateName(name);
  const isValid = Object.keys(errors).length === 0;
  const showRequired = errors.required && (dirty || (showRequiredOnSubmit && submitted));
  const hasVisibleError = dirty && !isValid;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!isValid || isSubmitting) {
      return;
    }
    onSubmit(name);
  };

  const groupClass = ['form-group', 'has-feedback', dirty && isValid ? 'has-success' : '', hasVisibleError ? 'has-error' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <form id="pettype" className="form-horizontal" onSubmit={handleSubmit} noValidate>
      <div className={groupClass}>
        <div className="form-group">
          <label htmlFor="name" className="col-sm-1 control-label">
            Name
          </label>
          <div className="col-sm-6">
            <input
              id="name"
              name="name"
              className="form-control"
              type="text"
              value={name}
              required
              aria-invalid={hasVisibleError || showRequired ? true : undefined}
              aria-describedby="name-errors"
              onChange={(event) => {
                setName(event.target.value);
                setDirty(true);
              }}
            />
            <span
              className={`glyphicon form-control-feedback ${isValid ? 'glyphicon-ok' : 'glyphicon-remove'}`}
              aria-hidden="true"
            ></span>
            <div id="name-errors" className={styles.errors}>
              {dirty && errors.maxlength && <span className="help-block">Name may be only 80 characters long</span>}
              {dirty && errors.minlength && <span className="help-block">Name may be at least 1 characters long</span>}
              {dirty && errors.pattern && <span className="help-block">Name must begin with a letter or digit</span>}
              {showRequired && <span className="help-block">Name is required</span>}
            </div>
          </div>
          <button className="btn btn-default" type="submit" disabled={!isValid || isSubmitting}>
            {submitLabel}
          </button>
          {onCancel && (
            <button className="btn btn-default" type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
