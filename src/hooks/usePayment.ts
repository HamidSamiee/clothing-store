// hooks/usePayment.ts
import { useState } from 'react';
import { toast } from 'react-toastify';
import { createOrder } from '@/services/orderService';
import { OrderData } from '@/types/Order';

// interface PaymentResponse {
//   url: string;
//   orderId: number;
// }

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (
    amount: number,
    description: string,
    orderData: OrderData
  ) => {
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
        amount, 
        authority: data.url.split('/').pop(),
        orderId: data.orderId
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

      if (paymentStatus === 'OK') {
        const paymentData = JSON.parse(localStorage.getItem('zarinpalPayment') || '{}');
        
        const orderResponse = await createOrder({
          userId: paymentData.userId,
          items: paymentData.items,
          total: paymentData.amount,
          paymentMethod: 'zarinpal',
          shippingAddress: paymentData.shippingAddress
        });

        if (orderResponse.success) {
          toast.success("پرداخت و ثبت سفارش با موفقیت انجام شد");
          localStorage.removeItem('zarinpalPayment');
          return {
            success: true,
            order: orderResponse.data,
            amount: paymentData.amount,
            authority: paymentAuthority
          };
        }
      }
      
      return { success: false };
    } catch (error) {
      console.error('خطا در تأیید پرداخت:', error);
      setError('خطا در تأیید پرداخت');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { initiatePayment, verifyPayment, isLoading, error };
};