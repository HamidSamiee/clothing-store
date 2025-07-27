import ZarinPal from 'zarinpal-checkout';

const zarinpal = ZarinPal.create('YOUR_MERCHANT_ID', true);

export const requestPayment = async (amount: number, description: string) => {
  const response = await zarinpal.PaymentRequest({
    Amount: amount,
    CallbackURL: 'https://your-site.vercel.app/verify',
    Description: description,
  });
  
  if (response.status === 100) {
    window.location.href = response.url;
  }
};