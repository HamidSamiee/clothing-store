import { query } from './db';
import { Handler } from '@netlify/functions';
import { v4 as uuidv4 } from 'uuid';

const handler: Handler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'داده محصول الزامی است' })
    };
  }

  try {
    const productData = JSON.parse(event.body);
    
    // تولید ID منحصر به فرد با UUID
    const productId = uuidv4();
    
    // شروع تراکنش
    await query('BEGIN');
    
    // افزودن محصول اصلی
    const productResult = await query(
      `INSERT INTO products (
        id, name, price, discount, description, category, 
        image, rating, stock, featured, wishlist_count
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        productId, // استفاده از UUID تولید شده
        productData.name,
        productData.price,
        productData.discount || null,
        productData.description || null,
        productData.category || null,
        productData.image || null,
        productData.rating || 0,
        productData.stock || 0,
        productData.featured || false,
        0 // مقدار اولیه برای wishlist_count
      ]
    );
    
    // افزودن سایزها
    if (productData.sizes && productData.sizes.length > 0) {
      for (const size of productData.sizes) {
        await query(
          'INSERT INTO product_sizes (product_id, size) VALUES ($1, $2)',
          [productId, size]
        );
      }
    }
    
    // افزودن رنگ‌ها
    if (productData.colors && productData.colors.length > 0) {
      for (const color of productData.colors) {
        await query(
          'INSERT INTO product_colors (product_id, color) VALUES ($1, $2)',
          [productId, color]
        );
      }
    }
    
    // پایان تراکنش
    await query('COMMIT');
    
    return {
      statusCode: 201,
      body: JSON.stringify(productResult.rows[0])
    };
  } catch (error) {
    await query('ROLLBACK');
    console.error('Add product error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'خطا در افزودن محصول',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };