import styles from './VetNameField.module.css';

/** Same constraints as the firstName / lastName inputs of vet-add / vet-edit templates. */
export const NAME_MIN_LENGTH = 1;
export const NAME_MAX_LENGTH = 30;
export const NAME_PATTERN = /^[A-Za-z]*$/;

export interface VetNameErrors {
  required?: boolean;
  minlength?: boolean;
  maxlength?: boolean;
  pattern?: boolean;
}

/**
 * Mirrors Angular's validator semantics: `minlength`/`maxlength`/`pattern` pass on an
 * empty value and only `required` reports it.
 */
export function validateName(value: string): VetNameErrors {
  const errors: VetNameErrors = {};
  if (value.length === 0) {
    errors.required = true;
    return errors;
  }
  if (value.length < NAME_MIN_LENGTH) {
    errors.minlength = true;
  }
  if (value.length > NAME_MAX_LENGTH) {
    errors.maxlength = true;
  }
  if (!NAME_PATTERN.test(value)) {
    errors.pattern = true;
  }
  return errors;
}

export interface VetNameFieldProps {
  id: 'firstName' | 'lastName';
  label: string;
  /** vet-add says "First name is required", vet-edit "First Name is required". */
  requiredLabel: string;
  value: string;
  dirty: boolean;
  showRequired: boolean;
  onChange: (value: string) => void;
}

export default function VetNameField({ id, label, requiredLabel, value, dirty, showRequired, onChange }: VetNameFieldProps) {
  const errors = validateName(value);
  const isValid = Object.keys(errors).length === 0;
  const hasVisibleError = dirty && !isValid;
  const groupClass = [
    'form-group',
    'has-feedback',
    dirty && isValid ? 'has-success' : '',
    hasVisibleError ? 'has-error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={groupClass}>
      <label htmlFor={id} className="col-sm-2 control-label">
        {label}
      </label>
      <div className="col-sm-10">
        <input
          type="text"
          className="form-control"
          id={id}
          name={id}
          value={value}
          required
          aria-invalid={hasVisibleError || showRequired ? true : undefined}
          aria-describedby={`${id}-errors`}
          onChange={(event) => onChange(event.target.value)}
        />
        <span
          className={`glyphicon form-control-feedback ${isValid ? 'glyphicon-ok' : 'glyphicon-remove'}`}
          aria-hidden="true"
        ></span>
        <div id={`${id}-errors`} className={styles.errors}>
          {dirty && errors.maxlength && (
            <span className="help-block">{label} may be only {NAME_MAX_LENGTH} characters long</span>
          )}
          {dirty && errors.minlength && (
            <span className="help-block">
              {label} must be at least {NAME_MIN_LENGTH} characters long
            </span>
          )}
          {dirty && errors.pattern && <span className="help-block">{label} may only consist of letters</span>}
          {showRequired && <span className="help-block">{requiredLabel} is required</span>}
        </div>
      </div>
    </div>
  );
}

