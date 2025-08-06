// netlify/functions/createOrder.ts
import { Handler } from '@netlify/functions';
import { getClient } from './db';

interface CreateOrderRequest {
  userId: number;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: string;
  shippingAddress?: string;
}

export const handler: Handler = async (event) => {
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

    // اعتبارسنجی مقادیر اجباری
    if (
      userId === undefined ||
      total === undefined ||
      !Array.isArray(items) ||
      paymentMethod === undefined
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'داده‌های ناقص' })
      };
    }

    await client.query('BEGIN');
    
    // ثبت سفارش
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, status, payment_method, shipping_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [
        userId,
        Number(total), // تبدیل صریح به عدد
        'processing',
        paymentMethod,
        shippingAddress || null
      ]
    );

    const orderId = orderResult.rows[0].id;

    // ثبت آیتم‌های سفارش
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [
          orderId,
          Number(item.productId),
          Number(item.quantity),
          Number(item.price)
        ]
      );
    }

    await client.query('COMMIT');

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        orderId,
        total,
        status: 'processing'
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
    await client.release();
  }
};