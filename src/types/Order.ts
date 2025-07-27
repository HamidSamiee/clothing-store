export interface OrderItem {
    productId: number;
    quantity: number;
    price: number;
  }
  
export interface Order {
    id: number;
    userId: number;
    date: string;
    items: OrderItem[];
    total: number;
    status: "درحال پردازش" | "ارسال شده" | "تحویل داده شد" | "لغو شد";
    paymentMethod: string;
  }
  