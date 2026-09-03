import type { InputHTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
import styles from './Form.module.css';

/** Text-like input styled as a form control. */
export default function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(styles.control, className)} {...rest} />;
}
