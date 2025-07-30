import { useState } from 'react';
import { toast } from 'react-toastify';
import ZarinPal from 'zarinpal-checkout';

const isSandbox = true;

const zarinpal = ZarinPal.create(
  isSandbox ? '00000000-0000-0000-0000-000000000000' : 'MERCHANT_ID_REAL',
  isSandbox
);


export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (amount: number, description: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await zarinpal.request({
        amount: amount * 10, // به ریال
        callback_url: 'https://modina.netlify.app/verify',
        description,
      });

      if (response.code === 100) {
        localStorage.setItem(
          'zarinpalPayment',
          JSON.stringify({ amount, authority: response.authority })
        );
        window.location.href = response.url;
      } else {
        throw new Error('خطا در ایجاد پرداخت. کد وضعیت: ' + response.code);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      throw err;
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
