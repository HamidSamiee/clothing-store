// netlify/functions/reviews.ts
import { query } from './db';
import { Handler } from '@netlify/functions';

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

const handler: Handler = async (event) => {
  // فقط متد GET را پردازش کنیم
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'متد غیرمجاز' })
    };
  }

  const productId = event.queryStringParameters?.productId;
  
  if (!productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'شناسه محصول الزامی است' })
    };
  }

  try {
    const result = await query<Review>(
      `SELECT 
        r.id,
        r.user_id,
        r.product_id,
        r.rating,
        r.comment,
        r.created_at,
        u.name as user_name,
        u.email as user_email
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
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'خطا در دریافت نظرات',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      })
    };
  }
};

export { handler };