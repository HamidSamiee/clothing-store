import { query } from './db';
import { Handler } from '@netlify/functions';

interface OrderItemResult {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
}

interface OrderResult {
  id: number;
  user_id: number;
  created_at: string;
  total: number;
  status: string;
  shipping_address: string | null;
  payment_method: string;
  items: OrderItemResult[];
  user_name: string;
  user_email: string;
}

const handler: Handler = async (event) => {
  const page = parseInt(event.queryStringParameters?._page || '1', 10);
  const perPage = parseInt(event.queryStringParameters?._limit || '10', 10);
  const search = event.queryStringParameters?.q;
  const userId = event.queryStringParameters?.userId;
  
  try {
    const searchConditions = [];
    const queryParams = [];
    
    if (search) {
      searchConditions.push(`(o.id::text LIKE $${queryParams.length + 1} OR u.name LIKE $${queryParams.length + 1} OR u.email LIKE $${queryParams.length + 1})`);
      queryParams.push(`%${search}%`);
    }
    
    if (userId) {
      searchConditions.push(`o.user_id = $${queryParams.length + 1}`);
      queryParams.push(userId);
    }
    
    const whereClause = searchConditions.length > 0 
      ? `WHERE ${searchConditions.join(' AND ')}` 
      : '';
    
    const result = await query<OrderResult>(`
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email,
        (
          SELECT json_agg(json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price
          ))
          FROM order_items oi
          WHERE oi.order_id = o.id
        ) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
      [...queryParams, perPage, (page - 1) * perPage]
    );
    
    const countResult = await query<{count: string}>(
      `SELECT COUNT(*) 
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ${whereClause}`,
      queryParams
    );
    
    return {
      statusCode: 200,
      headers: {
        'x-total-count': countResult.rows[0].count
      },
      body: JSON.stringify({
        data: result.rows,
        total: parseInt(countResult.rows[0].count, 10)
      })
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