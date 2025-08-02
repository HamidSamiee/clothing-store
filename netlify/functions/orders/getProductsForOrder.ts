import { query } from '../utils/db';
import { Handler } from '@netlify/functions';
import { Product } from '@/types/Product';

const handler: Handler = async (event) => {
  const orderId = event.queryStringParameters?.id;
  
  if (!orderId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'شناسه سفارش الزامی است' })
    };
  }

  try {
    // دریافت محصولات مرتبط با سفارش
    const result = await query<Product>(
      `SELECT p.*, 
              array_agg(DISTINCT ps.size) as sizes,
              array_agg(DISTINCT pc.color) as colors,
              oi.quantity as order_quantity
       FROM products p
       JOIN order_items oi ON p.id = oi.product_id
       LEFT JOIN product_sizes ps ON p.id = ps.product_id
       LEFT JOIN product_colors pc ON p.id = pc.product_id
       WHERE oi.order_id = $1
       GROUP BY p.id, oi.quantity`,
      [orderId]
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows)
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در دریافت محصولات سفارش' })
    };
  }
};

export { handler };