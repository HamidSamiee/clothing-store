export interface User {
  id: string | number;
  name: string;
  email: string;
  password?: string;
  address?: string;
  phone?: string;
  orders?: number[];
  role: 'user' | 'admin';
}

export interface LoginData {
  email: string;
  password: string;
}

export type SafeUser = Omit<User, "password">;