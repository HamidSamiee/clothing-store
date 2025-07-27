import http from '@/services/httpService';
import { toast } from 'react-toastify';


export const subscribeToNewsletter = async (email: string) => {
  try {
    const response = await http.post('/newsletterSubscriptions', { 
      email,
      subscribedAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    toast.error(error)
    throw error;
  }
};