import { query } from './db';
import { Handler } from '@netlify/functions';
import { SafeUser } from '@/types/User';

const handler: Handler = async (event) => {
  try {
    // مقدار پیش‌فرض برای پارامترها
    const page = event.queryStringParameters?.page 
      ? parseInt(event.queryStringParameters.page) 
      : 1;
    const perPage = event.queryStringParameters?.perPage 
      ? parseInt(event.queryStringParameters.perPage) 
      : 8;
    const search = event.queryStringParameters?.search || '';

    // محاسبه offset برای صفحه‌بندی
    const offset = (page - 1) * perPage;

    // کوئری اصلی با فیلتر و صفحه‌بندی
    const usersQuery = await query<SafeUser>(
      `SELECT id, name, email, address, phone, role 
       FROM users
       WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1
       ORDER BY id
       LIMIT $2 OFFSET $3`,
      [`%${search}%`, perPage, offset]
    );

    // کوئری برای تعداد کل کاربران
    const countQuery = await query<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM users
       WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1`,
      [`%${search}%`]
    );

    const totalUsers = countQuery.rows[0]?.count || 0;

    return {
      statusCode: 200,
      headers: {
        'x-total-count': totalUsers.toString()
      },
      body: JSON.stringify(usersQuery.rows)
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در دریافت لیست کاربران' })
    };
  }
};

export { handler };