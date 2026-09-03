import { LoaderCircle } from 'lucide-react';
import { cx } from '@/utils/cx';
import styles from './LoadingIndicator.module.css';

interface LoadingIndicatorProps {
  label?: string;
}

export default function LoadingIndicator({ label = 'Loading...' }: LoadingIndicatorProps) {
  return (
    <div className={cx(styles.indicator, 'loading-indicator')} role="status" aria-live="polite">
      <LoaderCircle className={styles.spin} size={18} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
