export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

export interface CartItemProps {
  item: CartItem;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
  className?: string;
}