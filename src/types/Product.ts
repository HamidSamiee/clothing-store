import { CartItem } from "./Cart";
import { Review } from "./Review";

export type ProductSortOption = 'price_asc' | 'price_desc' | 'rating' | 'newest';

export interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  description: string;
  specifications?: Record<string, string>;
  category: string;
  image: string;
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
  sort?: ProductSortOption; // استفاده از نوع تعریف شده
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
  onAddToCart?: (product: Omit<CartItem, 'quantity'>) => void;
  onClick?: () => void
}

export interface RawProduct extends Omit<Product, 'id' | 'price' | 'rating' | 'stock' | 'sizes' | 'colors' | 'reviews'> {
  id?: string | number;
  price: string | number;
  rating: string | number;
  stock: string | number;
  sizes: string | string[];
  colors: string | string[];
  reviews?: string; // برای حالت سریالیزه شده
  [key: string]: string | number | boolean | string[] | number[] | Record<string, string> | undefined;
}