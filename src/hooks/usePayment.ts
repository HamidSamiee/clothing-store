import { useState } from 'react';
import { toast } from 'react-toastify';


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

  const verifyPayment = (authority?: string, status?: string) => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentAuthority = authority || urlParams.get('Authority');
      const paymentStatus = status || urlParams.get('Status');

      if (paymentStatus === 'OK') {
        const paymentData = JSON.parse(localStorage.getItem('zarinpalPayment') || '{}');
        toast.success("پرداخت تایید شد");
        return {
          success: true,
          amount: paymentData.amount,
          authority: paymentAuthority
        };
      }
      return { success: false };
    } catch (error) {
      console.error('Verification error:', error);
      setError('خطا در تأیید پرداخت');
      return { success: false };
    }
  };

  return { initiatePayment, verifyPayment, isLoading, error };
};
