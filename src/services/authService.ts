
// export const register = async (userData: Omit<User, "id">): Promise<User> => {
 
//   try {
//     // بررسی وجود کاربر با ایمیل مشابه
//     const { data: existingUsers } = await http.get('/users', {
//       params: { email: userData.email },
//     });

//     if (existingUsers.length > 0) {
//       throw new Error('این ایمیل قبلا ثبت شده است');
//     }

//     // ایجاد کاربر جدید
//     const { data: newUser } = await http.post('/users', {
//       ...userData,
//       id: Date.now(), // تولید ID منحصر به فرد
//     });
//     console.log(newUser)
//     return newUser;
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       toast.error(error.message);
//       throw error;
//     } else {
//       toast.error('خطای ناشناخته‌ای رخ داده است');
//       throw new Error('Unknown error');
//     }
//   }
// };

// export const login = async (loginData: LoginData): Promise<User> => {
//   try {
//     const { data: users } = await http.get('/users', {
//       params: { 
//         email: loginData.email,
//         password: loginData.password 
//       },
//     });

//     if (users.length === 0) {
//       throw new Error('ایمیل یا رمز عبور اشتباه است');
//     }

//     return users[0];
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       toast.error(error.message);
//       throw error;
//     } else {
//       toast.error('خطای ناشناخته‌ای رخ داده است');
//       throw new Error('Unknown error');
//     }
//   }
// };

// export const updateUserProfile = async (userId: number, userData: Partial<User>): Promise<User> => {
//   try {
//     const { data: updatedUser } = await http.patch(`/users/${userId}`, userData);
//     return updatedUser;
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       toast.error(error.message);
//       throw error;
//     } else {
//       toast.error('خطای ناشناخته‌ای رخ داده است');
//       throw new Error('Unknown error');
//     }
//   }
// };

// export const getUserById = async (userId : number ) : Promise<User> =>{
//   try {
//     const { data: updatedUser } = await http.get(`/users/${userId}`);
//     return updatedUser;
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       toast.error(error.message);
//       throw error;
//     } else {
//       toast.error('خطای ناشناخته‌ای رخ داده است');
//       throw new Error('Unknown error');
//     }
// }
// }

// src/services/authService.ts
import http from "./httpService";
import { toast } from "react-toastify";
import { LoginData, User, SafeUser } from "@/types/User";

export const register = async (userData: Omit<User, "id">): Promise<SafeUser> => {
  try {
    const response = await http.post('/.netlify/functions/register', userData);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته در ثبت نام';
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const login = async (loginData: LoginData): Promise<{user: SafeUser, token: string}> => {
  try {
    const response = await http.post('/.netlify/functions/login', loginData);
    localStorage.setItem('token', response.data?.token);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته در ورود';
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const updateUserProfile = async (userId: number, userData: Partial<User>): Promise<SafeUser> => {
  try {
    const response = await http.patch(`/.netlify/functions/updateUserProfile?id=${userId}`, userData);
    return response.data.user;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته در به‌روزرسانی پروفایل';
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getUserById = async (userId: number): Promise<SafeUser> => {
  try {
    const response = await http.get(`/.netlify/functions/get-user?id=${userId}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته در دریافت اطلاعات کاربر';
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
