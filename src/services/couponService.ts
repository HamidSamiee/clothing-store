import http from "./httpService";

export const validateCoupon = async (code: string) => {

      const response = await http.get('/coupons', {
        params: { code },
      });
      
      if (response.data.length === 0) {
        throw new Error('کوپن معتبر نیست');
      }
  
      const coupon = response.data[0];
      const today = new Date().toISOString().split('T')[0];
      
      if (coupon.validUntil < today) {
        throw new Error('کوپن منقضی شده است');
      }
  
      return coupon;
   
  };