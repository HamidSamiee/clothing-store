import { query } from './db';
import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  try {
    const userId = event.queryStringParameters?.id;
    
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'شناسه کاربر الزامی است' })
      };
    }
    
    const userResult = await query(
      'SELECT id, name, email, phone, address, role FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'کاربر یافت نشد' })
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(userResult.rows[0])
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطای سرور' })
    };
  }
};

export { handler };