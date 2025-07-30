// src/pages/Checkout/Checkout.tsx
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '@/hooks/usePayment';
import styles from './Checkout.module.css';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import AddressForm from '@/components/AddressForm/AddressForm';
import DeliveryMethod from '@/components/DeliveryMethod/DeliveryMethod';
import { toPersianNumbers } from '@/utils/toPersianNumbers';
import { toast } from 'react-toastify';

interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  firstName: string;
  lastName: string;
  phone: string;
}




const Checkout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // Removed unused 'user' variable
  const { items, total } = useCart();
  const { initiatePayment } = usePayment();
  const [step, setStep] = useState<'auth' | 'address' | 'delivery' | 'payment'>('auth');
  const [address, setAddress] = useState<Address | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<string>('');

  const steps = [
    { id: 'auth', label: t('checkout.authStep') },
    { id: 'address', label: t('checkout.addressStep') },
    { id: 'delivery', label: t('checkout.deliveryStep') },
    { id: 'payment', label: t('checkout.paymentStep') }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      setStep('auth');
    } else if (!address) {
      setStep('address');
    } else if (!deliveryMethod) {
      setStep('delivery');
    } else {
      setStep('payment');
    }
  }, [isAuthenticated, address, deliveryMethod]);

  const getActiveStepIndex = () => {
    return steps.findIndex(s => s.id === step);
  };

  const renderStepper = () => {
    const activeIndex = getActiveStepIndex();
    
    return (
      <div className={styles.checkoutStepper}>
        <div className={styles.stepperLine}>
          <div 
            className={styles.stepperLineProgress} 
            style={{ 
              width: `${(activeIndex / (steps.length - 1)) * 100}%` 
            }} 
          />
        </div>
        
        {steps.map((stepItem, index) => {
          const isActive = stepItem.id === step;
          const isCompleted = index < activeIndex;
          const isAuthStep = stepItem.id === 'auth';
          
          if (isAuthStep && isAuthenticated) return null;
          
          return (
            <div key={stepItem.id} className={styles.stepperStep}>
              <div 
                className={`${styles.stepperNumber} ${
                  isActive ? styles.active : isCompleted ? styles.completed : ''
                }`}
              >
                {isCompleted ? '✓' : toPersianNumbers(index + 1)}
              </div>
              <div 
                className={`${styles.stepperLabel} ${
                  isActive ? styles.active : isCompleted ? styles.completed : ''
                }`}
              >
                {stepItem.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleProceedToLogin = () => {
    navigate('/login', { state: { from: '/checkout' } });
  };

  const handleAddressSubmit = (addressData: Address) => {
    setAddress(addressData);
    setStep('delivery');
  };

  const handleDeliverySelect = (method: string) => {
    setDeliveryMethod(method);
  };

  const handlePayment = async () => {
    try {
      await initiatePayment(10000, 'پرداخت سفارش');
    } catch  {
      toast.error('خطا در اتصال به درگاه پرداخت');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.checkoutContainer}>
        {renderStepper()}
        <h1 className={styles.checkoutTitle}>{t('checkout.authRequired')}</h1>
        <p className={styles.authMessage}>{t('checkout.loginToContinue')}</p>
        <button onClick={handleProceedToLogin} className={styles.authButton}>
          {t('checkout.goToLogin')}
        </button>
      </div>
    );
  }

  if (step === 'address') {
    return (
      <div className={styles.checkoutContainer}>
        {renderStepper()}
        <h1 className={styles.checkoutTitle}>{t('checkout.shippingAddress')}</h1>
        <AddressForm onSubmit={handleAddressSubmit} />
      </div>
    );
  }

  if (step === 'delivery') {
    return (
      <div className={styles.checkoutContainer}>
        {renderStepper()}
        <h1 className={styles.checkoutTitle}>{t('checkout.deliveryMethod')}</h1>
        <DeliveryMethod 
          onSelect={handleDeliverySelect} 
          selectedMethod={deliveryMethod}
        />
        <div className={styles.containerContinueBtn}>
            <button 
              onClick={() => setStep('payment')} 
              className={styles.continueButton}
              disabled={!deliveryMethod}
            >
              {t('checkout.continueToPayment')}
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      {renderStepper()}

      <h1 className={styles.checkoutTitle}>{t('checkout.reviewOrder')}</h1>
      <div className={styles.containerContinueBtn}>
          <div className={styles.orderSummary}>
            <h3>{t('checkout.orderItems')} ({items.length})</h3>
            <ul className={styles.itemsList}>
              {items.map(item => (
                <li key={item.id} className={styles.item}>
                  <span>{item.name}</span>
                  <span>{item.quantity} × {item.price.toLocaleString()} {t('product.currency')}</span>
                </li>
              ))}
            </ul>
            
            <div className={styles.shippingInfo}>
              <h3>{t('checkout.shippingAddress')}</h3>
              <p>{address?.street}, {address?.city}, {address?.postalCode}</p>
            </div>
            
            <div className={styles.deliveryInfo}>
              <h3>{t('checkout.deliveryMethod')}</h3>
              <p>{deliveryMethod}</p>
            </div>
            
            <div className={styles.totalAmount}>
              <h3>{t('cart.total')}:</h3>
              <span>{total.toLocaleString()} {t('product.currency')}</span>
            </div>
          </div>
          
          <button onClick={handlePayment} className={styles.paymentButton}>
            {t('checkout.payWithZarinpal')}
          </button>
      </div>
    </div>
  );
};

export default Checkout;