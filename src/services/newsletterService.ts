import http from '@/services/httpService';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';


export const subscribeToNewsletter = async (email: string) => {
  try {
    const response = await http.post('/newsletterSubscriptions', { 
      email,
      subscribedAt: new Date().toISOString()
    });
    return response.data;
  }catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "خطا در ارسال درخواست");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("خطای ناشناخته رخ داد");
      }
      throw error;
    }
};