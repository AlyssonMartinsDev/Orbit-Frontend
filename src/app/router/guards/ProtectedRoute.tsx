import { Fragment } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../../shared/store/auth.store"

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children} : ProtectedRouteProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const sessionId = useAuthStore((state) => state.sessionId);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Fragment key={sessionId}>{children}</Fragment>;
}
