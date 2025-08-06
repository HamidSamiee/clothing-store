// hooks/usePayment.ts
import { useState } from 'react';
import { toast } from 'react-toastify';
import { createOrder } from '@/services/orderService';
import { Order } from '@/types/Order';

interface PaymentResponse {
  url: string;
  orderId: number;
}

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (
    amount: number,
    description: string,
    orderData: Omit<Order, 'id' | 'date' | 'status' | 'userName' | 'userEmail'>
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // اعتبارسنجی داده‌ها
      if (!amount || amount <= 0) {
        throw new Error('مبلغ پرداخت نامعتبر است');
      }

      if (!orderData.total || orderData.total <= 0) {
        throw new Error('مبلغ سفارش نامعتبر است');
      }

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

      const data: PaymentResponse = await res.json();

      if (!res.ok) {
        throw new Error('خطا در پرداخت');
      }

      localStorage.setItem('zarinpalPayment', JSON.stringify({ 
        amount, 
        authority: data.url.split('/').pop(),
        orderId: data.orderId
      }));
      
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در پرداخت');
      console.error('Payment error:', err);
      throw err;
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