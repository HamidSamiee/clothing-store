import { Handler } from '@netlify/functions';
import ZarinPal from 'zarinpal-checkout';

const zarinpal = ZarinPal.create("e6965f6e-b82e-11e9-b17a-000c29344814", true);



interface PaymentRequest {
  amount: number; // مبلغ به تومان
  description: string;
  userId: number; // مطابق با user_id در دیتابیس (int8)
  callbackUrl: string;
  metadata?: {
    items?: Array<{
      productId: number;
      quantity: number;
      price: number;
    }>;
    shippingAddress?: string; // متن مطابق با فیلد shipping_address
    paymentMethod?: string; // متن مطابق با فیلد payment_method
  };
}

export const handler: Handler = async (event) => {
  console.log('Received request:', {
    headers: event.headers,
    body: event.body
  });

  // 1. اعتبارسنجی اولیه
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: 'بدون داده ارسالی',
        code: 'MISSING_BODY'
      })
    };
  }

  let parsedBody: PaymentRequest;
  try {
    parsedBody = JSON.parse(event.body);
  } catch  {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: 'فرمت JSON نامعتبر',
        code: 'INVALID_JSON'
      })
    };
  }

  // 2. اعتبارسنجی فیلدهای ضروری
  const validationErrors: Record<string, string> = {};
  
  if (!parsedBody.amount || isNaN(parsedBody.amount) || parsedBody.amount <= 0) {
    validationErrors.amount = 'مبلغ باید عددی مثبت باشد';
  }

  if (!parsedBody.description || parsedBody.description.trim().length < 5) {
    validationErrors.description = 'توضیحات باید حداقل ۵ کاراکتر داشته باشد';
  }

  if (!parsedBody.userId || isNaN(parsedBody.userId)) {
    validationErrors.userId = 'شناسه کاربر نامعتبر است';
  }

  if (!parsedBody.callbackUrl || !isValidUrl(parsedBody.callbackUrl)) {
    validationErrors.callbackUrl = 'آدرس بازگشت نامعتبر است';
  }

  if (Object.keys(validationErrors).length > 0) {
    console.log('Validation errors:', validationErrors);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'اعتبارسنجی ناموفق',
        validationErrors
      })
    };
  }

  try {
    // 3. درخواست پرداخت به زرین‌پال
    const response = await zarinpal.PaymentRequest({
      Amount: parsedBody.amount * 10, // تبدیل به ریال
      CallbackURL: parsedBody.callbackUrl,
      Description: parsedBody.description,
      Metadata: parsedBody.metadata ? JSON.stringify(parsedBody.metadata) : undefined
    });

    if (response.status !== 100) {
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: 'خطا در درگاه پرداخت',
          code: 'GATEWAY_ERROR',
          gatewayResponse: {
            status: response.status,
            error: response.error || 'خطای نامشخص از درگاه پرداخت'
          }
        })
      };
    }

    // 4. پاسخ موفقیت‌آمیز
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        paymentUrl: `https://sandbox.zarinpal.com/pg/StartPay/${response.authority}`,
        authority: response.authority // اضافه کردن این خط
      })
    };

  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'خطای داخلی سرور',
        code: 'INTERNAL_SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'خطای نامشخص') : 
          undefined
      })
    };
  }
};

// تابع کمکی برای بررسی URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}