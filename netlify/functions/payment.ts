import ZarinPal from 'zarinpal-checkout';
import { Handler } from '@netlify/functions';

const zarinpal = ZarinPal.create('eaa1ef97-2c45-11e8-b7f0-005056a205be', true);

interface PaymentRequest {
  amount: number;
  description: string;
}

export const handler: Handler = async (event) => {
  try {
    // بررسی وجود body در event
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'بدون داده' })
      };
    }

    const { amount, description }: PaymentRequest = JSON.parse(event.body);

    // اعتبارسنجی مقادیر ورودی
    if (!amount || !description) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'مقادیر amount و description الزامی هستند' })
      };
    }

    const response = await zarinpal.PaymentRequest({
      Amount: amount * 10, // تبدیل به ریال
      CallbackURL: `${process.env.BASE_URL}/verify`,
      Description: description,
    });

    if (response.status === 100) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          url: `https://sandbox.zarinpal.com/pg/StartPay/${response.authority}`,
        }),
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'خطا در پرداخت' }),
    };
  } catch (err) {
    console.error('Payment error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'خطا در سرور پرداخت' }),
    };
  }
};