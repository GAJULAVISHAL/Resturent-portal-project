import React, { createContext, useContext, useState } from "react";
import { Role } from "../Pages/LoginPage";

interface AuthContextProps {
  userRole: Role | null;
  setUserRole: (role: Role | null) => void; // Function to set the role
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children } : { children: React.ReactNode }) => {
  const [userRole, setUserRole] = useState<Role | null>(null); // Initially, no role is set

  return (
    <AuthContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
