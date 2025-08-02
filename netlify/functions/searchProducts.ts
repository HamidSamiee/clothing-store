import { query } from './db';
import { Handler } from '@netlify/functions';
import { Product } from '@/types/Product';

const handler: Handler = async (event) => {
  const queryParam = event.queryStringParameters?.q;
  
  if (!queryParam) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'عبارت جستجو الزامی است' })
    };
  }

  try {
    const result = await query<Product>(
      `SELECT p.*, 
              array_agg(DISTINCT ps.size) as sizes,
              array_agg(DISTINCT pc.color) as colors
       FROM products p
       LEFT JOIN product_sizes ps ON p.id = ps.product_id
       LEFT JOIN product_colors pc ON p.id = pc.product_id
       WHERE p.name ILIKE $1 OR p.description ILIKE $1
       GROUP BY p.id
       LIMIT 20`,
      [`%${queryParam}%`]
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows)
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در جستجوی محصولات' })
    };
  }
};

export { handler };