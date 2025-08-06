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
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'بدون داده' })
    };
  }

  const { amount, description, orderData } = JSON.parse(event.body) as PaymentRequest;

  // اعتبارسنجی داده‌های ورودی
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

  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    // ثبت سفارش در دیتابیس
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, status, payment_method, shipping_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [
        orderData.userId,
        orderData.total,
        'pending', // وضعیت اولیه
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
        body: JSON.stringify({ error: 'خطا در درخواست پرداخت' })
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
    await client.query('ROLLBACK');
    console.error('Payment error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'خطا در سرور' })
    };
  } finally {
    client.release();
  }
};