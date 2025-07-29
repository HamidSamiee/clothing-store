import React from 'react';
import styles from './CartItem.module.css';
import { CartItemProps } from '@/types/Cart';


const CartItem: React.FC<CartItemProps> = ({
  item,
  onRemove,
  onQuantityChange,
  className = ''
}) => {
  return (
    <div className={`${styles.cartItem} ${className}`}>
      <div className={styles.itemImage}>
        <img src={item.image} alt={item.name} />
      </div>
      
      <div className={styles.itemDetails}>
        <h3>{item.name}</h3>
        <p>قیمت: {item.price.toLocaleString()} تومان</p>
        {item.size && <p>سایز: {item.size}</p>}
        {item.color && <p>رنگ: {item.color}</p>}
      </div>

      <div className={styles.quantityControls}>
        <button onClick={() => onQuantityChange(item.quantity - 1)} disabled={item.quantity <= 1}>
          -
        </button>
        <span>{item.quantity}</span>
        <button onClick={() => onQuantityChange(item.quantity + 1)}>
          +
        </button>
      </div>

      <button onClick={onRemove} className={styles.removeButton}>
        حذف
      </button>
    </div>
  );
};

export default CartItem;