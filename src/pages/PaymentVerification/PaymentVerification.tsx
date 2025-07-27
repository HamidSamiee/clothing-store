// src/pages/PaymentVerification/PaymentVerification.tsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePayment } from '@/hooks/usePayment';
import styles from './PaymentVerification.module.css';

const PaymentVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyPayment, isLoading, error } = usePayment();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authority = params.get('Authority');
    const status = params.get('Status');

    if (authority && status) {
      verifyPayment(authority, status).catch(() => {
        navigate('/payment-failed');
      });
    } else {
      navigate('/');
    }
  }, [location, navigate, verifyPayment]);

  return (
    <div className={styles.verificationContainer}>
      {isLoading ? (
        <div className={styles.loadingMessage}>در حال تایید پرداخت...</div>
      ) : error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : null}
    </div>
  );
};

export default PaymentVerification;