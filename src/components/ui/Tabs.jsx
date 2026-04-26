import React, { useState } from 'react';
import { classNames } from '@/lib/utils';
import styles from './Tabs.module.css';

export function Tabs({ defaultValue, children, className, onValueChange }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (onValueChange) onValueChange(value);
  };

  return (
    <div className={classNames(styles.tabs, className)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, onTabChange: handleTabChange });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, className, activeTab, onTabChange }) {
  return (
    <div className={classNames(styles.tabsList, className)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === TabsTrigger) {
          return React.cloneElement(child, { 
            isActive: activeTab === child.props.value, 
            onClick: () => onTabChange(child.props.value) 
          });
        }
        return child;
      })}
    </div>
  );
}

export function TabsTrigger({ value, children, className, isActive, onClick }) {
  return (
    <button
      className={classNames(styles.tabsTrigger, isActive && styles.active, className)}
      onClick={onClick}
      type="button"
      role="tab"
      aria-selected={isActive}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className, activeTab }) {
  if (activeTab !== value) return null;
  
  return (
    <div 
      className={classNames(styles.tabsContent, className)}
      role="tabpanel"
    >
      {children}
    </div>
  );
}
