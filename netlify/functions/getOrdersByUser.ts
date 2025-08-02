import { Order, OrderItem } from '@/types/Order';
import { query } from './db';
import { Handler } from '@netlify/functions';


interface ErrorResponse {
    message: string;
  }
  
  const handler: Handler = async (event) => {
    // استخراج شناسه کاربر از پارامترهای درخواست
    const userId = event.queryStringParameters?.userId;
  
    // اعتبارسنجی شناسه کاربر
    if (!userId || isNaN(Number(userId))) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'شناسه کاربر معتبر الزامی است' } as ErrorResponse)
      };
    }
  
    try {
      // دریافت سفارشات کاربر از دیتابیس
      const ordersResult = await query<Order>(
        `SELECT o.* FROM orders o
         JOIN user_orders uo ON o.id = uo.order_id
         WHERE uo.user_id = $1
         ORDER BY o.created_at DESC`,
        [Number(userId)]
      );
  
      // دریافت آیتم‌های هر سفارش
      const ordersWithItems = await Promise.all(
        ordersResult.rows.map(async (order) => {
          const itemsResult = await query<OrderItem>(
            'SELECT * FROM order_items WHERE order_id = $1',
            [order.id]
          );
  
          return {
            ...order,
            items: itemsResult.rows
          };
        })
      );
  
      return {
        statusCode: 200,
        body: JSON.stringify(ordersWithItems)
      };
    } catch (error: unknown) {
      // مدیریت خطاها به صورت حرفه‌ای
      console.error('خطا در دریافت سفارشات:', error);
  
      let errorMessage = 'خطای سرور';
      if (error instanceof Error) {
        errorMessage = error.message.includes('connection')
          ? 'خطا در ارتباط با پایگاه داده'
          : errorMessage;
      }
  
      return {
        statusCode: 500,
        body: JSON.stringify({ message: errorMessage } as ErrorResponse)
      };
    }
  };
  
  export { handler };