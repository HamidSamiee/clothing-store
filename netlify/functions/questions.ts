// netlify/functions/questions.ts
import { query } from './db';
import { Handler } from '@netlify/functions';
import { Question, Answer } from '@/types/Review';

interface QuestionsResponse {
  questions: Question[];
}

interface ErrorResponse {
  message: string;
}

interface QuestionQueryResult {
  id: string;
  question: string;
  created_at: string;
  user_id: string;
  user_name: string;
  product_id: string;
  answer_id?: string;
  answer?: string;
  answer_created_at?: string;
  answer_user_id?: string;
  answer_user_name?: string;
  is_admin?: boolean;
}

const handler: Handler = async (event) => {
  const httpMethod = event.httpMethod;

  if (httpMethod === 'GET') {
    const productIdParam = event.queryStringParameters?.productId;

    if (!productIdParam) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'شناسه محصول الزامی است' } as ErrorResponse)
      };
    }

    try {
      // با توجه به اینکه product_id در دیتابیس از نوع varchar(20) است، نیازی به تبدیل به عدد نیست
      const productId = productIdParam;

      const questionsResult = await query<QuestionQueryResult>(
        `SELECT 
          q.id, 
          q.question, 
          q.created_at,
          q.product_id,
          q.user_id,
          q.user_name,
          a.id as answer_id, 
          a.answer, 
          a.created_at as answer_created_at,
          a.user_id as answer_user_id, 
          a.user_name as answer_user_name, 
          a.is_admin
         FROM questions q
         LEFT JOIN answers a ON q.id = a.question_id
         WHERE q.product_id = $1
         ORDER BY q.created_at DESC, a.created_at ASC`,
        [productId]
      );

      const questionsMap = new Map<string, Question>();
      
      questionsResult.rows.forEach(row => {
        if (!questionsMap.has(row.id)) {
          const question: Question = {
            id: row.id,
            productId: row.product_id,
            userId: row.user_id,
            userName: row.user_name,
            question: row.question,
            answers: [],
            createdAt: row.created_at
          };
          questionsMap.set(row.id, question);
        }

        if (row.answer_id && row.answer) {
          const question = questionsMap.get(row.id)!;
          const answer: Answer = {
            id: row.answer_id,
            questionId: row.id,
            userId: row.answer_user_id || '',
            userName: row.answer_user_name || '',
            answer: row.answer,
            isAdmin: row.is_admin || false,
            createdAt: row.answer_created_at || new Date().toISOString()
          };
          question.answers.push(answer);
        }
      });

      const response: QuestionsResponse = {
        questions: Array.from(questionsMap.values())
      };

      return {
        statusCode: 200,
        body: JSON.stringify(response)
      };

    } catch (error) {
      console.error('خطا در دریافت سوالات:', error);
      let errorMessage = 'خطا در دریافت سوالات محصول';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
    
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          message: errorMessage,
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined
        } as ErrorResponse)
      };
    }    
  }

  else if (httpMethod === 'POST') {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'بدنه درخواست الزامی است' } as ErrorResponse)
      };
    }

    try {
      const { productId, userId, userName, question } = JSON.parse(event.body);

      if (!productId || !userId || !question) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'داده‌های ناقص ارسال شده است' } as ErrorResponse)
        };
      }

      // با توجه به ساختار دیتابیس:
      // product_id: varchar(20)
      // user_id: int8 (bigint)
      const result = await query<{ id: string, created_at: string }>(
        `INSERT INTO questions (product_id, user_id, user_name, question)
         VALUES ($1, $2::bigint, $3, $4)
         RETURNING id, created_at`,
        [productId, userId, userName, question]
      );

      const newQuestion: Question = {
        id: result.rows[0].id,
        productId,
        userId: userId.toString(),
        userName: userName || 'کاربر',
        question,
        answers: [],
        createdAt: result.rows[0].created_at
      };

      return {
        statusCode: 201,
        body: JSON.stringify(newQuestion)
      };

    } catch (error) {
      console.error('خطا در ثبت سوال:', error);
      let errorMessage = 'خطا در ثبت سوال جدید';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
    
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          message: errorMessage,
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined
        } as ErrorResponse)
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ message: 'متد غیرمجاز' } as ErrorResponse)
  };
};

export { handler };