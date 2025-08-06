export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
}

export interface OrderData {
  userId: number;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  shippingAddress?: string;
}  

export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: number;
  userId: number;
  date: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  shippingAddress?: string;
  userName?: string;
  userEmail?: string;
}
  
export interface OrderProductResponse {
  id: number;
  name: string;
  price: number | string;
  order_price?: number | string;
  description?: string;
  category?: string;
  image?: string;
  rating?: number | string;
  sizes?: string[];
  colors?: string[];
  stock?: number | string;
  order_quantity?: number;
  specifications?: Record<string, string>;
  discount?: number | string;
}