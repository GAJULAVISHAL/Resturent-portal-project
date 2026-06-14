import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Role } from "../types";
import { useAuth } from "./Authcontext";
import { WaiterLoading } from "../components/Loading";

interface ProtectedRouteProps{
    children: React.ReactNode;
    role: Role;
}
export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
    const { userRole, isAuthenticated, authChecked, loading, verifySession } = useAuth();

    useEffect(() => {
        if (!authChecked && !loading) {
            void verifySession();
        }
    }, [authChecked, loading, verifySession]);

    if (!authChecked || loading) {
        return <WaiterLoading />;
    }

    if(isAuthenticated === false){
        return <Navigate to="/" />
    }

    if(isAuthenticated && userRole !== role){
        return <Navigate to="/unAuthorized" />
    }       
    
    return (
        <div>
            {children}
        </div>
    )
}