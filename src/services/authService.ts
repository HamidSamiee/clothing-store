// src/services/authService.ts
import { LoginData, User } from "@/types/User";
import http from "./httpService";
import { toast } from "react-toastify";

export const register = async (userData: Omit<User, "id">): Promise<User> => {
  console.log(userData)
  try {
    // بررسی وجود کاربر با ایمیل مشابه
    const { data: existingUsers } = await http.get('/users', {
      params: { email: userData.email },
    });

    if (existingUsers.length > 0) {
      throw new Error('این ایمیل قبلا ثبت شده است');
    }

    // ایجاد کاربر جدید
    const { data: newUser } = await http.post('/users', {
      ...userData,
      id: Date.now(), // تولید ID منحصر به فرد
    });
    console.log(newUser)
    return newUser;
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error.message);
      throw error;
    } else {
      toast.error('خطای ناشناخته‌ای رخ داده است');
      throw new Error('Unknown error');
    }
  }
};

export const login = async (loginData: LoginData): Promise<User> => {
  try {
    const { data: users } = await http.get('/users', {
      params: { 
        email: loginData.email,
        password: loginData.password 
      },
    });

    if (users.length === 0) {
      throw new Error('ایمیل یا رمز عبور اشتباه است');
    }

    return users[0];
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error.message);
      throw error;
    } else {
      toast.error('خطای ناشناخته‌ای رخ داده است');
      throw new Error('Unknown error');
    }
  }
};

export const updateUserProfile = async (userId: number, userData: Partial<User>): Promise<User> => {
  try {
    const { data: updatedUser } = await http.patch(`/users/${userId}`, userData);
    return updatedUser;
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error.message);
      throw error;
    } else {
      toast.error('خطای ناشناخته‌ای رخ داده است');
      throw new Error('Unknown error');
    }
  }
};

export const getUserById = async (userId : number ) : Promise<User> =>{
  try {
    const { data: updatedUser } = await http.get(`/users/${userId}`);
    return updatedUser;
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error.message);
      throw error;
    } else {
      toast.error('خطای ناشناخته‌ای رخ داده است');
      throw new Error('Unknown error');
    }
}
}