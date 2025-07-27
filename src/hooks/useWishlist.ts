// src/hooks/useWishlist.ts
import { useEffect, useState } from 'react';

const useWishlist = (userId?: string) => {
  const [wishlist, setWishlist] = useState<string[]>([]);

  // بارگذاری لیست از localStorage
  useEffect(() => {
    if (!userId) return;
    const saved = localStorage.getItem(`wishlist_${userId}`);
    setWishlist(saved ? JSON.parse(saved) : []);
  }, [userId]);

  // بررسی وجود محصول در لیست
  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // افزودن/حذف از لیست
  const toggleWishlist = (productId: string) => {
    if (!userId) return false;
    
    const updated = isInWishlist(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];

    localStorage.setItem(`wishlist_${userId}`, JSON.stringify(updated));
    setWishlist(updated);
    return true;
  };

  return { wishlist, isInWishlist, toggleWishlist };
};

export default useWishlist;