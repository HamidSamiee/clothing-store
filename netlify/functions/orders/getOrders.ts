import { query } from '../utils/db';
import { Handler } from '@netlify/functions';

interface Order {
  id: number;
  user_id: number;
  created_at: string;
  total: number;
  status: string;
  shipping_address: string | null;
  payment_method: string;
  user_name: string;
  user_email: string;
}

interface PaginatedResponse {
  data: Order[];
  total: number;
}

const handler: Handler = async (event) => {
  // تبدیل پارامترهای صفحه‌بندی به عدد
  const page = parseInt(event.queryStringParameters?.page || '1', 10);
  const perPage = parseInt(event.queryStringParameters?.perPage || '10', 10);
  const search = event.queryStringParameters?.search;
  
  try {
    // ساخت شرط جستجو
    const searchCondition = search 
      ? `AND (o.id::text LIKE $3 OR u.name LIKE $3 OR u.email LIKE $3)`
      : '';
    
    // کوئری اصلی
    const result = await query<Order>(
      `SELECT o.*, u.name as user_name, u.email as user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE 1=1 ${searchCondition}
       ORDER BY o.created_at DESC
       LIMIT $1 OFFSET $2`,
      [
        perPage,
        (page - 1) * perPage,
        ...(search ? [`%${search}%`] : [])
      ]
    );
    
    // تعداد کل رکوردها
    const countResult = await query<{count: string}>(
      `SELECT COUNT(*) 
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE 1=1 ${searchCondition}`,
      search ? [`%${search}%`] : []
    );
    
    const response: PaginatedResponse = {
      data: result.rows,
      total: parseInt(countResult.rows[0].count, 10)
    };
    
    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در دریافت سفارشات' })
    };
  }
};

export { handler };