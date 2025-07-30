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

    const verify = async () => {
      if (authority && status) {
        const result = verifyPayment(authority, status);
        console.log('Payment result:', result); 
        if (result.success) {
          navigate('/payment-success');
        } else {
          navigate('/payment-failed');
        }
      } else {
        navigate('/');
      }
    };

    verify();
  }, [location, navigate, verifyPayment]);

  return (
    <div className={styles.verificationContainer}>
      {isLoading ? (
        <div className={styles.loadingMessage}>در حال تایید پرداخت...</div>
      ) : error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : (
        <div className={styles.successMessage}>در حال انتقال به صفحه‌ی وضعیت پرداخت...</div>
      )}
    </div>
  );
} 

export default PaymentVerification;