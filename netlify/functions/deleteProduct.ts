import { query } from './db';
import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  const productId = event.queryStringParameters?.id;
  
  if (!productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'شناسه محصول الزامی است' })
    };
  }

  try {
    // شروع تراکنش
    await query('BEGIN');
    
    // حذف سایزهای محصول
    await query('DELETE FROM product_sizes WHERE product_id = $1', [productId]);
    
    // حذف رنگ‌های محصول
    await query('DELETE FROM product_colors WHERE product_id = $1', [productId]);
    
    // حذف محصول
    const result = await query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [productId]
    );
    
    // پایان تراکنش
    await query('COMMIT');
    
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'محصول یافت نشد' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch  {
    await query('ROLLBACK');
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در حذف محصول' })
    };
  }
};

export { handler };