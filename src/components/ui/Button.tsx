import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'link';
}

/** The PetClinic button: dark fill with a brand-green border. `type` defaults to "button". */
export default function Button({ variant = 'default', type = 'button', className, ...rest }: ButtonProps) {
  return <button type={type} className={cx(styles.button, variant === 'link' && styles.link, className)} {...rest} />;
}
