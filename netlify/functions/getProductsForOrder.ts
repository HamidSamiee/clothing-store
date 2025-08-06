import { query } from './db';
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
    const orderIdNum = parseInt(orderId);
    if (isNaN(orderIdNum)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'شناسه سفارش باید عددی باشد' })
      };
    }

    const result = await query<Product>(
      `SELECT p.*, 
              array_remove(array_agg(DISTINCT ps.size), NULL) as sizes,
              array_remove(array_agg(DISTINCT pc.color), NULL) as colors,
              oi.quantity as order_quantity,
              oi.price as order_price
       FROM products p
       JOIN order_items oi ON p.id::varchar = oi.product_id::varchar
       LEFT JOIN product_sizes ps ON p.id::varchar = ps.product_id::varchar
       LEFT JOIN product_colors pc ON p.id::varchar = pc.product_id::varchar
       WHERE oi.order_id = $1
       GROUP BY p.id, oi.id, oi.quantity, oi.price`,
      [orderIdNum]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'محصولی برای این سفارش یافت نشد' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows)
    };
  } catch (error) {
    // مدیریت نوع unknown با type guard
    let errorMessage = 'خطا در دریافت محصولات سفارش';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    console.error('Database error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      })
    };
  }
};

export { handler };