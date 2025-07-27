import { Review } from "@/types/Review";
import http from "./httpService";

export const getProductReviews = async (productId: number) => {
  const response = await http.get('/reviews', {
    params: { productId },
  });
  return response.data;
};

export const addReview = async (reviewData: Omit<Review, 'id' | 'date'>) => {
  const newReview = {
    ...reviewData,
    date: new Date().toISOString().split('T')[0], // تاریخ امروز
  };
  const response = await http.post('/reviews', newReview);
  return response.data;
};

export const deleteReview = async (id: number) => {
  const response = await http.delete(`/reviews/${id}`);
  return response.data;
};
