// netlify/functions/getFeaturedProducts.ts
import { query } from '../utils/db';
import { Handler } from '@netlify/functions';
import { Product } from '@/types/Product';

const handler: Handler = async () => {
  try {
    const result = await query<Product>(
      `SELECT p.*, 
              array_agg(DISTINCT ps.size) as sizes,
              array_agg(DISTINCT pc.color) as colors
       FROM products p
       LEFT JOIN product_sizes ps ON p.id = ps.product_id
       LEFT JOIN product_colors pc ON p.id = pc.product_id
       WHERE p.featured = true
       GROUP BY p.id
       LIMIT 8`
    );

    // تبدیل داده‌ها به ساختار مورد انتظار فرانت‌اند
    const products = result.rows.map(product => ({
      ...product,
      id: product.id.toString(),
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(products) // داده را مستقیماً بازگردانید
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در دریافت محصولات ویژه' })
    };
  }
};

export { handler };