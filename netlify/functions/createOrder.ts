import { Handler } from '@netlify/functions';
import { getClient } from './db';

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
      } = JSON.parse(event.body);
  
      // اعتبارسنجی پیشرفته داده‌های ورودی
      if (userId === null || userId === undefined) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'شناسه کاربر الزامی است' })
        };
      }
  
      if (total === null || total === undefined || isNaN(Number(total))) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'مبلغ کل الزامی است' })
        };
      }
  
      if (!paymentMethod) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'روش پرداخت الزامی است' })
        };
      }
  
      await client.query('BEGIN');
  
      // بررسی سفارش تکراری بر اساس authority
      if (authority) {
        const existingOrder = await client.query(
          `SELECT o.id FROM orders o
           JOIN order_meta om ON o.id = om.order_id
           WHERE om.meta_key = 'authority' AND om.meta_value = $1
           LIMIT 1`,
          [authority]
        );
  
        if (existingOrder.rows.length > 0) {
          return {
            statusCode: 200,
            body: JSON.stringify({ 
              orderId: existingOrder.rows[0].id,
              message: 'سفارش قبلاً ثبت شده است'
            })
          };
        }
      }
  
      // ثبت سفارش جدید
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, total, status, payment_method, shipping_address)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          Number(userId),
          Number(total),
          'processing',
          paymentMethod,
          shippingAddress || null
        ]
      );
  
      const orderId = orderResult.rows[0].id;
  
      // ثبت متادیتای authority اگر وجود دارد
      if (authority) {
        await client.query(
          `INSERT INTO order_meta (order_id, meta_key, meta_value)
           VALUES ($1, 'authority', $2)`,
          [orderId, authority]
        );
      }
  
      // ثبت آیتم‌های سفارش
      if (Array.isArray(items)) {
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