// netlify/functions/reviews.ts (نسخه اصلاح شده)
import { query } from './db';
import { Handler } from '@netlify/functions';

interface ReviewResponse {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  userName: string;
  userEmail?: string;
}

const handler: Handler = async (event) => {
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
    const result = await query<ReviewResponse>(
      `SELECT 
        r.id,
        r.user_id as "userId",
        r.product_id as "productId",
        r.rating,
        r.comment,
        r.created_at as "createdAt",
        u.name as "userName",
        u.email as "userEmail"
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [productId]
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        reviews: Array.isArray(result.rows) ? result.rows : []
      })
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