import http from '@/services/httpService';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

export const subscribeToNewsletter = async (email: string) => {
  try {
    const response = await http.post('/.netlify/functions/subscribeToNewsletter', { 
      email // فقط ایمیل ارسال شود، تاریخ در سرور تنظیم می‌شود
    });
    
    toast.success('عضویت در خبرنامه با موفقیت انجام شد');
    return response.data;
    
  } catch (error) {
    let errorMessage = 'خطا در عضویت خبرنامه';
    
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || errorMessage;
    }
    
    toast.error(errorMessage);
    throw error;
  }
};