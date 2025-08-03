// netlify/functions/answers.ts
import { query } from './db';
import { Handler } from '@netlify/functions';

interface Answer {
  id: string;
  questionId: string;
  userId: string;
  userName: string;
  answer: string;
  isAdmin: boolean;
  createdAt: string;
}

interface ErrorResponse {
  message: string;
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'متد غیرمجاز' } as ErrorResponse)
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'بدنه درخواست الزامی است' } as ErrorResponse)
    };
  }

  try {
    const { questionId, userId, userName, answer, isAdmin } = JSON.parse(event.body);

    // اعتبارسنجی داده‌ها
    if (!questionId || !userId || !answer) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'داده‌های ناقص ارسال شده است' } as ErrorResponse)
      };
    }

    // ذخیره پاسخ در دیتابیس
    const result = await query<{ id: string; created_at: string }>(
        `INSERT INTO answers (question_id, user_id, answer)
         VALUES ($1, $2, $3)
         RETURNING id, created_at`,
        [questionId, userId, answer]
      );
    
    const newAnswer: Answer = {
      id: result.rows[0].id,
      questionId,
      userId: userId.toString(),
      userName: userName || 'کاربر',
      answer,
      isAdmin: isAdmin || false,
      createdAt: result.rows[0].created_at
    };

    return {
      statusCode: 201,
      body: JSON.stringify(newAnswer)
    };

  } catch (error) {
    console.error('خطا در ثبت پاسخ:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'خطا در ثبت پاسخ جدید' } as ErrorResponse)
    };
  }
};

export { handler };