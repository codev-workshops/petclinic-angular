import type { ReactNode } from 'react';
import styles from './Page.module.css';

interface PageProps {
  children: ReactNode;
}

/** Centered content column used by every routed view. */
export default function Page({ children }: PageProps) {
  return <div className={styles.page}>{children}</div>;
}
