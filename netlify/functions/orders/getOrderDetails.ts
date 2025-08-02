import { query } from '../utils/db';
import { Handler } from '@netlify/functions';
import { Order, OrderItem } from '@/types/Order';

const handler: Handler = async (event) => {
  const orderId = event.queryStringParameters?.id;
  
  if (!orderId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'شناسه سفارش الزامی است' })
    };
  }

  try {
    // دریافت اطلاعات سفارش
    const orderResult = await query<Order>(
      `SELECT o.*, u.name as user_name, u.email as user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'سفارش یافت نشد' })
      };
    }

    const order = orderResult.rows[0];

    // دریافت آیتم‌های سفارش
    const itemsResult = await query<OrderItem>(
      'SELECT * FROM order_items WHERE order_id = $1',
      [orderId]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        ...order,
        items: itemsResult.rows
      })
    };
  } catch  {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در دریافت جزئیات سفارش' })
    };
  }
};

export { handler };