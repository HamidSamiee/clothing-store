import { query } from '../utils/db';
import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'بدون داده' })
    };
  }

  try {
    const productData = JSON.parse(event.body);
    
    // شروع تراکنش
    await query('BEGIN');
    
    // درج محصول اصلی
    const productResult = await query(
      `INSERT INTO products (
        name, price, discount, description, category, 
        image, rating, stock, featured
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        productData.name,
        productData.price,
        productData.discount,
        productData.description,
        productData.category,
        productData.image,
        productData.rating,
        productData.stock,
        productData.featured || false
      ]
    );
    
    const product = productResult.rows[0];
    
    // درج سایزها
    if (productData.sizes && productData.sizes.length > 0) {
      for (const size of productData.sizes) {
        await query(
          'INSERT INTO product_sizes (product_id, size) VALUES ($1, $2)',
          [product.id, size]
        );
      }
    }
    
    // درج رنگ‌ها
    if (productData.colors && productData.colors.length > 0) {
      for (const color of productData.colors) {
        await query(
          'INSERT INTO product_colors (product_id, color) VALUES ($1, $2)',
          [product.id, color]
        );
      }
    }
    
    // پایان تراکنش
    await query('COMMIT');
    
    return {
      statusCode: 201,
      body: JSON.stringify(product)
    };
  } catch  {
    await query('ROLLBACK');
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در افزودن محصول' })
    };
  }
};

export { handler };