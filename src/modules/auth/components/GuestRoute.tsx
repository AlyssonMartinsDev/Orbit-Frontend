import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../../shared/store/auth.store";

interface GuestRouteProps {
    children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated
    );

    // Se já estiver autenticado,
    // não permite acessar páginas de visitante.
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}