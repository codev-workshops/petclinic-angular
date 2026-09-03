import type { FormHTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
import styles from './Form.module.css';

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /** Lay fields and buttons out in one wrapping row (inline add/edit forms). */
  inline?: boolean;
}

/** Horizontal (label | control) form; browser validation is off, fields validate themselves. */
export default function Form({ inline = false, className, ...rest }: FormProps) {
  return <form noValidate className={cx(styles.form, inline && styles.inline, className)} {...rest} />;
}
