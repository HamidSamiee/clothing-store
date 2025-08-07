import { query } from './db';
import { Handler } from '@netlify/functions';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface LoginData {
  email: string;
  password: string;
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    const { email, password }: LoginData = JSON.parse(event.body || '{}');

    // اعتبارسنجی ورودی‌ها
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'ایمیل و رمز عبور الزامی هستند' })
      };
    }

    // جستجوی کاربر در دیتابیس
    const userResult = await query<{
      id: number;
      name:string;
      email: string;
      password: string;
      address:string;
      phone:string;
      role: string;
    }>(
      'SELECT id, name, email, password, address, phone ,role FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'کاربری با این ایمیل یافت نشد' })
      };
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'رمز عبور نادرست است' })
      };
    }

    // ایجاد توکن JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ token, user: { id: user.id, name: user.name, email: user.email, address: user.address, phone:user.phone, role: user.role } })
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در ورود به سیستم' })
    };
  }
};

export { handler };