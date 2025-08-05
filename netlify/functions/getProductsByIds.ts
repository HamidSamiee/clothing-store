import { query } from './db';
import { Handler } from '@netlify/functions';
import { normalizeProduct } from './normalizeProduct';
import { RawProduct } from '@/types/Product';

interface ProductQueryResult {
  id: string; // تغییر از number به string
  name: string;
  price: number | string;
  discount?: number | string | null;
  description: string;
  category: string;
  image: string;
  rating: number | string;
  stock: number | string;
  featured?: boolean;
  sizes: string[];
  colors: string[];
  specifications?: Record<string, string> | string | null;
  reviews?: string;
}

const handler: Handler = async (event) => {
  const ids = event.queryStringParameters?.ids;
  
  if (!ids) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'شناسه محصولات الزامی است' })
    };
  }

  try {
    const idArray = ids.split(',').map(id => id.trim()); // حذف parseInt
    
    const result = await query<ProductQueryResult>(
      `SELECT p.*, 
              array_agg(DISTINCT ps.size) as sizes,
              array_agg(DISTINCT pc.color) as colors,
              (SELECT json_agg(r) FROM reviews r WHERE r.product_id = p.id) as reviews
       FROM products p
       LEFT JOIN product_sizes ps ON p.id = ps.product_id
       LEFT JOIN product_colors pc ON p.id = pc.product_id
       WHERE p.id = ANY($1::varchar[]) -- تغییر از int[] به varchar[]
       GROUP BY p.id`,
       [idArray as unknown as (string | number | boolean | null)]
      );
    
    const normalizedProducts = result.rows.map(row => {
      // تبدیل id به number اگر نیاز باشد
      const productId = isNaN(Number(row.id)) ? row.id : Number(row.id);
      
      const productData: RawProduct = {
        id: productId,
        name: row.name,
        price: typeof row.price === 'string' ? parseFloat(row.price) : row.price,
        discount: row.discount 
          ? typeof row.discount === 'string' 
            ? parseFloat(row.discount) 
            : row.discount
          : undefined,
        description: row.description,
        category: row.category,
        image: row.image,
        rating: typeof row.rating === 'string' ? parseFloat(row.rating) : row.rating,
        stock: typeof row.stock === 'string' ? parseInt(row.stock, 10) : row.stock,
        featured: row.featured ?? undefined,
        sizes: row.sizes,
        colors: row.colors,
        specifications: typeof row.specifications === 'string' 
          ? JSON.parse(row.specifications) 
          : row.specifications ?? {},
        reviews: row.reviews || ''
      };
      
      return normalizeProduct(productData);
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify(normalizedProducts)
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'خطا در دریافت محصولات',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };