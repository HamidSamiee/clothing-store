import { query } from '../utils/db';
import { Handler } from '@netlify/functions';
import { normalizeProduct } from '../utils/normalizeProduct';
import { RawProduct } from '@/types/Product';

interface ProductQueryResult {
  id: number;
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
  reviews?: string; // This must match RawProduct (string)
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
    const idArray = ids.split(',').map(id => parseInt(id.trim(), 10));
    
    // Query that returns reviews as JSON string
    const result = await query<ProductQueryResult>(
      `SELECT p.*, 
              array_agg(DISTINCT ps.size) as sizes,
              array_agg(DISTINCT pc.color) as colors,
              (SELECT json_agg(r) FROM reviews r WHERE r.product_id = p.id) as reviews
       FROM products p
       LEFT JOIN product_sizes ps ON p.id = ps.product_id
       LEFT JOIN product_colors pc ON p.id = pc.product_id
       WHERE p.id = ANY($1::int[])
       GROUP BY p.id`,
      [idArray as unknown as (string | number | boolean | null)]
    );
    
    const normalizedProducts = result.rows.map(row => {
      const productData: RawProduct = {
        id: row.id,
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
        reviews: row.reviews || '' // Must be string to match RawProduct
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
      body: JSON.stringify({ message: 'خطا در دریافت محصولات' })
    };
  }
};

export { handler };