// netlify/functions/reviews.ts
import { query } from './db';
import { Handler } from '@netlify/functions';
import { Review } from '@/types/Review';

interface ErrorResponse {
  message: string;
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'متد غیرمجاز' } as ErrorResponse)
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'بدنه درخواست الزامی است' } as ErrorResponse)
    };
  }

  try {
    const review: Review = JSON.parse(event.body);

    // اعتبارسنجی داده‌ها
    if (!review.productId || !review.userId || !review.rating) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'داده‌های ناقص ارسال شده است' } as ErrorResponse)
      };
    }

    // ذخیره نظر در دیتابیس
    const result = await query<Review>(
        `INSERT INTO reviews (id, user_id, product_id, rating, comment)
         VALUES ($1, $2::bigint, $3, $4, $5)
         RETURNING id, user_id as "userId", product_id as "productId", 
         rating, comment, created_at as "createdAt"`,
        [
          crypto.randomUUID(),
          parseInt(review.userId, 10), // تبدیل به عدد
          review.productId,
          review.rating,
          review.comment
        ]
      );
      
      // دریافت اطلاعات کامل با JOIN
      const fullReview = await query<Review & { userName: string }>(
        `SELECT 
           r.id,
           r.user_id as "userId",
           r.product_id as "productId",
           r.rating,
           r.comment,
           r.created_at as "createdAt",
           u.name as "userName"
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.id = $1`,
        [result.rows[0].id]
      );
      
      return {
        statusCode: 201,
        body: JSON.stringify({
          ...fullReview.rows[0],
          userId: fullReview.rows[0].userId.toString() // تبدیل به string
        })
      };

  } catch (error) {
    console.error('خطا در ثبت نظر:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در ثبت نظر جدید' } as ErrorResponse)
    };
  }
};

export { handler };