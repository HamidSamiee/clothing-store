import { query } from '../utils/db';
import { Handler } from '@netlify/functions';
import { Product } from '@/types/Product';

const handler: Handler = async (event) => {
  try {
    const userId = event.queryStringParameters?.userId;
    
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'شناسه کاربر الزامی است' })
      };
    }
    
    const wishlistResult = await query<Product>(
      `SELECT p.* FROM products p
       JOIN user_wishlist uw ON p.id = uw.product_id
       WHERE uw.user_id = $1`,
      [userId]
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify(wishlistResult.rows)
    };
  } catch (err) {
    console.error('Get wishlist error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطای سرور' })
    };
  }
};

export { handler };