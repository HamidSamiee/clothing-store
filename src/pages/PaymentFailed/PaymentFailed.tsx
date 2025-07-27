// src/pages/PaymentFailed/PaymentFailed.tsx
import { useNavigate } from 'react-router-dom';
import styles from './PaymentFailed.module.css';
import { FaTimesCircle } from 'react-icons/fa';

const PaymentFailed = () => {
    const navigate = useNavigate();

    const handleRetry = () => {
        navigate('/checkout');
    };

    const handleHome = () => {
        navigate('/');
    };

    return (
        <div className={styles.container}>
            <FaTimesCircle className={styles.failedIcon} />
            <h1 className={styles.title}>پرداخت ناموفق بود</h1>
            <p className={styles.message}>
                متأسفیم! پرداخت شما تکمیل نشد. می‌توانید مجدداً تلاش کنید یا به صفحه اصلی بازگردید.
            </p>
            
            <div className={styles.buttonGroup}>
                <button 
                    className={styles.retryButton}
                    onClick={handleRetry}
                >
                    تلاش مجدد
                </button>
                <button 
                    className={styles.homeButton}
                    onClick={handleHome}
                >
                    صفحه اصلی
                </button>
            </div>
        </div>
    );
};

export default PaymentFailed;