import { query } from './db';
import { Handler } from '@netlify/functions';
import { Product} from '@/types/Product';
import {  Review } from '@/types/Review';


interface ProductResponse extends Omit<Product, 'id'> {
  id: string;
  sizes: string[];
  colors: string[];
  reviews: Review[];
}

interface ErrorResponse {
  message: string;
}

interface DatabaseReview {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user_name: string;
}

const handler: Handler = async (event) => {
  const productId = event.queryStringParameters?.id;

  if (!productId || typeof productId !== 'string') {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'شناسه محصول معتبر الزامی است' } as ErrorResponse)
    };
  }

  try {
    // دریافت اطلاعات پایه محصول
    const productResult = await query<Product>(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'محصول مورد نظر یافت نشد' } as ErrorResponse)
      };
    }

    const product = productResult.rows[0];

    // دریافت اطلاعات مرتبط به صورت موازی
    const [sizesResult, colorsResult, reviewsResult] = await Promise.all([
      query<{ size: string }>(
        'SELECT size FROM product_sizes WHERE product_id = $1',
        [productId]
      ),
      query<{ color: string }>(
        'SELECT color FROM product_colors WHERE product_id = $1',
        [productId]
      ),
      query<DatabaseReview>(
        `SELECT r.id, r.user_id, r.product_id, r.rating, r.comment, r.created_at, u.name as user_name 
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.product_id = $1`,
        [productId]
      )
    ]);

    // تبدیل بررسی‌ها به نوع Review
    const reviews: Review[] = reviewsResult.rows.map(review => ({
      id: review.id.toString(),
      userId: review.user_id.toString(),
      productId: review.product_id.toString(),
      userAvatar: undefined, // در صورت نیاز می‌توانید آواتار را اضافه کنید
      userName: review.user_name,
      rating: review.rating,
      comment: review.comment || '',
      createdAt: review.created_at
    }));

    // ساخت پاسخ نهایی
    const response: ProductResponse = {
      ...product,
      id: product.id.toString(),
      sizes: sizesResult.rows.map(r => r.size),
      colors: colorsResult.rows.map(r => r.color),
      reviews
    };

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };

  } catch (error: unknown) {
    console.error('خطا در دریافت اطلاعات محصول:', error);
    
    const errorMessage = error instanceof Error && error.message.includes('connection') 
      ? 'خطا در ارتباط با پایگاه داده'
      : 'خطای سرور در دریافت اطلاعات محصول';

    return {
      statusCode: 500,
      body: JSON.stringify({ message: errorMessage } as ErrorResponse)
    };
  }
};

export { handler };