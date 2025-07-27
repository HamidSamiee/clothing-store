// src/components/CartItem/CartItem.tsx
import { useTranslation } from 'react-i18next';
import styles from './CartItem.module.css';
import { CartItem as CartItemType } from '@/types/Cart';

interface CartItemProps {
  item: CartItemType;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
}

const CartItem = ({ item, onRemove, onQuantityChange }: CartItemProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.cartItem}>
      <div className={styles.itemImage}>
        <img src={item.image} alt={item.name} />
      </div>
      
      <div className={styles.itemDetails}>
        <h3 className={styles.itemName}>{item.name}</h3>
        <span className={styles.itemPrice}>
          {item.price.toLocaleString()} {t('product.currency')}
        </span>
      </div>
      
      <div className={styles.quantityControl}>
        <button 
          onClick={() => onQuantityChange(item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          -
        </button>
        <span>{item.quantity}</span>
        <button onClick={() => onQuantityChange(item.quantity + 1)}>
          +
        </button>
      </div>
      
      <button 
        className={styles.removeItem}
        onClick={onRemove}
      >
        {t('cart.remove')}
      </button>
    </div>
  );
};

export default CartItem;