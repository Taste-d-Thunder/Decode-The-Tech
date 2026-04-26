import React, { useEffect, useState } from 'react';
import { classNames, formatTime } from '@/lib/utils';
import styles from './Timer.module.css';

export function Timer({ initialSeconds, onTimeout, className }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      if (onTimeout) onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onTimeout]);

  const isWarning = seconds <= 60 && seconds > 0;
  const isDanger = seconds <= 10 && seconds > 0;

  return (
    <div className={classNames(
      styles.timer, 
      isWarning && styles.warning,
      isDanger && styles.danger,
      className
    )}>
      {formatTime(seconds)}
    </div>
  );
}
