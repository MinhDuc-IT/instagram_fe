import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}
