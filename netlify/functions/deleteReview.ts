import { query } from './db';
import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  const reviewId = event.queryStringParameters?.id;
  
  if (!reviewId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'شناسه نظر الزامی است' })
    };
  }

  try {
    // دریافت اطلاعات نظر قبل از حذف برای به‌روزرسانی ریتینگ محصول
    const reviewResult = await query(
      'SELECT product_id, rating FROM reviews WHERE id = $1',
      [reviewId]
    );

    if (reviewResult.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'نظر یافت نشد' })
      };
    }

    const { product_id } = reviewResult.rows[0];

    // شروع تراکنش
    await query('BEGIN');
    
    // حذف نظر
    await query('DELETE FROM reviews WHERE id = $1', [reviewId]);
    
    // به‌روزرسانی میانگین ریتینگ محصول
    await query(
      `UPDATE products SET rating = (
        SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = $1
       ) WHERE id = $1`,
      [product_id]
    );
    
    // پایان تراکنش
    await query('COMMIT');
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch  {
    await query('ROLLBACK');
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در حذف نظر' })
    };
  }
};

export { handler };