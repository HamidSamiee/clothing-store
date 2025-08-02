import { query } from './db';
import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  const productId = event.queryStringParameters?.productId;
  
  if (!productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'شناسه محصول الزامی است' })
    };
  }

  try {
    const result = await query(
      `SELECT r.*, u.name as user_name, u.email as user_email
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [productId]
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows)
    };
  } catch  {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در دریافت نظرات' })
    };
  }
};

export { handler };