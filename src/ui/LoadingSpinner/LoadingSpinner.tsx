import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner: React.FC = () => {
  const { darkMode } = useTheme();

  return (
    <div className={styles.spinnerContainer}>
      <div className={`${styles.spinner} ${darkMode ? styles.dark : ''}`}></div>
    </div>
  );
};

export default LoadingSpinner;