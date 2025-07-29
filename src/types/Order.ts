export interface OrderItem {
    productId: number;
    quantity: number;
    price: number;
  }
  

  type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';


export interface Order {
    id: number;
    userId: number;
    date: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    paymentMethod: string;
    shippingAddress?: string;
  }
  