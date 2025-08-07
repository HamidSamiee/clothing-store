import { OrderProductResponse, OrderStatus } from "@/types/Order";
import { Product, RawProduct } from "@/types/Product";
import http from "./httpService";

const ORDERS_KEY = "ecommerce_orders";
const PRODUCTS_KEY = "ecommerce_products";

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
  try {
    const response = await http.get<{data: ApiOrder[], total: number}>('/.netlify/functions/getOrders', {
      params: {
        _page: params?.page,
        _limit: params?.perPage,
        q: params?.search,
        userId: params?.userId
      }
    });

    // اعتبارسنجی کامل پاسخ سرور
    if (!response.data || !Array.isArray(response.data.data)) {
      throw new Error('Invalid response format from server');
    }

    const transformedData: OrderResponse[] = response.data.data.map((order) => {
      // اعتبارسنجی آیتم‌ها
      const safeItems = Array.isArray(order.items) ? order.items : [];
      
      return {
        id: order.id,
        userId: order.user_id,
        date: order.created_at,
        total: order.total,
        status: order.status,
        paymentMethod: order.payment_method,
        shippingAddress: order.shipping_address || undefined,
        items: safeItems.map(item => ({
          id: item.id,
          orderId: order.id,  
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        userName: order.user_name || undefined,
        userEmail: order.user_email || undefined
      };
    });
    
    return {
      data: transformedData,
      total: response.data.total || 0 // مقدار پیش‌فرض برای total
    };
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    // بازگرداندن ساختار خالی در صورت خطا
    return {
      data: [],
      total: 0
    };
  }
};


export const getOrdersByUser = async (userId: number): Promise<Order[]> => {
  const orders: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  return orders.filter((order) => order.userId === userId);
};

// export const createOrder = async (orderData: Omit<Order, "id">): Promise<Order> => {
//   const orders: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");

//   const newOrder: Order = {
//     ...orderData,
//     id: Date.now(),
//   };

//   // کاهش موجودی محصولات
//   const products: Product[] = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "[]");
//   orderData.items.forEach((item: OrderItem) => {
//     const productIndex = products.findIndex((p) => Number(p.id) === item.productId);
//     if (productIndex !== -1) {
//       products[productIndex].stock -= item.quantity;
//     }
//   });

//   localStorage.setItem(ORDERS_KEY, JSON.stringify([...orders, newOrder]));
//   localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

//   // اضافه کردن سفارش به کاربر
//   const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
//   const userIndex = users.findIndex((u) => u.id === orderData.userId);
//   if (userIndex !== -1) {
//     users[userIndex].orders = [...(users[userIndex].orders || []), newOrder.id];
//     localStorage.setItem(USERS_KEY, JSON.stringify(users));

//     // به‌روزرسانی کاربر جاری
//     const currentUser: User = JSON.parse(localStorage.getItem("user") || "{}");
//     if (currentUser.id === orderData.userId) {
//       localStorage.setItem("user", JSON.stringify(users[userIndex]));
//     }
//   }

//   return newOrder;
// };

import { Order, OrderItem } from '@/types/Order';

interface CreateOrderResponse {
  success: boolean;
  data?: Order;
  message?: string;
}

export const createOrder = async (orderData: {
  userId: number;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  shippingAddress?: string;
}): Promise<CreateOrderResponse> => {
  try {
    const response = await fetch('/.netlify/functions/createOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, message: data.message || 'خطا در ثبت سفارش' };
    }
  } catch (error) {
    console.error('خطا در ایجاد سفارش:', error);
    return { success: false, message: 'خطا در ارتباط با سرور' };
  }
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

export const updateOrderStatus = async (orderId: number, newStatus: OrderStatus): Promise<Order> => {
  try {
    const response = await http.patch<Order>(
      '/.netlify/functions/updateOrderStatus',
      { status: newStatus },
      { params: { id: orderId } }
    );
    
    if (!response.data?.id) {
      throw new Error('پاسخ نامعتبر از سرور');
    }

    return {
      ...response.data,
      // تبدیل نوع برای فیلدهای عددی
      items: response.data.items?.map(item => ({
        ...item,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 0
      })) || []
    };
  } catch (error) {
    console.error('Update error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'خطا در به‌روزرسانی وضعیت سفارش'
    );
  }
};


export const getOrderDetails = async (orderId: number): Promise<Order> => {
  const response = await http.get(`/orders/${orderId}`);
  return response.data;
};

// export const getProductsForOrder = async (orderId: number): Promise<Product[]> => {
//   // دریافت سفارش
//   const orderResponse = await http.get(`/orders/${orderId}`);
//   const order: Order = orderResponse.data;
  
//   // دریافت اطلاعات محصولات
//   const productIds = order.items.map(item => item.productId);
//   // console.log(productIds)
//   const productsResponse = await http.get('/products', {
//     params: {
//       id: productIds
//     }
//   });
// //  console.log(productsResponse)
  
//   return productsResponse.data;
// };

// services/orderService.ts
// export const getProductsByIds = async (ids: number[]): Promise<Product[]> => {
//   const uniqueIds = Array.from(new Set(ids)); // حذف تکراری‌ها
//   const response = await http.get('/products', {
//     params: { id: uniqueIds }
//   });
//   return response.data;
// };

// services/orderService.ts

export const getProductsForOrder = async (orderId: number): Promise<Product[]> => {
  try {
    const response = await http.get<OrderProductResponse[]>(`/.netlify/functions/getProductsForOrder?id=${orderId}`);
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('فرمت پاسخ سرور نامعتبر است');
    }

    return response.data.map((item: OrderProductResponse) => {
      const baseProduct: Product = {
        id: item.id.toString(),
        name: item.name || 'نامشخص',
        price: Number(item.order_price || item.price) || 0,
        description: item.description || '',
        category: item.category || 'دسته‌بندی نشده',
        image: item.image || '/default-product.jpg',
        rating: Math.min(5, Math.max(0, Number(item.rating) || 0)),
        sizes: Array.isArray(item.sizes) ? item.sizes.filter(Boolean) : [],
        colors: Array.isArray(item.colors) ? item.colors.filter(Boolean) : [],
        stock: Math.max(0, Number(item.stock) || 0),
        specifications: item.specifications || {},
      };

      // فیلدهای اختیاری
      if (item.discount) {
        return {
          ...baseProduct,
          discount: Number(item.discount)
        };
      }
      return baseProduct;
    });
  } catch (error) {
    console.error('Error fetching order products:', error);
    return [];
  }
};

export const getProductsByIds = async (ids: (number | string)[]): Promise<Product[]> => {
  try {
    // 1. اعتبارسنجی و تبدیل IDs
    const validIds = (Array.isArray(ids) ? ids : [])
      .map(id => String(id)) // تبدیل همه به رشته برای اطمینان
      .filter(id => id.trim() !== ''); // حذف مقادیر خالی

    if (validIds.length === 0) return [];

    // 2. درخواست به سرور
    const response = await http.get<RawProduct | RawProduct[]>(`/.netlify/functions/getProductsByIds`, {
      params: { ids: validIds.join(',') }
    });

    // 3. پردازش پاسخ سرور
    if (!response?.data) return [];

    const rawProducts = Array.isArray(response.data) ? response.data : [response.data];

    // 4. تبدیل به Product[]
    return rawProducts.map((item): Product => {
      // تبدیل فیلدهای اصلی
      const product: Product = {
        id: String(item.id ?? ''),
        name: item.name ?? 'نامشخص',
        price: Number(item.price) || 0,
        description: item.description ?? '',
        category: item.category ?? 'دسته‌بندی نشده',
        image: item.image ?? '/default-product.jpg',
        rating: Math.min(5, Math.max(0, Number(item.rating) || 0)), // محدود به بازه 0-5
        sizes: Array.isArray(item.sizes) ? item.sizes : 
              typeof item.sizes === 'string' ? [item.sizes] : [],
        colors: Array.isArray(item.colors) ? item.colors : 
               typeof item.colors === 'string' ? [item.colors] : [],
        stock: Math.max(0, Number(item.stock) || 0) // حداقل 0
      };

      // فیلدهای اختیاری
      if (item.discount) product.discount = Number(item.discount);
      if (item.specifications) product.specifications = item.specifications;
      if (item.featured) product.featured = Boolean(item.featured);
      if (item.shareUrl) product.shareUrl = String(item.shareUrl);

      // پردازش reviews اگر وجود دارد
      if (item.reviews) {
        try {
          product.reviews = typeof item.reviews === 'string' ? 
            JSON.parse(item.reviews) : 
            item.reviews;
        } catch {
          product.reviews = [];
        }
      }

      // محاسبه averageRating اگر وجود ندارد
      product.averageRating = product.reviews?.length ? 
        product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length :
        product.rating;

      return product;
    });

  } catch (error) {
    console.error('Error fetching products by IDs:', error);
    return [];
  }
};