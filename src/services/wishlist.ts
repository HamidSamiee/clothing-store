// services/wishlistService.ts
import http from '@/services/httpService';

export const getWishlist = async (userId: string): Promise<string[]> => {
  try {
    const response = await http.get(`/users/${userId}`);
    return response.data.wishlist || [];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
};

export const addToWishlist = async (userId: string, productId: string) => {
  try {
    const currentWishlist = await getWishlist(userId);
    
    if (currentWishlist.includes(productId)) {
      return; // قبلاً اضافه شده
    }

    // به‌روزرسانی لیست کاربر
    await http.patch(`/users/${userId}`, {
      wishlist: [...currentWishlist, productId]
    });

    // به‌روزرسانی تعداد علاقه‌مندی‌های محصول
    const product = await http.get(`/products/${productId}`);
    await http.patch(`/products/${productId}`, {
      wishlistCount: (product.data.wishlistCount || 0) + 1
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (userId: string, productId: string) => {
  try {
    const currentWishlist = await getWishlist(userId);
    
    // به‌روزرسانی لیست کاربر
    await http.patch(`/users/${userId}`, {
      wishlist: currentWishlist.filter(id => id !== productId)
    });

    // به‌روزرسانی تعداد علاقه‌مندی‌های محصول
    const product = await http.get(`/products/${productId}`);
    await http.patch(`/products/${productId}`, {
      wishlistCount: Math.max(0, (product.data.wishlistCount || 0) - 1)
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};