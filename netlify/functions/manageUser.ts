import { query } from './db';
import { Handler } from '@netlify/functions';
import { User } from '@/types/User';

const handler: Handler = async (event) => {
  // بررسی متد درخواست
  const method = event.httpMethod;
  if (!['POST', 'PATCH', 'DELETE'].includes(method)) {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    const userId = event.queryStringParameters?.id;

    // ایجاد کاربر جدید
    if (method === 'POST') {
      const userData: User = JSON.parse(event.body || '{}');
      
      const result = await query<User>(
        `INSERT INTO users (name, email, password, address, phone, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, email, address, phone, role`,
        [
          userData.name,
          userData.email,
          userData.password || '',
          userData.address || null,
          userData.phone || null,
          userData.role || 'user'
        ]
      );

      return {
        statusCode: 201,
        body: JSON.stringify(result.rows[0])
      };
    }

    // ویرایش کاربر
    if (method === 'PATCH') {
      if (!userId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'شناسه کاربر الزامی است' })
        };
      }

      const userData: Partial<User> = JSON.parse(event.body || '{}');
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (userData.name) {
        fields.push(`name = $${paramIndex}`);
        values.push(userData.name);
        paramIndex++;
      }
      if (userData.email) {
        fields.push(`email = $${paramIndex}`);
        values.push(userData.email);
        paramIndex++;
      }
      if (userData.password) {
        fields.push(`password = $${paramIndex}`);
        values.push(userData.password);
        paramIndex++;
      }
      if (userData.address) {
        fields.push(`address = $${paramIndex}`);
        values.push(userData.address);
        paramIndex++;
      }
      if (userData.phone) {
        fields.push(`phone = $${paramIndex}`);
        values.push(userData.phone);
        paramIndex++;
      }
      if (userData.role) {
        fields.push(`role = $${paramIndex}`);
        values.push(userData.role);
        paramIndex++;
      }

      if (fields.length === 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'هیچ فیلدی برای به‌روزرسانی ارسال نشده' })
        };
      }

      values.push(userId);

      const result = await query<User>(
        `UPDATE users 
         SET ${fields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, name, email, address, phone, role`,
        values
      );

      return {
        statusCode: 200,
        body: JSON.stringify(result.rows[0])
      };
    }

    // حذف کاربر
    if (method === 'DELETE') {
      if (!userId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'شناسه کاربر الزامی است' })
        };
      }

      await query(
        'DELETE FROM users WHERE id = $1',
        [userId]
      );

      return {
        statusCode: 204,
        body: JSON.stringify({ message: 'کاربر با موفقیت حذف شد' })
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  } catch (error) {
    console.error('Error managing user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'خطا در انجام عملیات',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };