import { query } from './db';
import { Handler } from '@netlify/functions';
import { v4 as uuidv4 } from 'uuid';

interface ProductData {
  name: string;
  price: number | string;
  discount?: number | string | null;
  description?: string | null;
  category?: string | null;
  image?: string | null;
  rating?: number | string;
  stock?: number | string;
  featured?: boolean;
  sizes?: (string | number)[];
  colors?: (string | number)[];
}

const handler: Handler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'داده محصول الزامی است' })
    };
  }

  try {
    const productData: ProductData = JSON.parse(event.body);
    const productId = uuidv4();
    
    await query('BEGIN');
    
    // درج محصول اصلی
    const productResult = await query(
      `INSERT INTO products (
        id, name, price, discount, description, category, 
        image, rating, stock, featured, wishlist_count
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        productId,
        productData.name,
        productData.price,
        productData.discount ?? null,
        productData.description ?? null,
        productData.category ?? null,
        productData.image ?? null,
        productData.rating ?? 0,
        productData.stock ?? 0,
        productData.featured ?? false,
        0
      ]
    );
    
    // درج سایزها (با حذف مقادیر تکراری و خالی)
    if (productData.sizes && productData.sizes.length > 0) {
      const uniqueSizes = [...new Set(
        productData.sizes
          .map((size: string | number) => size.toString().trim())
          .filter((size: string) => size && size !== ',')
      )];
      
      for (const size of uniqueSizes) {
        try {
          await query(
            'INSERT INTO product_sizes (product_id, size) VALUES ($1, $2)',
            [productId, size]
          );
        } catch (insertError: unknown) {
          if (isPostgresError(insertError) && insertError.code !== '23505') {
            throw insertError;
          }
          // در غیر این صورت از خطا صرف نظر می‌کنیم (سایز تکراری)
        }
      }
    }
    
    // درج رنگ‌ها (با حذف مقادیر تکراری و خالی)
    if (productData.colors && productData.colors.length > 0) {
      const uniqueColors = [...new Set(
        productData.colors
          .map((color: string | number) => color.toString().trim())
          .filter((color: string) => color && color !== ',')
      )];
      
      for (const color of uniqueColors) {
        try {
          await query(
            'INSERT INTO product_colors (product_id, color) VALUES ($1, $2)',
            [productId, color]
          );
        } catch (insertError: unknown) {
          if (isPostgresError(insertError) && insertError.code !== '23505') {
            throw insertError;
          }
        }
      }
    }
    
    await query('COMMIT');
    
    return {
      statusCode: 201,
      body: JSON.stringify(productResult.rows[0])
    };
  } catch (error: unknown) {
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

// تابع کمکی برای بررسی نوع خطای PostgreSQL
interface PostgresError extends Error {
  code?: string;
}

function isPostgresError(error: unknown): error is PostgresError {
  return error instanceof Error && 'code' in error;
}

export { handler };