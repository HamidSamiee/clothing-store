import { Order, OrderItem, OrderStatus } from "@/types/Order";
import { Product } from "@/types/Product";
import { User } from "@/types/User";
import http from "./httpService";

const ORDERS_KEY = "ecommerce_orders";
const PRODUCTS_KEY = "ecommerce_products";
const USERS_KEY = "users";

export interface GetOrdersParams {
  page?: number;
  perPage?: number;
  search?: string;
  userId?: number | string; 
}

interface ApiOrder {
  id: number;
  user_id: number;
  created_at: string;
  total: number;
  status: OrderStatus;
  payment_method: string;
  shipping_address?: string;
  items: Array<{
    id: number;
    product_id: number;
    quantity: number;
    price: number;
  }>;
  user_name?: string;
  user_email?: string;
}

export interface OrderResponse extends Order {
  userName?: string;
  userEmail?: string;
}

export const getOrders = async (params?: GetOrdersParams): Promise<{data: OrderResponse[], total: number}> => {
  const response = await http.get<{data: ApiOrder[], total: number}>('/.netlify/functions/getOrders', {
    params: {
      _page: params?.page,
      _limit: params?.perPage,
      q: params?.search,
      userId: params?.userId
    }
  });
  

const transformedData: OrderResponse[] = response.data.data.map((order) => ({
  id: order.id,
  userId: order.user_id,
  date: order.created_at,
  total: order.total,
  status: order.status,
  paymentMethod: order.payment_method,
  shippingAddress: order.shipping_address || undefined,
  items: order.items.map(item => ({
    id: item.id,
    orderId: order.id,  
    productId: item.product_id,
    quantity: item.quantity,
    price: item.price
  })),
  userName: order.user_name || undefined,
  userEmail: order.user_email || undefined
}));
  
  return {
    data: transformedData,
    total: response.data.total
  };
};


export const getOrdersByUser = async (userId: number): Promise<Order[]> => {
  const orders: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  return orders.filter((order) => order.userId === userId);
};

export const createOrder = async (orderData: Omit<Order, "id">): Promise<Order> => {
  const orders: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");

  const newOrder: Order = {
    ...orderData,
    id: Date.now(),
  };

  // کاهش موجودی محصولات
  const products: Product[] = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "[]");
  orderData.items.forEach((item: OrderItem) => {
    const productIndex = products.findIndex((p) => Number(p.id) === item.productId);
    if (productIndex !== -1) {
      products[productIndex].stock -= item.quantity;
    }
  });

  localStorage.setItem(ORDERS_KEY, JSON.stringify([...orders, newOrder]));
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

  // اضافه کردن سفارش به کاربر
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const userIndex = users.findIndex((u) => u.id === orderData.userId);
  if (userIndex !== -1) {
    users[userIndex].orders = [...(users[userIndex].orders || []), newOrder.id];
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // به‌روزرسانی کاربر جاری
    const currentUser: User = JSON.parse(localStorage.getItem("user") || "{}");
    if (currentUser.id === orderData.userId) {
      localStorage.setItem("user", JSON.stringify(users[userIndex]));
    }
  }

  return newOrder;
};

export const cancelOrder = async (orderId: number): Promise<void> => {
  const orders: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  const orderIndex = orders.findIndex((o) => o.id === orderId);

  if (orderIndex === -1) {
    throw new Error("سفارش یافت نشد");
  }

  // برگشت موجودی محصولات
  const products: Product[] = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "[]");
  orders[orderIndex].items.forEach((item: OrderItem) => {
    const productIndex = products.findIndex((p) => Number(p.id) === item.productId);
    if (productIndex !== -1) {
      products[productIndex].stock += item.quantity;
    }
  });

  // به‌روزرسانی وضعیت سفارش
  orders[orderIndex].status = "cancelled";

  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};


// interface GetOrdersParams {
//   page?: number;
//   perPage?: number;
//   search?: string;
// }

// export const getOrders = async (params?: GetOrdersParams): Promise<{data: Order[], total: number}> => {
//   const response = await http.get('/orders', {
//     params: {
//       _page: params?.page,
//       _limit: params?.perPage,
//       q: params?.search,
//       _expand: 'user' // اگر نیاز به اطلاعات کاربر دارید
//     }
//   });
  
//   return {
//     data: response.data,
//     total: parseInt(response.headers['x-total-count'] || '0', 10)
//   };
// };


// export const updateOrderStatus = async (orderId: number, newStatus: string): Promise<Order> => {
//   const response = await http.patch(`/orders/${orderId}`, { status: newStatus });
//   return response.data;
// };

export const updateOrderStatus = async (orderId: number, newStatus: string): Promise<Order> => {
  try {
    const response = await http.patch(
      '/.netlify/functions/updateOrderStatus',
      { status: newStatus },
      { params: { id: orderId } }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const getOrderDetails = async (orderId: number): Promise<Order> => {
  const response = await http.get(`/orders/${orderId}`);
  return response.data;
};

export const getProductsForOrder = async (orderId: number): Promise<Product[]> => {
  // دریافت سفارش
  const orderResponse = await http.get(`/orders/${orderId}`);
  const order: Order = orderResponse.data;
  
  // دریافت اطلاعات محصولات
  const productIds = order.items.map(item => item.productId);
  // console.log(productIds)
  const productsResponse = await http.get('/products', {
    params: {
      id: productIds
    }
  });
//  console.log(productsResponse)
  
  return productsResponse.data;
};

// services/orderService.ts
// export const getProductsByIds = async (ids: number[]): Promise<Product[]> => {
//   const uniqueIds = Array.from(new Set(ids)); // حذف تکراری‌ها
//   const response = await http.get('/products', {
//     params: { id: uniqueIds }
//   });
//   return response.data;
// };

// services/orderService.ts
export const getProductsByIds = async (ids: (number | string)[]): Promise<Product[]> => {
  const uniqueIds = Array.from(new Set(ids)); // حذف تکراری‌ها
  const response = await http.get(`/.netlify/functions/getProductsByIds`, {
    params: {
      ids: uniqueIds.join(',') // ارسال به صورت رشته‌ای جدا شده با کاما
    }
  });
  return response.data;
};