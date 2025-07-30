import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { SafeUser, User } from "@/types/User";
import {
  login as loginService,
  register as registerService,
  updateUserProfile,
} from "@/services/authService";
import { toast } from "react-toastify";



interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const persistUser = (userData: SafeUser) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const clearUser = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  const login = async (email: string, password: string): Promise<SafeUser> => {
    try {
      const user = await loginService({ email, password });
      const { password: _unused, ...userWithoutPassword } = user;
      // console.log(_unused)
      persistUser(userWithoutPassword);
      // console.log(userWithoutPassword)
      toast.success(`${userWithoutPassword.name} عزیز خوش آمدی `);
      return userWithoutPassword;
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
      throw err;
    }
  };

  const isAdmin = () => user?.role === 'admin';

  const register = async (
    userData: Omit<User, "id" | "orders">
  ): Promise<SafeUser> => {
    try {
      const newUser = await registerService({
        ...userData,
        orders: [],
      });
      const { password: _unused, ...userWithoutPassword } = newUser;
      console.log(_unused)
      persistUser(userWithoutPassword);
      navigate("/");
      return userWithoutPassword;
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
      throw err;
    }
  };

  const logout = () => {
    clearUser();
    toast.info("شما از حساب خود خارج شدید");
    navigate("/login");
  };

  const updateUser = async (
    updatedData: Partial<User>
  ): Promise<SafeUser | undefined> => {
    if (!user?.id) return;

    try {
      const updatedUser = await updateUserProfile(Number(user.id), updatedData);
      const { password: _unused, ...userWithoutPassword } = updatedUser;
      toast.success('اطلاعات شما با موفقیت آپدیت شد')
      persistUser(userWithoutPassword);
      return userWithoutPassword;
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
      throw err;
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        clearUser();
      }
    }
    setIsLoading(false);
  }, []);

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAdmin,
    register,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
