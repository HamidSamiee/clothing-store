// hooks/usePayment.ts
import { useState } from 'react';
import { OrderData } from '@/types/Order';

// interface PaymentResponse {
//   url: string;
//   orderId: number;
// }

// interface VerifyPaymentResponse {
//   success: boolean;
//   orderId?: number;
//   amount?: number;
//   authority?: string | null;
//   error?: string;
// }

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (
    amount: number,
    description: string,
    orderData: OrderData
  ) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/.netlify/functions/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: Number(amount),
          description,
          orderData: {
            ...orderData,
            total: Number(orderData.total)
          }
        }),
      });

      if (!res.ok) {
        // تلاش برای خواندن پیام خطا از سرور
        let errorMessage = 'خطا در پرداخت';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();

      if (!data?.url) {
        throw new Error('پاسخ نامعتبر از سرور دریافت شد');
      }

      localStorage.setItem('zarinpalPayment', JSON.stringify({ 
        amount: Number(amount), // ذخیره به صورت عدد
        authority: data.url.split('/').pop(),
        userId: orderData.userId,
        items: orderData.items.map(item => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          price: Number(item.price)
        })),
        shippingAddress: orderData.shippingAddress
      }));
      
      window.location.href = data.url;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در پرداخت';
      setError(errorMessage);
      console.error('Payment error:', err);
      throw err; // پرتاب مجدد خطا برای مدیریت در کامپوننت
    } finally {
      setIsLoading(false);
    }
  };


  const verifyPayment = async (authority?: string, status?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentAuthority = authority || urlParams.get('Authority');
      const paymentStatus = status || urlParams.get('Status');
  
      if (paymentStatus !== 'OK') {
        return { success: false, error: 'پرداخت ناموفق بود' };
      }
  
      // بازیابی و اعتبارسنجی داده‌های پرداخت
      const paymentDataStr = localStorage.getItem('zarinpalPayment');
      if (!paymentDataStr) {
        throw new Error('اطلاعات پرداخت یافت نشد. لطفاً مجدداً تلاش کنید.');
      }
  
      const paymentData = JSON.parse(paymentDataStr);
      
      // اعتبارسنجی مقادیر ضروری
      if (!paymentData.userId || !paymentData.amount) {
        throw new Error('اطلاعات پرداخت ناقص است');
      }
  
      const total = Number(paymentData.amount);
      const userId = Number(paymentData.userId);
  
      if (isNaN(total) || isNaN(userId)) {
        throw new Error('مقادیر پرداخت نامعتبر است');
      }
  
      // ارسال درخواست ایجاد سفارش
      const orderResponse = await fetch('/.netlify/functions/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          items: paymentData.items || [],
          total,
          paymentMethod: 'zarinpal',
          shippingAddress: paymentData.shippingAddress,
          authority: paymentAuthority
        }),
      });
  
      const responseData = await orderResponse.json();
  
      if (!orderResponse.ok) {
        throw new Error(responseData.message || 'خطا در ثبت سفارش');
      }
  
      localStorage.removeItem('zarinpalPayment');
      return {
        success: true,
        orderId: responseData.orderId,
        amount: total,
        authority: paymentAuthority
      };
  
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