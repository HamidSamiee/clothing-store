import { useState } from 'react';

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (amount: number, description: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'خطا در پرداخت');

      window.location.href = data.url;
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'خطای ناشناخته در پرداخت');
      throw error;
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