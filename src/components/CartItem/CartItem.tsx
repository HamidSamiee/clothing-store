// src/components/CartItem/CartItem.tsx
import styles from './CartItem.module.css';
import { toPersianNumbers, toPersianNumbersWithComma } from '@/utils/toPersianNumbers';

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    size?: string;
    color?: string;
  };
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
  className?: string;
}

const CartItem = ({
  item,
  onRemove,
  onQuantityChange,
  className = ''
}: CartItemProps) => {


  return (
    <div className={`${styles.cartItem} ${className}`}>
      <div className={styles.itemImage}>
        <img src={item.image} alt={item.name} />
      </div>
      
      <div className={styles.itemDetails}>
        <h3>{item.name}</h3>
        {item.size && <p>سایز: {item.size}</p>}
        {item.color && <p>رنگ: {item.color}</p>}
        <div className={styles.price}>قیمت: {toPersianNumbersWithComma(item.price)} تومان</div>
      </div>
      
      <div className={styles.quantityControl}>
        <div className={styles.quantitySection}>
              <div className={styles.quantityControl2}>
                  <button 
                      className={styles.quantityButton}
                      onClick={() => onQuantityChange(item.quantity + 1)}
                  >
                      +
                  </button>
                  <span className={styles.quantityNumber}>{toPersianNumbers(item.quantity)}</span>
                  <button 
                      className={styles.quantityButton}
                      onClick={() => onQuantityChange(item.quantity - 1)}
                      disabled={item.quantity <= 1}
                  >
                      -
                  </button>
              </div>
        </div>
        
        <button 
          onClick={onRemove}
          className={styles.removeButton}
        >
          حذف
        </button>
      </div>
      
      <div className={styles.itemTotal}>
        مجموع: {toPersianNumbersWithComma(item.price * item.quantity)} تومان
      </div>
    </div>
  );
};

export default CartItem;
