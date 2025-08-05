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
  sizes?: unknown;
  colors?: unknown;
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
    
    // تبدیل sizes و colors به آرایه معتبر
    const sizes = convertToArray(productData.sizes);
    const colors = convertToArray(productData.colors);

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
        productData.discount ?? 0,
        productData.description ?? null,
        productData.category ?? null,
        productData.image ?? null,
        productData.rating ?? 0,
        productData.stock ?? 0,
        productData.featured ?? false,
        0
      ]
    );
    
    // درج سایزها
    await insertItems(productId, sizes, 'product_sizes', 'size');
    
    // درج رنگ‌ها
    await insertItems(productId, colors, 'product_colors', 'color');
    
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

// تابع کمکی برای تبدیل مقدار به آرایه
function convertToArray(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map(item => item?.toString().trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [];
}

// تابع کمکی برای درج آیتم‌ها
async function insertItems(
  productId: string,
  items: string[],
  table: 'product_sizes' | 'product_colors',
  column: 'size' | 'color'
): Promise<void> {
  const uniqueItems = [...new Set(items.filter(item => item && item !== ','))];
  
  for (const item of uniqueItems) {
    try {
      await query(
        `INSERT INTO ${table} (product_id, ${column}) VALUES ($1, $2)`,
        [productId, item]
      );
    } catch (insertError: unknown) {
      if (isPostgresError(insertError) && insertError.code !== '23505') {
        throw insertError;
      }
    }
  }
}

// تابع کمکی برای بررسی نوع خطای PostgreSQL
interface PostgresError extends Error {
  code?: string;
}

function isPostgresError(error: unknown): error is PostgresError {
  return error instanceof Error && 'code' in error;
}

export { handler };