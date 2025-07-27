import ZarinPal from 'zarinpal-checkout';

export const usePayment = () => {
  const initiatePayment = async (amount: number, description: string) => {
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
      throw error;
    }
  };

  const verifyPayment = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authority = urlParams.get('Authority');
    const status = urlParams.get('Status');

    if (status === 'OK') {
      const paymentData = JSON.parse(localStorage.getItem('zarinpalPayment') || '{}');
      return {
        success: true,
        amount: paymentData.amount,
        authority
      };
    }

    return { success: false };
  };

  return { initiatePayment, verifyPayment };
};
