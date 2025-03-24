import React, { createContext, useContext, useState } from "react";
import type { UserAuth } from "../utils/interface.ts";

// Define types for auth state
interface AuthContextType {
  userAuth: UserAuth | null; // Access token (or null if not authenticated)
  setUserAuth: (user: UserAuth | null) => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userAuth, setUserAuth] = useState<UserAuth | null>(null);

  return <AuthContext.Provider value={{ userAuth, setUserAuth }}>{children}</AuthContext.Provider>;
};
