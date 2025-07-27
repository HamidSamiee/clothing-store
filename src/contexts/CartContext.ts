// src/contexts/CartContext.tsx
import { CartItem } from '@/types/Cart';
import { createContext} from 'react';



interface CartContextType {
  items: CartItem[];
  total: number;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType | null>(null);



