import { getClient } from './db';
import { Handler } from '@netlify/functions';

interface WishlistData {
  userId: string;
  productId: string;
}

const handler: Handler = async (event) => {
  const client = await getClient();
  try {
    const { userId, productId } = JSON.parse(event.body || '') as WishlistData;
    
    await client.query('BEGIN');
    
    // Check if already in wishlist
    const existsResult = await client.query(
      'INSERT INTO user_wishlist (user_id, product_id) VALUES ($1::bigint, $2)',
      [parseInt(userId, 10), productId]
    );
    
    if (existsResult.rows.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'این محصول قبلا به لیست علاقه‌مندی‌ها اضافه شده است' })
      };
    }
    
    // Add to wishlist
    await client.query(
      'INSERT INTO user_wishlist (user_id, product_id) VALUES ($1, $2)',
      [userId, productId]
    );
    
    // Update wishlist count
    await client.query(
      'UPDATE products SET wishlist_count = wishlist_count + 1 WHERE id = $1',
      [productId]
    );
    
    await client.query('COMMIT');
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch {
    await client.query('ROLLBACK');
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطای سرور' })
    };
  } finally {
    client.release();
  }
};

export { handler };