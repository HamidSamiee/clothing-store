import ZarinPal from 'zarinpal-checkout';
const isSandbox = true;

export async function handler(event) {
  try {
    const { amount, description } = JSON.parse(event.body);

    const zarinpalClient = ZarinPal.create(
      isSandbox ? '00000000-0000-0000-0000-000000000000' : 'MERCHANT_ID_REAL',
      isSandbox
    );

    const response = await zarinpalClient.request({
      amount: amount * 10,
      callback_url: `${process.env.BASE_URL || 'https://modina.netlify.app'}/payment-verification`,
      description,
    });

    if (response.code === 100) {
      return {
        statusCode: 200,
        body: JSON.stringify({ url: response.url })
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: response.message || 'خطا در پرداخت' })
    };
  } catch (err) {
    console.error('Server error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'خطا در سرور پرداخت' })
    };
  }
}
