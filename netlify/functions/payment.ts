import { Handler } from '@netlify/functions';
import ZarinPal from 'zarinpal-checkout';

const zarinpal = ZarinPal.create("e6965f6e-b82e-11e9-b17a-000c29344814", true);

interface PaymentRequest {
  amount: number;
  description: string;
  userId: number;
  callbackUrl: string;
  metadata?: {
    items?: Array<{
      productId: number;
      quantity: number;
      price: number;
    }>;
    shippingAddress?: string;
  };
}

export const handler: Handler = async (event) => {
  // 1. اعتبارسنجی اولیه
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'بدون داده ارسالی' })
    };
  }

  let parsedBody: PaymentRequest;
  try {
    parsedBody = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'فرمت JSON نامعتبر' })
    };
  }

  // 2. اعتبارسنجی فیلدهای ضروری
  const { amount, description, userId, callbackUrl } = parsedBody;
  if (!amount || !description || !userId || !callbackUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'فیلدهای ضروری ارسال نشده' })
    };
  }

  try {
    // 3. درخواست پرداخت به زرین‌پال
    const response = await zarinpal.PaymentRequest({
      Amount: amount * 10, // تبدیل به ریال
      CallbackURL: callbackUrl,
      Description: description,
      Metadata: parsedBody.metadata ? JSON.stringify(parsedBody.metadata) : undefined
    });

    // 4. بررسی پاسخ زرین‌پال
    if (response.status !== 100) {
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: 'خطا در درگاه پرداخت',
          details: response
        })
      };
    }

    // 5. پاسخ موفق
    return {
      statusCode: 200,
      body: JSON.stringify({
        paymentUrl: `https://sandbox.zarinpal.com/pg/StartPay/${response.authority}`,
        authority: response.authority
      })
    };

  } catch (error) {
    console.error('Payment error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'خطای داخلی سرور',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};