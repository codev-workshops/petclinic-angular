import type { ReactNode } from 'react';
import styles from './Form.module.css';

interface FormActionsProps {
  children: ReactNode;
}

/** Button row aligned with the control column of a horizontal form. */
export default function FormActions({ children }: FormActionsProps) {
  return <div className={styles.actions}>{children}</div>;
}
