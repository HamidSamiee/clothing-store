// src/components/CartItem/CartItem.tsx
import { useState, useEffect } from 'react';
import styles from './CartItem.module.css';
import { toPersianNumbersWithComma } from '@/utils/toPersianNumbers';

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
  const [quantity, setQuantity] = useState(item.quantity);

  // اگر مقدار quantity در props تغییر کرد، state هم آپدیت شود
  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newQuantity = parseInt(e.target.value);
    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1;
    }
    setQuantity(newQuantity);
    onQuantityChange(newQuantity);
  };

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
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={handleQuantityChange}
          className={styles.quantityInput}
        />
        
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
