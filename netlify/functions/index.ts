// netlify/functions/index.ts
import { handler as getUserById } from './users/getUserById';
import { handler as login } from './auth/login';
import { handler as updateUserProfile } from './users/updateUserProfile';
import { handler as getFeaturedProducts } from './products/getFeaturedProducts';
import { handler as register } from './auth/register';
import { handler as getCategories } from './categories/getCategories';
import { handler as getCategoryBySlug } from './categories/getCategoryBySlug';
import { handler as subscribeToNewsletter } from './newsletter/subscribeToNewsletter';
import { handler as cancelOrder } from './orders/cancelOrder';
import { handler as createOrder } from './orders/createOrder';
import { handler as getOrderDetails } from './orders/getOrderDetails';
import { handler as getOrders } from './orders/getOrders';
import { handler as getOrdersByUser } from './orders/getOrdersByUser';
import { handler as getProductsForOrder } from './orders/getProductsForOrder';
import { handler as updateOrderStatus } from './orders/updateOrderStatus';
import { handler as  addProduct} from './products/addProduct';
import { handler as deleteProduct } from './products/deleteProduct';
import { handler as updateProduct } from './products/updateProduct';
import { handler as getProductById } from './products/getProductById';
import { handler as getProducts } from './products/getProducts';
import { handler as getProductsByIds } from './products/getProductsByIds';
import { handler as searchProducts } from './products/searchProducts';
import { handler as addReview } from './reviews/addReview';
import { handler as deleteReview } from './reviews/deleteReview';
import { handler as getProductReviews } from './reviews/getProductReviews';
import { handler as addToWishlist } from './wishlist/addToWishlist';
import { handler as getWishlist } from './wishlist/getWishlist';
import { handler as removeFromWishlist } from './wishlist/removeFromWishlist';
import { handler as payment } from './payments/payment';
import './utils/db';
import './utils/normalizeProduct';



export {
    addReview,
    deleteReview,
    getProductReviews,
    addToWishlist,
    getWishlist,
    removeFromWishlist,
  addProduct,
  deleteProduct,
  updateProduct,
  getProductById,
  getProducts,
  getProductsByIds,
  searchProducts,
  getFeaturedProducts,
  getUserById,
  updateUserProfile,
  register,
  login,
  getCategoryBySlug,
  getCategories,
  subscribeToNewsletter,
  updateOrderStatus,
  cancelOrder,
  createOrder,
  getOrderDetails,
  getOrders,
  getOrdersByUser,
  getProductsForOrder,
  payment
};