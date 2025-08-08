import { ReactNode, useEffect, useState } from "react";
import { CartContext } from "./CartContext";
import { CartItem } from "@/types/Cart";

const CART_STORAGE_KEY = "cart_items";

export const CartProvider = ({ children }: { children: ReactNode }) => {

  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed?.items) ? parsed.items : [];
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("خطا در ذخیره سبد خرید:", error);
    }
  }, [items]);

  // محاسبه ایمن مجموع
  const total = Array.isArray(items)
    ? items.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
      )
    : 0;

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
