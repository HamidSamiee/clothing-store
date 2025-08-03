import { query } from './db';
import { Handler } from '@netlify/functions';

interface NewsletterSubscription {
  email: string;
}

const handler: Handler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'لطفا ایمیل خود را وارد کنید' })
    };
  }

  try {
    const { email } = JSON.parse(event.body) as NewsletterSubscription;

    // اعتبارسنجی پیشرفته ایمیل
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'فرمت ایمیل نامعتبر است' })
      };
    }

    // بررسی وجود ایمیل (با CASE INSENSITIVE)
    const existingSub = await query(
      'SELECT id FROM newsletter_subscriptions WHERE LOWER(email) = LOWER($1)', 
      [email]
    );
    
    if (existingSub.rows.length > 0) {
      return {
        statusCode: 409, // کد وضعیت Conflict
        body: JSON.stringify({ message: 'این ایمیل قبلا ثبت شده است' })
      };
    }
    
    // ثبت جدید با تاریخ جاری
    await query(
      'INSERT INTO newsletter_subscriptions (email) VALUES ($1)',
      [email.trim()] // حذف فاصله‌های اضافه
    );
    
    return {
      statusCode: 201,
      body: JSON.stringify({ success: true, message: 'عضویت شما با موفقیت ثبت شد' })
    };
    
  } catch (error) {
    console.error('خطا در ثبت خبرنامه:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'خطایی در سرور رخ داده است. لطفا بعدا تلاش کنید' 
      })
    };
  }
};

export { handler };