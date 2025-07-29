// src/contexts/CartContext.tsx
import { CartItem } from '@/types/Cart';
import { createContext} from 'react';



interface CartContextType {
  items: CartItem[];
  total: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (uniqueKey: string) => void;
  updateQuantity: (uniqueKey: string, quantity: number) => void;
  clearCart: () => void;
  getUniqueKey: (item: CartItem) => string;
}


export const CartContext = createContext<CartContextType | null>(null);



