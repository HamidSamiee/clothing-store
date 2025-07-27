import { ReactNode, useState } from "react";
import { CartContext } from "./CartContext";
import { CartItem } from "@/types/Cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);
  
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  
    const addToCart = (item: Omit<CartItem, 'quantity'>) => {
      setItems((prevItems) => {
        const existingItem = prevItems.find((i) => i.id === item.id);
        
        if (existingItem) {
          return prevItems.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        
        return [...prevItems, { ...item, quantity: 1 }];
      });
    };
  
    const removeFromCart = (id: string) => {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };
  
    const updateQuantity = (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(id);
        return;
      }
  
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity } : item
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
        }}
      >
        {children}
      </CartContext.Provider>
    );
  };