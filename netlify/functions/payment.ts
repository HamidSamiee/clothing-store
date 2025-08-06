// netlify/functions/payment.ts
import { Handler } from '@netlify/functions';
import { getClient } from './db';
import ZarinPal from 'zarinpal-checkout';

const zarinpal = ZarinPal.create('YOUR_MERCHANT_ID', true);

interface PaymentRequest {
  amount: number;
  description: string;
  orderData: {
    userId: number;
    items: Array<{
      productId: number;
      quantity: number;
      price: number;
    }>;
    total: number;
    paymentMethod: string;
    shippingAddress?: string;
  };
}

export const handler: Handler = async (event) => {
  // بررسی وجود body
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'بدون داده' })
    };
  }

  let client;
  try {
    // پارس و اعتبارسنجی داده‌های ورودی
    const { amount, description, orderData } = JSON.parse(event.body) as PaymentRequest;
    
    if (!amount || !description || !orderData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'داده‌های ناقص' })
      };
    }

    if (!orderData.userId || !orderData.total || !orderData.paymentMethod) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'داده‌های سفارش ناقص' })
      };
    }

    client = await getClient();
    await client.query('BEGIN');

    // ثبت سفارش در دیتابیس
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, status, payment_method, shipping_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [
        orderData.userId,
        orderData.total,
        'pending',
        orderData.paymentMethod,
        orderData.shippingAddress || null
      ]
    );

    const orderId = orderResult.rows[0].id;

    // ثبت آیتم‌های سفارش
    for (const item of orderData.items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.productId, item.quantity, item.price]
      );
    }

    // درخواست پرداخت به زرین‌پال
    const response = await zarinpal.PaymentRequest({
      Amount: amount * 10, // تبدیل به ریال
      CallbackURL: `${process.env.BASE_URL}/verify?orderId=${orderId}`,
      Description: description,
    });

    if (response.status !== 100) {
      await client.query('ROLLBACK');
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'خطا در درخواست پرداخت',
          details: response 
        })
      };
    }

    await client.query('COMMIT');

    return {
      statusCode: 200,
      body: JSON.stringify({
        url: `https://sandbox.zarinpal.com/pg/StartPay/${response.authority}`,
        orderId
      })
    };
  } catch (err) {
    console.error('Payment processing error:', err);
    if (client) {
      await client.query('ROLLBACK').catch(e => console.error('Rollback error:', e));
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'خطا در پردازش پرداخت',
        message: err instanceof Error ? err.message : 'Unknown error'
      })
    };
  } finally {
    if (client) {
      try {
        await client.release();
      } catch (e: unknown) {
        console.error('Client release error:', e instanceof Error ? e.message : String(e));
      }
    }
  }
};