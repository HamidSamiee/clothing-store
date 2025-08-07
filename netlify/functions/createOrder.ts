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
  authority?: string; // شناسه پرداخت زرین‌پال
}

export const handler: Handler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'بدون داده' })
    };
  }

  const client = await getClient();
  
  try {
    const { 
      userId, 
      items, 
      total, 
      paymentMethod, 
      shippingAddress,
      authority 
    } = JSON.parse(event.body) as CreateOrderRequest;

    // اعتبارسنجی داده‌های ورودی
    if (!userId || !items || !total || !paymentMethod) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'داده‌های ناقص' })
      };
    }

    await client.query('BEGIN');

    // 1. بررسی سفارش بر اساس authority (اگر وجود دارد)
    if (authority) {
      const existingByAuthority = await client.query(
        `SELECT o.id FROM orders o
         JOIN order_meta om ON o.id = om.order_id
         WHERE om.meta_key = 'authority' AND om.meta_value = $1
         LIMIT 1`,
        [authority]
      );

      if (existingByAuthority.rows.length > 0) {
        return {
          statusCode: 200, // 200 به جای 400 چون سفارش معتبر است
          body: JSON.stringify({
            success: true,
            orderId: existingByAuthority.rows[0].id,
            isExisting: true
          })
        };
      }
    }

    // 2. ثبت سفارش جدید
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, status, payment_method, shipping_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [
        userId,
        total,
        'processing',
        paymentMethod,
        shippingAddress || null
      ]
    );

    const orderId = orderResult.rows[0].id;

    // ثبت متادیتای سفارش (authority)
    if (authority) {
      await client.query(
        `INSERT INTO order_meta (order_id, meta_key, meta_value)
         VALUES ($1, 'authority', $2)`,
        [orderId, authority]
      );
    }

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