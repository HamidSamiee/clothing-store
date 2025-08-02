import { query } from './db';
import { Handler } from '@netlify/functions';
import { User } from '@/types/User'; 


interface UpdateData {
  name?: string;
  phone?: string;
  address?: string;
}

interface SuccessResponse {
  user: Omit<User, 'password'>;
}

interface ErrorResponse {
  message: string;
}

const handler: Handler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'بدون داده' } as ErrorResponse)
    };
  }

  const userId = event.queryStringParameters?.id;
  let updateData: UpdateData;

  try {
    updateData = JSON.parse(event.body);
  } catch  {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'فرمت داده نامعتبر' } as ErrorResponse)
    };
  }

  if (!userId || isNaN(Number(userId))) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'شناسه کاربر معتبر الزامی است' } as ErrorResponse)
    };
  }

  if (!updateData.name && !updateData.phone && !updateData.address) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'حداقل یک فیلد برای به‌روزرسانی الزامی است' } as ErrorResponse)
    };
  }

  try {
    // تعریف صریح نوع پارامترها به صورت آرایه ای از union types
    const params: Array<string | null | number> = [
      updateData.name ? updateData.name.trim() : null,
      updateData.phone ? updateData.phone.trim() : null,
      updateData.address ? updateData.address.trim() : null,
      Number(userId) // تبدیل به عدد برای تطابق با نوع دیتابیس
    ];

    const updateResult = await query<Omit<User, 'password'>>(
      `UPDATE users 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address)
       WHERE id = $4
       RETURNING id, name, email, phone, address, role`,
      params
    );

    if (updateResult.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'کاربر یافت نشد' } as ErrorResponse)
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ user: updateResult.rows[0] } as SuccessResponse)
    };
  } catch (error: unknown) {
    console.error('خطا در به‌روزرسانی پروفایل:', error);

    let errorMessage = 'خطای سرور';
    if (error instanceof Error) {
      errorMessage = error.message.includes('connection')
        ? 'خطا در ارتباط با پایگاه داده'
        : error.message.includes('violates')
        ? 'خطا در اعتبارسنجی داده‌ها'
        : errorMessage;
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: errorMessage } as ErrorResponse)
    };
  }
};

export { handler };