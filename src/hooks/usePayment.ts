import { useState } from "react";

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

  const verifyPayment = () => {
    // همان کد قبلی برای تأیید پرداخت
  };

  return { initiatePayment, verifyPayment, isLoading, error };
};
