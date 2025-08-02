// netlify/functions/products/getFeaturedProducts.ts
import { query } from './db';
import { Handler } from '@netlify/functions';
import { Product } from '@/types/Product';

const handler: Handler = async () => {
  try {
    const result = await query<Product>(`
      SELECT p.*, 
        array_agg(DISTINCT ps.size) as sizes,
        array_agg(DISTINCT pc.color) as colors
      FROM products p
      LEFT JOIN product_sizes ps ON p.id = ps.product_id
      LEFT JOIN product_colors pc ON p.id = pc.product_id
      WHERE p.featured = true
      GROUP BY p.id
      LIMIT 8
    `);

    const products = result.rows.map(product => ({
      ...product,
      id: product.id.toString(),
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
    }));
    console.log('result ℹ️=',result) 
  console.log('products 🛒=',products)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(products)
    };
  } catch (error: unknown) {
    console.error('Database error:', error);
    
    let errorMessage = 'خطا در دریافت محصولات';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: errorMessage
      })
    };
  }
};
export { handler };