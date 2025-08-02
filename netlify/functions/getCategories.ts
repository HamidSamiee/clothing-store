import { query } from './db';
import { Handler } from '@netlify/functions';

const handler: Handler = async () => {
  try {
    const result = await query('SELECT * FROM categories ORDER BY name');
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows)
    };
  } catch  {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در دریافت دسته‌بندی‌ها' })
    };
  }
};

export { handler };