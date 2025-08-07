import { useState } from 'react';

interface PaymentSuccessResponse {
  success: true;
  paymentUrl: string;
  authority: string;
}

interface PaymentErrorResponse {
  success: false;
  error: string;
  paymentUrl?: never;
  authority?: never;
}

type PaymentResponse = PaymentSuccessResponse | PaymentErrorResponse;

interface VerifyResponse {
  success: boolean;
  orderId?: number;
  amount?: number;
  authority?: string;
  error?: string;
}

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (
    amount: number,
    description: string,
    orderData: {
      userId: number;
      items: Array<{
        productId: number;
        quantity: number;
        price: number;
      }>;
      shippingAddress: string;
      paymentMethod: string;
    }
  ): Promise<PaymentResponse> => {
    if (isLoading) {
      return {
        success: false,
        error: 'در حال پردازش درخواست قبلی'
      };
    }
  
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/.netlify/functions/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          description,
          userId: Number(orderData.userId),
          callbackUrl: `${window.location.origin}/verify`,
          metadata: {
            items: orderData.items,
            shippingAddress: orderData.shippingAddress,
            paymentMethod: orderData.paymentMethod
          }
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.error || 'خطا در پرداخت');
      }
  
      if (!data?.paymentUrl || !data?.authority) {
        throw new Error('پاسخ نامعتبر از سرور دریافت شد');
      }
  
      // ذخیره موقت داده‌های پرداخت
      sessionStorage.setItem('paymentData', JSON.stringify({
        amount: Number(amount),
        userId: orderData.userId,
        items: orderData.items,
        shippingAddress: orderData.shippingAddress,
        authority: data.authority,
      }));
  
      return {
        success: true,
        paymentUrl: data.paymentUrl,
        authority: data.authority
      };
  
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در پرداخت';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (
    authority?: string, 
    status?: string
  ): Promise<VerifyResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentAuthority = authority || urlParams.get('Authority');
      const paymentStatus = status || urlParams.get('Status');
  
      if (paymentStatus !== 'OK') {
        return { success: false, error: 'پرداخت ناموفق بود' };
      }

      // بازیابی داده‌های پرداخت
      const paymentDataStr = sessionStorage.getItem('paymentData');

      if (!paymentDataStr) {
        throw new Error('اطلاعات پرداخت یافت نشد');
      }

      const paymentData = JSON.parse(paymentDataStr);
      
      // اعتبارسنجی داده‌ها
      if (!paymentData.userId || !paymentData.amount || !paymentAuthority) {
        throw new Error('اطلاعات پرداخت ناقص است');
      }

      // ثبت سفارش نهایی
      const orderResponse = await fetch('/.netlify/functions/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(paymentData.userId),
          items: paymentData.items || [],
          total: Number(paymentData.amount),
          paymentMethod: 'zarinpal',
          shippingAddress: paymentData.shippingAddress,
          authority: paymentAuthority
        }),
      });

      const responseData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(responseData.message || 'خطا در ثبت سفارش');
      }
       const result= {
        success: true,
        orderId: responseData.orderId,
        amount: responseData.amount,
        authority: responseData.authority
      };   

      sessionStorage.removeItem('paymentData');
      
      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطا در تأیید پرداخت';
      setError(errorMessage);
      return { 
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { initiatePayment, verifyPayment, isLoading, error };
};