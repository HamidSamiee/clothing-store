declare module 'zarinpal-checkout' {
  const ZarinPal: {
    create: (merchantId: string, sandbox: boolean) => {
      PaymentRequest: (options: {
        Amount: number;
        CallbackURL: string;
        Description: string;
      }) => Promise<{ status: number; url: string; authority: string }>;
      PaymentVerification: (options: {
        Amount: number;
        Authority: string;
      }) => Promise<{ status: number; RefID: string }>;
    };
  };
  export default ZarinPal;
}