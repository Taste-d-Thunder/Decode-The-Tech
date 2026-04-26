import React from 'react';
import { classNames } from '@/lib/utils';
import styles from './Table.module.css';

export function Table({ className, ...props }) {
  return (
    <div className={styles.wrapper}>
      <table className={classNames(styles.table, className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }) {
  return <thead className={classNames(styles.header, className)} {...props} />;
}

export function TableBody({ className, ...props }) {
  return <tbody className={classNames(styles.body, className)} {...props} />;
}

export function TableFooter({ className, ...props }) {
  return <tfoot className={classNames(styles.footer, className)} {...props} />;
}

export function TableRow({ className, ...props }) {
  return <tr className={classNames(styles.row, className)} {...props} />;
}

export function TableHead({ className, ...props }) {
  return <th className={classNames(styles.head, className)} {...props} />;
}

export function TableCell({ className, ...props }) {
  return <td className={classNames(styles.cell, className)} {...props} />;
}

export function TableCaption({ className, ...props }) {
  return <caption className={classNames(styles.caption, className)} {...props} />;
}
