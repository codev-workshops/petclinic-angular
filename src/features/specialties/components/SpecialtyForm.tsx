import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import type { Specialty } from '../../../models';
import styles from './SpecialtyForm.module.css';

/** Same rule as `pattern="^[A-Za-z0-9].{0,79}$"` in the Angular templates. */
const NAME_PATTERN = /^[A-Za-z0-9].{0,79}$/;
const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 80;

type NameError = 'maxlength' | 'minlength' | 'pattern' | 'required';

const NAME_MESSAGES: Record<NameError, string> = {
  maxlength: `Name may be only ${NAME_MAX_LENGTH} characters long`,
  minlength: `Name must be at least ${NAME_MIN_LENGTH} characters long`,
  pattern: 'Name must begin with a letter or digit',
  required: 'Name is required',
};

/**
 * Mirrors Angular's `required` + `minlength` + `maxlength` + `pattern` validators:
 * the length/pattern validators pass on an empty value, which only fails `required`.
 */
export function validateSpecialtyName(name: string): NameError[] {
  const errors: NameError[] = [];
  if (name.length > NAME_MAX_LENGTH) {
    errors.push('maxlength');
  }
  if (name.length > 0 && name.length < NAME_MIN_LENGTH) {
    errors.push('minlength');
  }
  if (name.length > 0 && !NAME_PATTERN.test(name)) {
    errors.push('pattern');
  }
  if (name.length === 0) {
    errors.push('required');
  }
  return errors;
}

interface SpecialtyFormProps {
  /** Existing specialty for the edit form; `undefined` for the inline add form. */
  specialty?: Specialty;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (specialty: Specialty) => void;
  /** Rendered as a "Cancel" button when provided (edit form only, like Angular). */
  onCancel?: () => void;
}

/**
 * Shared add/edit form (specialty-add.component.html / specialty-edit.component.html).
 * The initial value is read once; remount (e.g. with `key`) to reset it for another specialty.
 */
export default function SpecialtyForm({ specialty, submitLabel, isSubmitting, onSubmit, onCancel }: SpecialtyFormProps) {
  const [name, setName] = useState(specialty?.name ?? '');
  const [nameDirty, setNameDirty] = useState(false);
  const nameId = useId();
  const nameErrorId = `${nameId}-error`;

  const nameErrors = validateSpecialtyName(name);
  const isValid = nameErrors.length === 0;
  const showNameErrors = nameDirty && !isValid;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || isSubmitting) {
      return;
    }
    onSubmit({ id: specialty?.id as number, name });
  };

  const groupClass = ['form-group', 'has-feedback', nameDirty && (isValid ? 'has-success' : 'has-error')]
    .filter(Boolean)
    .join(' ');

  return (
    <form className={`form-horizontal ${styles.form}`} onSubmit={handleSubmit} noValidate>
      <div className={groupClass}>
        <label className="col-sm-1 control-label" htmlFor={nameId}>
          Name
        </label>
        <div className="col-sm-6">
          <input
            id={nameId}
            name="name"
            className="form-control"
            type="text"
            maxLength={NAME_MAX_LENGTH}
            required
            value={name}
            aria-invalid={showNameErrors}
            aria-describedby={showNameErrors ? nameErrorId : undefined}
            onChange={(event) => {
              setName(event.target.value);
              setNameDirty(true);
            }}
          />
          {nameDirty && (
            <span
              className={`glyphicon form-control-feedback ${isValid ? 'glyphicon-ok' : 'glyphicon-remove'}`}
              aria-hidden="true"
            ></span>
          )}
          {showNameErrors && (
            <div id={nameErrorId}>
              {nameErrors.map((error) => (
                <span key={error} className="help-block">
                  {NAME_MESSAGES[error]}
                </span>
              ))}
            </div>
          )}
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
    </form>
  );
}
