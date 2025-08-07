// src/pages/PaymentSuccess/PaymentSuccess.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './PaymentSuccess.module.css';
import { FaCheckCircle } from 'react-icons/fa';
import { useEffect } from 'react';

interface PaymentData {
    amount?: number;
    authority?: string;
}

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const paymentData = location.state as PaymentData || {};
    useEffect(() => {
        localStorage.removeItem('zarinpalPayment');
      }, []);
      
    return (
        <div className={styles.container}>
            <FaCheckCircle className={styles.successIcon} />
            <h1 className={styles.title}>پرداخت موفقیت‌آمیز بود</h1>
            <p className={styles.message}>سفارش شما با موفقیت ثبت شد</p>
            
            <div className={styles.details}>
                <div className={styles.detailItem}>
                    <span>مبلغ پرداختی:</span>
                    <span>{paymentData.amount ? paymentData.amount.toLocaleString() : '---'} تومان</span>
                </div>
                <div className={styles.detailItem}>
                    <span>کد پیگیری:</span>
                    <span>{paymentData.authority || '---'}</span>
                </div>
            </div>

            <button 
                className={styles.button}
                onClick={() => navigate('/')}
            >
                بازگشت به صفحه اصلی
            </button>
        </div>
    );
};

export default PaymentSuccess;