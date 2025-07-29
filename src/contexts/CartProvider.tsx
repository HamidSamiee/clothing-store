import { ReactNode, useState } from "react";
import { CartContext } from "./CartContext";
import { CartItem } from "@/types/Cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // تابع برای ایجاد کلید یکتا ترکیبی
  const getUniqueKey = (item: CartItem) => `${item.id}_${item.size ?? ''}_${item.color ?? ''}`;

  const addToCart = (item: CartItem) => {
    const key = getUniqueKey(item);
    setItems((prevItems) => {
      const existingItem = prevItems.find(i => getUniqueKey(i) === key);
      if (existingItem) {
        return prevItems.map(i =>
          getUniqueKey(i) === key
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prevItems, item];
    });
  };

  const removeFromCart = (uniqueKey: string) => {
    setItems((prevItems) => prevItems.filter(item => getUniqueKey(item) !== uniqueKey));
  };

  const updateQuantity = (uniqueKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(uniqueKey);
      return;
    }
    setItems((prevItems) =>
      prevItems.map(item =>
        getUniqueKey(item) === uniqueKey ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getUniqueKey,       
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
