import http from '@/services/httpService';
import { User, SafeUser } from '@/types/User';

export const getUsers = async (params: {
    page?: number;
    perPage?: number;
    search?: string;
  }): Promise<{ data: SafeUser[]; total: number }> => {
    try {
      const response = await http.get('/.netlify/functions/getUsers', {
        params
      });
  
      return {
        data: response.data,
        total: parseInt(response.headers['x-total-count'], 10) || 0
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };

export const createUser = async (userData: Omit<User, 'id'>): Promise<SafeUser> => {
  try {
    const response = await http.post('/.netlify/functions/manageUser', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (userId: string | number, userData: Partial<User>): Promise<SafeUser> => {
  try {
    const response = await http.patch('/.netlify/functions/manageUser', userData, {
      params: { id: userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string | number): Promise<void> => {
  try {
    await http.delete('/.netlify/functions/manageUser', {
      params: { id: userId }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};