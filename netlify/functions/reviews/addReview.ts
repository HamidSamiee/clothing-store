import { getClient } from '../utils/db';
import { Handler } from '@netlify/functions';
import { Review } from '@/types/Review';

interface AddReviewRequest {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}

const handler: Handler = async (event) => {
  const client = await getClient();
  try {
    const { productId, userId, userName, rating, comment } = 
      JSON.parse(event.body || '{}') as AddReviewRequest;
    
    await client.query('BEGIN');
    
    const reviewResult = await client.query<Review>(
      `INSERT INTO reviews (product_id, user_id, user_name, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, product_id, user_id, user_name, rating, comment, created_at`,
      [productId, userId, userName, rating, comment]
    );
    
    const avgResult = await client.query<{ avg_rating: string }>(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = $1',
      [productId]
    );
    
    await client.query(
      'UPDATE products SET rating = $1 WHERE id = $2',
      [parseFloat(avgResult.rows[0].avg_rating), productId]
    );
    
    await client.query('COMMIT');
    
    return {
      statusCode: 201,
      body: JSON.stringify(reviewResult.rows[0])
    };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Add review error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطای سرور' })
    };
  } finally {
    client.release();
  }
};

export { handler };