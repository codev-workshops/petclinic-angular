import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Owner } from '../../../models';
import styles from './OwnerForm.module.css';

/** Constraints transcribed from owner-add / owner-edit templates. */
const LETTERS_ONLY = /^[a-zA-Z]*$/;
const DIGITS_ONLY = /^[0-9]*$/;

type OwnerFieldName = 'firstName' | 'lastName' | 'address' | 'city' | 'telephone';

export type OwnerFormValues = Record<OwnerFieldName, string>;

interface FieldRules {
  label: string;
  minLength?: number;
  maxLength: number;
  pattern?: RegExp;
  messages: {
    required: string;
    minlength?: string;
    maxlength: string;
    pattern?: string;
  };
}

const FIELD_RULES: Record<OwnerFieldName, FieldRules> = {
  firstName: {
    label: 'First Name',
    minLength: 1,
    maxLength: 30,
    pattern: LETTERS_ONLY,
    messages: {
      required: 'First name is required',
      minlength: 'First name must be at least 1 characters long',
      maxlength: 'First name may be at most 30 characters long',
      pattern: 'First name must consist of letters only',
    },
  },
  lastName: {
    label: 'Last Name',
    minLength: 1,
    maxLength: 30,
    pattern: LETTERS_ONLY,
    messages: {
      required: 'Last name is required',
      minlength: 'Last name must be at least 1 characters long',
      maxlength: 'Last name may be at most 30 characters long',
      pattern: 'Last name must consist of letters only',
    },
  },
  address: {
    label: 'Address',
    maxLength: 255,
    messages: {
      required: 'Address is required',
      maxlength: 'Address may be at most 255 characters long',
    },
  },
  city: {
    label: 'City',
    maxLength: 80,
    messages: {
      required: 'City is required',
      maxlength: 'City may be at most 80 characters long',
    },
  },
  telephone: {
    label: 'Telephone',
    minLength: 1,
    maxLength: 20,
    pattern: DIGITS_ONLY,
    messages: {
      required: 'Phone number is required',
      minlength: 'Phone number must be at least one digit long',
      maxlength: 'Phone number cannot be more than 20 digits long',
      pattern: 'Phone number only accept digits',
    },
  },
};

const FIELD_ORDER: OwnerFieldName[] = ['firstName', 'lastName', 'address', 'city', 'telephone'];

export interface FieldErrors {
  required?: boolean;
  minlength?: boolean;
  maxlength?: boolean;
  pattern?: boolean;
}

/**
 * Mirrors Angular validator semantics: `minlength`/`maxlength`/`pattern` pass on an
 * empty value and only `required` reports it.
 */
export function validateOwnerField(field: OwnerFieldName, value: string): FieldErrors {
  const rules = FIELD_RULES[field];
  const errors: FieldErrors = {};
  if (value.length === 0) {
    errors.required = true;
    return errors;
  }
  if (rules.minLength !== undefined && value.length < rules.minLength) {
    errors.minlength = true;
  }
  if (value.length > rules.maxLength) {
    errors.maxlength = true;
  }
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.pattern = true;
  }
  return errors;
}

export function validateOwner(values: OwnerFormValues): Record<OwnerFieldName, FieldErrors> {
  return {
    firstName: validateOwnerField('firstName', values.firstName),
    lastName: validateOwnerField('lastName', values.lastName),
    address: validateOwnerField('address', values.address),
    city: validateOwnerField('city', values.city),
    telephone: validateOwnerField('telephone', values.telephone),
  };
}

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

  const errors = validateOwner(values);
  const isFormValid = FIELD_ORDER.every((field) => Object.keys(errors[field]).length === 0);

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
    <form className="form-horizontal" onSubmit={handleSubmit} noValidate>
      {FIELD_ORDER.map((field) => {
        const rules = FIELD_RULES[field];
        const fieldErrors = errors[field];
        const isValid = Object.keys(fieldErrors).length === 0;
        const isDirty = dirty[field];
        const showFeedback = isDirty || showFeedbackWhenPristine;
        const groupClass = [
          'form-group',
          'has-feedback',
          showFeedback && isValid ? 'has-success' : '',
          showFeedback && !isValid ? 'has-error' : '',
        ]
          .filter(Boolean)
          .join(' ');
        const errorsId = `${field}-errors`;
        return (
          <div key={field} className={groupClass}>
            <label htmlFor={field} className="col-sm-2 control-label">
              {rules.label}
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                className="form-control"
                id={field}
                name={field}
                value={values[field]}
                required
                aria-invalid={isDirty && !isValid ? true : undefined}
                aria-describedby={errorsId}
                onChange={(event) => handleChange(field, event.target.value)}
              />
              <span
                className={`glyphicon form-control-feedback ${isValid ? 'glyphicon-ok' : 'glyphicon-remove'}`}
                aria-hidden="true"
              ></span>
              <div id={errorsId} className={styles.errors}>
                {isDirty && fieldErrors.required && <span className="help-block">{rules.messages.required}</span>}
                {isDirty && fieldErrors.minlength && rules.messages.minlength && (
                  <span className="help-block">{rules.messages.minlength}</span>
                )}
                {isDirty && fieldErrors.maxlength && <span className="help-block">{rules.messages.maxlength}</span>}
                {isDirty && fieldErrors.pattern && rules.messages.pattern && (
                  <span className="help-block">{rules.messages.pattern}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
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
