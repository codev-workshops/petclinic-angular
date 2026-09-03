import type { ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import { cx } from '@/utils/cx';
import styles from './Form.module.css';

export type FieldStatus = 'valid' | 'invalid' | null;

interface FieldProps {
  id: string;
  label: ReactNode;
  /** Colours the field and shows a check / cross once the user has touched it. */
  status?: FieldStatus;
  /** Element id of the errors container (`aria-describedby` target of the control). */
  errorsId?: string;
  /** Validation messages; rendered as `.help-block` spans for the parity suite. */
  errors?: string[];
  children: ReactNode;
}

/** One labelled control row with inline validation feedback. */
export default function Field({ id, label, status = null, errorsId, errors = [], children }: FieldProps) {
  return (
    <div className={cx(styles.field, status === 'valid' && styles.valid, status === 'invalid' && styles.invalid)}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={cx(styles.controlWrapper, status && styles.withFeedback)}>
        {children}
        {status === 'valid' && <Check className={styles.feedback} size={18} aria-hidden="true" />}
        {status === 'invalid' && <X className={styles.feedback} size={18} aria-hidden="true" />}
        <div id={errorsId} className={styles.errors}>
          {errors.map((message) => (
            <span key={message} className={cx(styles.help, 'help-block')}>
              {message}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
