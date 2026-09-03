import { X } from 'lucide-react';
import { cx } from '../utils/cx';
import styles from './ErrorAlert.module.css';

interface ErrorAlertProps {
  message: string | null | undefined;
  onDismiss?: () => void;
}

export default function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  if (!message) {
    return null;
  }
  return (
    <div className={cx(styles.alert, 'alert', 'alert-danger')} role="alert">
      {onDismiss && (
        <button type="button" className={styles.close} aria-label="Dismiss error" onClick={onDismiss}>
          <X size={18} aria-hidden="true" />
        </button>
      )}
      {message}
    </div>
  );
}
