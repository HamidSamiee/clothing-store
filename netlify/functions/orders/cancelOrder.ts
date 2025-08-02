import { query } from '../utils/db';
import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  const orderId = event.queryStringParameters?.id;
  
  if (!orderId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'شناسه سفارش الزامی است' })
    };
  }

  try {
    // شروع تراکنش
    await query('BEGIN');
    
    // 1. دریافت آیتم‌های سفارش
    const itemsResult = await query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [orderId]
    );
    
    // 2. برگشت موجودی محصولات
    for (const item of itemsResult.rows) {
      await query(
        'UPDATE products SET stock = stock + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }
    
    // 3. به‌روزرسانی وضعیت سفارش
    await query(
      'UPDATE orders SET status = $1 WHERE id = $2',
      ['cancelled', orderId]
    );
    
    // پایان تراکنش
    await query('COMMIT');
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch {
    await query('ROLLBACK');
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در لغو سفارش' })
    };
  }
};

export { handler };