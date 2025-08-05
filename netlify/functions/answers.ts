// netlify/functions/answers.ts
import { query } from './db';
import { Handler } from '@netlify/functions';
import { v4 as uuidv4 } from 'uuid';

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

    const answerId = uuidv4();

    // ذخیره پاسخ در دیتابیس
    const result = await query<{ created_at: string }>(
      `INSERT INTO answers (id, question_id, user_id, user_name, answer, is_admin)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING created_at`,
      [answerId, questionId, userId, userName || 'کاربر', answer, isAdmin || false]
    );
    
    const newAnswer: Answer = {
      id: answerId,
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
      body: JSON.stringify({ 
        message: 'خطا در ثبت پاسخ جدید',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      } as ErrorResponse)
    };
  }
};

export { handler };