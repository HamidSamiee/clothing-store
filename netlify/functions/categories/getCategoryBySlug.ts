import { query } from '../utils/db';
import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  const slug = event.queryStringParameters?.slug;
  
  if (!slug) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'شناسه دسته‌بندی الزامی است' })
    };
  }

  try {
    const result = await query('SELECT * FROM categories WHERE slug = $1', [slug]);
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0] || null)
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در دریافت دسته‌بندی' })
    };
  }
};

export { handler };