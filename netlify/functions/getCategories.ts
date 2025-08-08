import { query } from './db';
import { Handler } from '@netlify/functions';


const handler: Handler = async () => {
  try {
    const result = await query('SELECT * FROM categories ORDER BY name ASC');
    
    if (!result.rows) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'دسته‌بندی‌ها یافت نشدند' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result.rows),
    };
  } catch  {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در دریافت دسته‌بندی‌ها' })
    };
  }
};

export { handler };