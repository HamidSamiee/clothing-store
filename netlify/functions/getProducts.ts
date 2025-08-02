import { query } from './db';
import { Handler } from '@netlify/functions';
import { Product, ProductFilterOptions, PaginatedResponse } from '@/types/Product';

const handler: Handler = async (event) => {
  try {
    const params = event.queryStringParameters as unknown as ProductFilterOptions;
    const { category, search, minPrice, maxPrice, featured, sort, page = 1, perPage = 9 } = params;
    
    let queryStr = 'SELECT * FROM products WHERE 1=1';
    const queryParams: (string | number)[] = [];
    
    if (category) {
      queryStr += ` AND category = $${queryParams.length + 1}`;
      queryParams.push(category);
    }
    
    if (search) {
      queryStr += ` AND (name ILIKE $${queryParams.length + 1} OR description ILIKE $${queryParams.length + 1})`;
      queryParams.push(`%${search}%`);
    }
    
    if (minPrice) {
      queryStr += ` AND price >= $${queryParams.length + 1}`;
      queryParams.push(minPrice);
    }
    
    if (maxPrice) {
      queryStr += ` AND price <= $${queryParams.length + 1}`;
      queryParams.push(maxPrice);
    }
    
    if (featured) {
      queryStr += ' AND featured = true';
    }
    
    if (sort) {
      switch (sort) {
        case 'price_asc':
          queryStr += ' ORDER BY price ASC';
          break;
        case 'price_desc':
          queryStr += ' ORDER BY price DESC';
          break;
        case 'rating':
          queryStr += ' ORDER BY rating DESC';
          break;
        case 'newest':
          queryStr += ' ORDER BY created_at DESC';
          break;
      }
    }
    
    const offset = (page - 1) * perPage;
    queryStr += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(perPage, offset);
    
    const productsResult = await query<Product>(queryStr, queryParams);
    
    const countQuery = queryStr.split('ORDER BY')[0].replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await query<{ count: string }>(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].count, 10);
    
    const response: PaginatedResponse<Product> = {
      data: productsResult.rows,
      total,
      page,
      perPage
    };
    
    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (err) {
    console.error('Get products error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطای سرور' })
    };
  }
};

export { handler };