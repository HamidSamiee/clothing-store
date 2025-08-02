import { query } from '../utils/db';
import { Handler } from '@netlify/functions';
import { Product } from '@/types/Product';

interface UpdateProductParams {
  name?: string | null;
  price?: number | null;
  discount?: number | null;
  description?: string | null;
  category?: string | null;
  image?: string | null;
  rating?: number | null;
  stock?: number | null;
  featured?: boolean | null;
  sizes?: string[];
  colors?: string[];
}

const handler: Handler = async (event) => {
  const productId = event.queryStringParameters?.id;
  
  if (!productId || !event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'شناسه محصول و داده‌های به‌روزرسانی الزامی است' })
    };
  }

  try {
    const updateData: UpdateProductParams = JSON.parse(event.body);
    
    // شروع تراکنش
    await query('BEGIN');
    
    // آماده‌سازی پارامترهای به‌روزرسانی
    const updateParams: (string | number | boolean | null)[] = [
      updateData.name ?? null,
      updateData.price ?? null,
      updateData.discount ?? null,
      updateData.description ?? null,
      updateData.category ?? null,
      updateData.image ?? null,
      updateData.rating ?? null,
      updateData.stock ?? null,
      updateData.featured ?? null,
      productId
    ];

    // به‌روزرسانی محصول اصلی
    const productResult = await query<Product>(
      `UPDATE products SET
        name = COALESCE($1, name),
        price = COALESCE($2, price),
        discount = COALESCE($3, discount),
        description = COALESCE($4, description),
        category = COALESCE($5, category),
        image = COALESCE($6, image),
        rating = COALESCE($7, rating),
        stock = COALESCE($8, stock),
        featured = COALESCE($9, featured)
       WHERE id = $10
       RETURNING *`,
      updateParams
    );
    
    // به‌روزرسانی سایزها (در صورت وجود)
    if (updateData.sizes) {
      // حذف سایزهای قدیمی
      await query('DELETE FROM product_sizes WHERE product_id = $1', [productId]);
      
      // افزودن سایزهای جدید
      for (const size of updateData.sizes) {
        await query(
          'INSERT INTO product_sizes (product_id, size) VALUES ($1, $2)',
          [productId, size]
        );
      }
    }
    
    // به‌روزرسانی رنگ‌ها (در صورت وجود)
    if (updateData.colors) {
      // حذف رنگ‌های قدیمی
      await query('DELETE FROM product_colors WHERE product_id = $1', [productId]);
      
      // افزودن رنگ‌های جدید
      for (const color of updateData.colors) {
        await query(
          'INSERT INTO product_colors (product_id, color) VALUES ($1, $2)',
          [productId, color]
        );
      }
    }
    
    // پایان تراکنش
    await query('COMMIT');
    
    return {
      statusCode: 200,
      body: JSON.stringify(productResult.rows[0])
    };
  } catch  {
    await query('ROLLBACK');
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در به‌روزرسانی محصول' })
    };
  }
};

export { handler };