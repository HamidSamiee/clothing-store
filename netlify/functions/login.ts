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
  try {
    const { email, password } = JSON.parse(event.body || '{}') as LoginData;
    
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
    
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );
    
    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    const response: LoginResponse = {
      user: safeUser,
      token
    };
    
    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (err) {
    console.error('Login error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطای سرور' })
    };
  }
};

export { handler };