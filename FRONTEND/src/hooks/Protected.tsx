import { Navigate } from "react-router-dom";
import { Role } from "../Pages/LoginPage";
import { useAuth } from "./Authcontext";

interface ProtectedRouteProps{
    children: React.ReactNode;
    role: Role;
}
export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
    const { userRole } = useAuth();

    if(userRole !== role){
        return <Navigate to="/" />
    }
    
    return (
        <div>
            {children}
        </div>
    )
}