import { query } from './db';
import bcrypt from 'bcryptjs';
import { Handler } from '@netlify/functions';
import { User, SafeUser } from '@/types/User';

interface RegisterData extends Omit<User, 'id' | 'role'> {
  phone?: string;
  address?: string;
}

const handler: Handler = async (event) => {
  try {
    const { name, email, password, phone = null, address = null } = 
      JSON.parse(event.body || '{}') as RegisterData;
    
    // Validate required fields
    if (!name || !email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'نام، ایمیل و رمز عبور الزامی هستند' })
      };
    }

    // Check for existing user
    const existingUser = await query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'این ایمیل قبلا ثبت شده است' })
      };
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user with explicit parameter types
    const newUser = await query<SafeUser>(
      `INSERT INTO users (name, email, password, phone, address, role) 
       VALUES ($1, $2, $3, $4, $5, 'user') 
       RETURNING id, name, email, phone, address, role`,
      [
        name, 
        email, 
        hashedPassword, 
        phone || null, // Ensure null instead of undefined
        address || null // Ensure null instead of undefined
      ]
    );
    
    return {
      statusCode: 201,
      body: JSON.stringify(newUser.rows[0])
    };
  } catch (err) {
    console.error('Registration error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطای سرور' })
    };
  }
};

export { handler };