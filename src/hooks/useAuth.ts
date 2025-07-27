import { AuthContext } from "@/contexts/AuthContext";
import { useContext } from "react";

// Hook برای استفاده از AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };