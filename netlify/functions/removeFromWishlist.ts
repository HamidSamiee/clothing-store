import { query } from './db';
import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  const { userId, productId } = event.queryStringParameters || {};
  
  if (!userId || !productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'شناسه کاربر و محصول الزامی است' })
    };
  }

  try {
    // شروع تراکنش
    await query('BEGIN');
    
    // حذف از لیست علاقه‌مندی‌های کاربر
    await query(
      'DELETE FROM user_wishlist WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    
    // کاهش تعداد علاقه‌مندی‌های محصول
    await query(
      'UPDATE products SET wishlist_count = GREATEST(0, wishlist_count - 1) WHERE id = $1',
      [productId]
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
      body: JSON.stringify({ message: 'خطا در حذف از لیست علاقه‌مندی‌ها' })
    };
  }
};

export { handler };