import { query } from './db';
import { Handler } from '@netlify/functions';
import { Order, OrderStatus } from '@/types/Order';

interface UpdateStatusData {
  status: OrderStatus;
}

interface DatabaseOrder {
  id: number;
  user_id: number;
  created_at: string;
  total: number;
  status: OrderStatus;
  payment_method: string;
  shipping_address?: string;
  user_name?: string;
  user_email?: string;
}

interface DatabaseOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'PATCH') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  const orderId = event.queryStringParameters?.id;
  
  if (!orderId || !event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'شناسه سفارش و وضعیت جدید الزامی است' })
    };
  }

  try {
    const { status } = JSON.parse(event.body) as UpdateStatusData;
    const validStatuses: OrderStatus[] = ['processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'وضعیت نامعتبر' })
      };
    }

    // 1. آپدیت وضعیت سفارش
    const orderResult = await query<DatabaseOrder>(
      `UPDATE orders 
       SET status = $1 
       WHERE id = $2 
       RETURNING *`,
      [status, orderId]
    );

    if (orderResult.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'سفارش یافت نشد' })
      };
    }

    // 2. دریافت آیتم‌های سفارش
    const itemsResult = await query<DatabaseOrderItem>(
      `SELECT * FROM order_items 
       WHERE order_id = $1`,
      [orderId]
    );

    // 3. تبدیل به ساختار TypeScript
    const dbOrder = orderResult.rows[0];
    const response: Order = {
      id: dbOrder.id,
      userId: dbOrder.user_id,
      date: dbOrder.created_at,
      total: dbOrder.total,
      status: dbOrder.status,
      paymentMethod: dbOrder.payment_method,
      shippingAddress: dbOrder.shipping_address,
      items: itemsResult.rows.map(dbItem => ({
        id: dbItem.id,
        orderId: dbItem.order_id,
        productId: dbItem.product_id,
        quantity: dbItem.quantity,
        price: dbItem.price
      })),
      userName: dbOrder.user_name,
      userEmail: dbOrder.user_email
    };

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Update error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'خطا در به‌روزرسانی سفارش',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };