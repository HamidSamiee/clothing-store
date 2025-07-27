import { CartItem } from "./Cart";
import { Review } from "./Review";

export interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  description: string;
  specifications?: Record<string, string>;
  category: string;
  images: string[];
  rating: number;
  sizes: string[];
  colors: string[];
  stock: number;
  featured?: boolean;
  reviews?: Review[];
  averageRating?: number;
  shareUrl?: string; // اضافه کردن URL اشتراک‌گذاری
}

export interface ProductFilterOptions {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
  perPage?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}


export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    discount?: number;
    image: string;
    category: string;
    rating: number;
  };
  showBadge?: boolean;
  onAddToCart: (product: Omit<CartItem, 'quantity'>) => void;

}