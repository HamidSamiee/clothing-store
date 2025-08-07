// components/PaymentVerification.tsx
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
        const result = await verifyPayment(authority, status);
        // console.log(result)
        if (result.success) {
          navigate('/payment-success', { 
            state: { 
              orderId: result.orderId,
              amount: result.amount,
              authority: result.authority
            } 
          });
        } else {
          navigate('/payment-failed', {
            state: {
              error: result.error
            }
          });
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
        <div className={styles.loadingMessage}>در حال تایید پرداخت و ثبت سفارش...</div>
      ) : error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : (
        <div className={styles.successMessage}>در حال انتقال به صفحه‌ی وضعیت پرداخت...</div>
      )}
    </div>
  );
};

export default PaymentVerification;