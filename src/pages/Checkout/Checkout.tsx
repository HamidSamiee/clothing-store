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
import {  OrderItem } from '@/types/Order';


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
  const { isAuthenticated, user: currentUser } = useAuth();
  const { items: cartItems, total: cartTotal } = useCart();
  const { initiatePayment, isLoading } = usePayment();
  const [isProcessing, setIsProcessing] = useState(false);

  const [step, setStep] = useState<'auth' | 'address' | 'delivery' | 'payment'>('auth');
  const [address, setAddress] = useState<Address | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<string>('');

  const handlePayment = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const orderItems: OrderItem[] = cartItems.map(item => ({
        productId: Number(item.id),
        quantity: item.quantity,
        price: item.price,
        orderId: 0,
        id: 0
      }));
  
      const orderData = {
        userId: Number(currentUser!.id),
        items: orderItems,
        total: cartTotal,
        paymentMethod: 'zarinpal',
        shippingAddress: `${address!.street}, ${address!.city}`
      };
  
      await initiatePayment(
        cartTotal,
        `پرداخت سفارش #${Date.now()}`,
        orderData
      );
    } catch (error) {
      let errorMessage = 'خطا در پرداخت';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // نمایش جزئیات بیشتر برای خطاهای خاص
        if (error.message.includes('داده‌های سفارش ناقص')) {
          errorMessage = 'اطلاعات سفارش کامل نیست. لطفا دوباره تلاش کنید';
        } else if (error.message.includes('اتصال اینترنت')) {
          errorMessage = 'مشکل در اتصال به اینترنت. لطفا ارتباط شبکه را بررسی کنید';
        }
      }
  
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
  
      console.error('Checkout error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

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
            <h3>{t('checkout.orderItems')} ({cartItems.length})</h3>
            <ul className={styles.itemsList}>
              {cartItems.map(item => (
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
              <span>{cartTotal.toLocaleString()} {t('product.currency')}</span>
            </div>
          </div>
          
          <button 
            onClick={handlePayment} 
            className={styles.paymentButton}  
            disabled={isLoading || isProcessing}
          >
            {(isLoading || isProcessing) ? 'در حال پردازش...' : 'پرداخت'}
          </button>
      </div>
    </div>
  );
};

export default Checkout;