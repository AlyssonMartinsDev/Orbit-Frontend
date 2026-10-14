import { Outlet, ScrollRestoration } from "react-router-dom";
import { ProtectedRoute } from "./guards/ProtectedRoute";
import { AppLayout } from "../../shared/layouts/AppLayout";
import { Loading } from "../../shared/components/loading";

export function Root() {
    return (
        <>
            <Outlet />
            <ScrollRestoration />
        </>
    );
}
export function InitialLoading() {
    return <Loading message="Abrindo Orbit…" />;
}
export function ProtectedLayout() {
    return (
        <ProtectedRoute>
            <AppLayout>
                <Outlet />
            </AppLayout>
        </ProtectedRoute>
    );
}
