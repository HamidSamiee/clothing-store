// netlify/functions/createOrder.ts
import { Handler } from '@netlify/functions';
import { getClient } from './db';
import { OrderItem } from '@/types/Order';

interface CreateOrderRequest {
  userId: number;
  items: OrderItem[]; // تعریف صریح نوع items
  total: number;
  paymentMethod: string;
  shippingAddress?: string;
}

const handler: Handler = async (event) => {
  const client = await getClient();
  
  try {
    // اعتبارسنجی وجود body
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'بدون داده' })
      };
    }

    const { userId, items, total, paymentMethod, shippingAddress } = 
      JSON.parse(event.body) as CreateOrderRequest;

    // اعتبارسنجی items
    if (!Array.isArray(items)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'آیتم‌های سفارش باید به صورت آرایه ارسال شوند' })
      };
    }

    await client.query('BEGIN');
    
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, status, payment_method, shipping_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [userId, total, 'processing', paymentMethod, shippingAddress || null]
    );

    const orderId = orderResult.rows[0].id;

    // ثبت آیتم‌های سفارش
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.productId, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');

    return {
      statusCode: 201,
      body: JSON.stringify({ 
        success: true,
        orderId
      })
    };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create order error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'خطای سرور در ایجاد سفارش',
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    };
  } finally {
    client.release();
  }
};

export { handler };