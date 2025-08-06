
// hooks/usePayment.ts
import { useState } from 'react';
import { toast } from 'react-toastify';
import { createOrder } from '@/services/orderService';

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (amount: number, description: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, description }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        localStorage.setItem('zarinpalPayment', JSON.stringify({ amount, authority: data.url.split('/').pop() }));
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'خطا در پرداخت');
      }
    } catch  {
      
      console.error('Payment error:');
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
        const cartData = JSON.parse(localStorage.getItem('cart') || '{}');
        
        // ایجاد سفارش در دیتابیس
        const orderResponse = await createOrder({
          userId: cartData.userId,
          items: cartData.items,
          total: paymentData.amount,
          paymentMethod: 'زرین‌پال',
          shippingAddress: cartData.shippingAddress
        });

        if (orderResponse.success) {
          toast.success("پرداخت و ثبت سفارش با موفقیت انجام شد");
          localStorage.removeItem('cart');
          localStorage.removeItem('zarinpalPayment');
          return {
            success: true,
            order: orderResponse.data,
            amount: paymentData.amount,
            authority: paymentAuthority
          };
        } else {
          throw new Error('خطا در ثبت سفارش');
        }
      }
      
      return { success: false };
    } catch (error) {
      console.error('خطا در تأیید پرداخت:', error);
      setError('خطا در تأیید پرداخت یا ثبت سفارش');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { verifyPayment,initiatePayment, isLoading, error };
};