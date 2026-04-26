import React, { forwardRef } from 'react';
import { classNames } from '@/lib/utils';
import styles from './Input.module.css';

export const Input = forwardRef(({ className, type = 'text', error, ...props }, ref) => {
  return (
    <div className={styles.wrapper}>
      <input
        type={type}
        className={classNames(
          styles.input,
          error && styles.errorInput,
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export const Label = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={classNames(styles.label, className)}
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = 'Label';
