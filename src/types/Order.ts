export interface OrderItem {
    id: number;
    order_id: number;
    productId: number;
    quantity: number;
    price: number;
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
    created_at: string;
  }
  