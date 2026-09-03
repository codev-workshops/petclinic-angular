import type { TableHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import styles from './Table.module.css';

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  condensed?: boolean;
}

/** Data table. `condensed` also sets the `table-condensed` hook class used by the parity suite. */
export default function Table({ striped = false, condensed = false, className, ...rest }: TableProps) {
  return (
    <table
      className={cx(
        styles.table,
        striped && styles.striped,
        condensed && styles.condensed,
        condensed && 'table-condensed',
        className,
      )}
      {...rest}
    />
  );
}
