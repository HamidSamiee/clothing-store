// netlify/functions/payment.ts

import ZarinPal from 'zarinpal-checkout';

const zarinpal = ZarinPal.create('eaa1ef97-2c45-11e8-b7f0-005056a205be', true);

export async function handler(event) {
  try {
    const { amount, description } = JSON.parse(event.body);

    const response = await zarinpal.PaymentRequest({
      Amount: amount * 10,
      CallbackURL: `${process.env.BASE_URL}/verify`,
      Description: description,
    });

    if (response.status === 100) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          url: `https://sandbox.zarinpal.com/pg/StartPay/${response.authority}`,
        }),
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'خطا در پرداخت' }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'خطا در سرور پرداخت' }),
    };
  }
}
