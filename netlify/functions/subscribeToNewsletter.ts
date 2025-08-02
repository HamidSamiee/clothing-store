import { query } from './db';
import { Handler } from '@netlify/functions';

interface NewsletterSubscription {
  email: string;
}

interface NewsletterResponse {
  success?: boolean;
  message?: string;
}

const handler: Handler = async (event) => {
  // بررسی وجود بدنه درخواست
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'بدون داده' } as NewsletterResponse)
    };
  }

  try {
    const { email } = JSON.parse(event.body) as NewsletterSubscription;

    // اعتبارسنجی ایمیل
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'فرمت ایمیل نامعتبر است' } as NewsletterResponse)
      };
    }

    // بررسی وجود ایمیل در دیتابیس
    const existingSub = await query<{ email: string }>(
      'SELECT email FROM newsletter_subscriptions WHERE email = $1', 
      [email]
    );
    
    if (existingSub.rows.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'این ایمیل قبلا ثبت شده است' } as NewsletterResponse)
      };
    }
    
    // ثبت ایمیل جدید
    await query(
      'INSERT INTO newsletter_subscriptions (email) VALUES ($1)',
      [email]
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true } as NewsletterResponse)
    };
  } catch (error: unknown) {
    // مدیریت خطاها با توجه به انواع داده‌های شما
    let errorMessage = 'خطای سرور';
    
    if (error instanceof Error) {
      console.error('خطا در عضویت خبرنامه:', error.message);
      
      // بررسی خطای محدودیت یکتایی
      if (error.message.includes('unique constraint')) {
        errorMessage = 'این ایمیل قبلا ثبت شده است';
      }
      // بررسی خطای اتصال به دیتابیس
      else if (error.message.includes('connection')) {
        errorMessage = 'خطا در ارتباط با سرور';
      }
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({ message: errorMessage } as NewsletterResponse)
    };
  }
};

export { handler };