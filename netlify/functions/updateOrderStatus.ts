import { query } from './db';
import { Handler } from '@netlify/functions';
import { OrderStatus } from '@/types/Order';

interface UpdateStatusData {
  status: OrderStatus;
}

const handler: Handler = async (event) => {
  // اجازه دادن به متد PATCH
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

    const result = await query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'سفارش یافت نشد' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0])
    };
  } catch (error) {
    console.error('Update order status error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در به‌روزرسانی وضعیت سفارش' })
    };
  }
};

export { handler };