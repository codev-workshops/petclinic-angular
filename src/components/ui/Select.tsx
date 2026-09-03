import type { SelectHTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
import styles from './Form.module.css';

/** Native select styled as a form control. */
export default function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx(styles.control, className)} {...rest} />;
}
