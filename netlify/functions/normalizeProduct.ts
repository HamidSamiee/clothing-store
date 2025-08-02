import { Product, RawProduct } from '@/types/Product';
import { Review } from '@/types/Review';

export const normalizeProduct = (product: RawProduct): Product => {
  // تبدیل reviews از string به آرایه در صورت نیاز
  let normalizedReviews: Review[] = [];
  if (product.reviews) {
    normalizedReviews = typeof product.reviews === 'string' 
      ? JSON.parse(product.reviews) 
      : product.reviews;
  }

  // محاسبه میانگین امتیازها
  let averageRating = 0;
  if (normalizedReviews.length > 0) {
    averageRating = normalizedReviews.reduce(
      (sum: number, review: Review) => sum + review.rating, 
      0
    ) / normalizedReviews.length;
  }

  return {
    ...product,
    id: product.id?.toString() || '', // مقدار پیش‌فرض برای id
    price: Number(product.price) || 0,
    discount: product.discount ? Number(product.discount) : undefined,
    rating: Number(product.rating) || 0,
    stock: Number(product.stock) || 0,
    sizes: Array.isArray(product.sizes) 
      ? product.sizes 
      : typeof product.sizes === 'string' 
        ? product.sizes.split(',').map(s => s.trim())
        : [],
    colors: Array.isArray(product.colors) 
      ? product.colors 
      : typeof product.colors === 'string' 
        ? product.colors.split(',').map(c => c.trim())
        : [],
    specifications: product.specifications || {},
    reviews: normalizedReviews,
    averageRating
  };
};