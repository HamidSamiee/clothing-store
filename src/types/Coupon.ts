export interface Coupon {
    code: string;
    discount: number;
    validUntil: string;
    minPurchase?: number;
    maxDiscount?: number;
  }