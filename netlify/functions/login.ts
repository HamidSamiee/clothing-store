// netlify/functions/login.ts
import { query } from './db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Handler } from '@netlify/functions';
import { LoginData, SafeUser, User } from '@/types/User';

interface LoginResponse {
  user: SafeUser;
  token: string;
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'متد غیرمجاز' })
    };
  }

  try {
    const { email, password } = JSON.parse(event.body || '{}') as LoginData;
    
    // اعتبارسنجی فیلدهای ورودی
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'ایمیل و رمز عبور الزامی هستند' })
      };
    }

    const userResult = await query<User>(
      'SELECT id, name, email, password, role FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'ایمیل یا رمز عبور اشتباه است' })
      };
    }
    
    const user = userResult.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'ایمیل یا رمز عبور اشتباه است' })
      };
    }
    
    // اطمینان از وجود JWT_SECRET
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'user' // مقدار پیش‌فرض برای نقش
    };
    
    const response: LoginResponse = {
      user: safeUser,
      token
    };
    
    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (err) {
    console.error('Login error:', err);
    
    let errorMessage = 'خطای سرور';
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
  
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(err) : undefined
      })
    };
  }
};

export { handler };