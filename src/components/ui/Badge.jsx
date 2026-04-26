import React from 'react';
import { classNames } from '@/lib/utils';
import styles from './Badge.module.css';

export function Badge({ children, variant = 'default', className, ...props }) {
  return (
    <div className={classNames(styles.badge, styles[variant], className)} {...props}>
      {children}
    </div>
  );
}
