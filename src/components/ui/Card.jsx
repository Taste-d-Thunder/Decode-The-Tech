import React from 'react';
import { classNames } from '@/lib/utils';
import styles from './Card.module.css';

export function Card({ children, className, variant = 'default', ...props }) {
  return (
    <div className={classNames(styles.card, styles[variant], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={classNames(styles.header, className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={classNames(styles.title, className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p className={classNames(styles.description, className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={classNames(styles.content, className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={classNames(styles.footer, className)} {...props}>
      {children}
    </div>
  );
}
