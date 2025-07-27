// AuthContext.ts
import { createContext } from "react";
import { User } from "@/types/User";

type SafeUser = Omit<User, "password">;

export interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<SafeUser>;
  register: (userData: Omit<User, "id" | "orders">) => Promise<SafeUser>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => Promise<SafeUser | undefined>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
