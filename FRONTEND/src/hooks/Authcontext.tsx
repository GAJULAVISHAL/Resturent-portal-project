import React, { createContext, useCallback, useContext, useState } from "react";
import axios from "axios";
import { Role } from "../types";

let cachedSessionRole: Role | null | undefined;
let cachedSessionChecked = false;

interface AuthContextProps {
    userRole: Role | null;
    isAuthenticated: boolean;
    authChecked: boolean;
    loading: boolean;
    login: (role: Role) => void;
    logout: () => Promise<void>;
    verifySession: () => Promise<Role | null>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [userRole, setUserRole] = useState<Role | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [authChecked, setAuthChecked] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const verifySession = useCallback(async () => {
        if (cachedSessionChecked) {
            if (cachedSessionRole) {
                setUserRole(cachedSessionRole);
                setIsAuthenticated(true);
            } else {
                setUserRole(null);
                setIsAuthenticated(false);
            }

            setAuthChecked(true);
            return cachedSessionRole ?? null;
        }

        setLoading(true);

        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/profile`, {
                withCredentials: true,
            });

            if (response.data?.user) {
                const role = response.data.user.role as Role;
                cachedSessionRole = role;
                cachedSessionChecked = true;
                setUserRole(role);
                setIsAuthenticated(true);
                setAuthChecked(true);
                return role;
            }

            cachedSessionRole = null;
            cachedSessionChecked = true;
            setUserRole(null);
            setIsAuthenticated(false);
            setAuthChecked(true);
            return null;
        } catch (error) {
            cachedSessionRole = null;
            cachedSessionChecked = true;
            setUserRole(null);
            setIsAuthenticated(false);
            setAuthChecked(true);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // This function can be called from your login page *after* the
    // login API call has succeeded and set the cookie.
    const login = (role: Role) => {
        cachedSessionRole = role;
        cachedSessionChecked = true;
        setUserRole(role);
        setIsAuthenticated(true);
        setAuthChecked(true);
    };

    // Logout must now call a backend endpoint to clear the HttpOnly cookie.
    const logout = async () => {
        try {
            // You need an endpoint that clears the authentication cookie.
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/logout`, {}, {
                withCredentials: true,
            });
        } catch (error) {
            console.error("Logout failed on the server:", error);
        } finally {
            cachedSessionRole = null;
            cachedSessionChecked = false;
            setUserRole(null);
            setIsAuthenticated(false);
            setAuthChecked(true);
        }
    };

    return (
        <AuthContext.Provider value={{ userRole, isAuthenticated, authChecked, loading, login, logout, verifySession }}>
            {children}
        </AuthContext.Provider>
    );
};

// useAuth hook remains the same
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};