// src/components/DeliveryMethod/DeliveryMethod.tsx
import { useTranslation } from 'react-i18next';
import styles from './DeliveryMethod.module.css';

interface DeliveryMethodProps {
  onSelect: (method: string) => void;
  selectedMethod: string;
}

const DeliveryMethod = ({ onSelect, selectedMethod }: DeliveryMethodProps) => {
  const { t } = useTranslation();
  const methods = [
    { id: 'express', name: t('checkout.expressDelivery'), price: 50000 },
    { id: 'standard', name: t('checkout.standardDelivery'), price: 25000 },
    { id: 'pickup', name: t('checkout.storePickup'), price: 0 }
  ];

  return (
    <div className={styles.deliveryMethods}>
      {methods.map(method => (
        <div 
          key={method.id}
          className={`${styles.method} ${selectedMethod === method.id ? styles.selected : ''}`}
          onClick={() => onSelect(method.id)}
        >
          <input
            type="radio"
            id={method.id}
            name="deliveryMethod"
            checked={selectedMethod === method.id}
            onChange={() => {}}
          />
          <label htmlFor={method.id}>
            <span className={styles.methodName}>{method.name}</span>
            <span className={styles.methodPrice}>
              {method.price > 0 
                ? `${method.price.toLocaleString()} ${t('product.currency')}`
                : t('checkout.free')
              }
            </span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default DeliveryMethod;