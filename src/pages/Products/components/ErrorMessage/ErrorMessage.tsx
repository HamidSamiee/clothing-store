// src/components/ErrorMessage/ErrorMessage.tsx
import styles from './ErrorMessage.module.css';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

interface ErrorMessageProps {
  message: string;
  retry?: () => void;
  className?: string;
}

const ErrorMessage = ({ message, retry, className = '' }: ErrorMessageProps) => {
  return (
    <div className={`${styles.errorContainer} ${className}`}>
      <div className={styles.errorContent}>
        <FiAlertCircle className={styles.errorIcon} size={24} />
        <p className={styles.errorText}>{message}</p>
        {retry && (
          <button 
            className={styles.retryButton}
            onClick={retry}
          >
            <FiRefreshCw className={styles.retryIcon} />
            تلاش مجدد
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;