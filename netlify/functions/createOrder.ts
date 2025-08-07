import { Handler } from '@netlify/functions';
import { getClient } from './db';

let orderProcessed = false;

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
  authority?: string; // اضافه کردن authority به اینترفیس
}

export const handler: Handler = async (event) => {
  const client = await getClient();
  
  if (orderProcessed) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'سفارش در حال پردازش است' })
    };
  }

  try {
    orderProcessed = true;
    
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'بدون داده' })
      };
    }

    const { 
      userId, 
      items, 
      total, 
      paymentMethod, 
      shippingAddress,
      authority // دریافت authority از بدنه درخواست
    } = JSON.parse(event.body) as CreateOrderRequest;

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

    const existingOrder = await client.query(
      `SELECT id FROM orders 
       WHERE user_id = $1 
       AND ABS(total - $2) < 0.01 
       AND status IN ('pending', 'processing')
       LIMIT 1`,
      [userId, total]
    );

    if (existingOrder.rows.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'این سفارش قبلا ثبت شده است' })
      };
    }

    await client.query('BEGIN');
    
    // ثبت سفارش اصلی
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, status, payment_method, shipping_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [
        userId,
        Number(total),
        'processing',
        paymentMethod,
        shippingAddress || null
      ]
    );

    const orderId = orderResult.rows[0].id;

    // ثبت متادیتای سفارش (authority) اگر وجود دارد
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
    orderProcessed = false;
  }
};