// src/components/CartItem/CartItem.tsx
import { useState } from 'react';
import styles from './CartItem.module.css';
import { useCart } from '@/hooks/useCart';
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
}

const CartItem = ({ item }: CartItemProps) => {
  const { removeFromCart, updateQuantity } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value);
    setQuantity(newQuantity);
    updateQuantity(item.id, newQuantity);
  };

  return (
    <div className={styles.cartItem}>
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
          min="1"
          value={quantity}
          onChange={handleQuantityChange}
          className={styles.quantityInput}
        />
        
        <button 
          onClick={() => removeFromCart(item.id)}
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