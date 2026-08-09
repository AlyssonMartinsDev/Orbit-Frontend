import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "../../modules/auth/pages/LoginPage";
import { DashboardPage } from "../../modules/dashboard/pages/DashboardPage";
import { ProtectedRoute } from "./guards/ProtectedRoute";
import { AppLayout } from "../../shared/layouts/AppLayout";

// Rotas
import { NotFoundPage } from "../../shared/pages/NotFoundPage";
import HomePage from "../../pages/HomePage";
import { ClientsOptionsPage } from "../../modules/clients/pages/ClientsOptionsPage";
import { WorkOrdersOptionsPage } from "../../modules/work-orders/pages/WorkOrdersOptionsPage";

// Clients Routes
import { CreateClientPage } from "../../modules/clients/pages/CreateClientPage";
import { ClientListPage } from "../../modules/clients/pages/ClientListPage";

// Work Orders Routes
import { CreateWorkOrderPage } from "../../modules/work-orders/pages/CreateWorkOrderPage";
import { EditWorkOrderPage } from "../../modules/work-orders/pages/EditWorkOrderPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },

    {
        path: "/dashboard",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <DashboardPage />
                </AppLayout>
            </ProtectedRoute>
        )
    },
    {
        path: "/clients",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <ClientsOptionsPage />
                </AppLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/work-orders",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <WorkOrdersOptionsPage />
                </AppLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/clients/create",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <CreateClientPage />
                </AppLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/clients/list",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <ClientListPage />
                </AppLayout>
            </ProtectedRoute>
        ),

    },
    {
        path: "/work-orders/create",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <CreateWorkOrderPage />
                </AppLayout>
            </ProtectedRoute>
        )
    },
    {
        path: "/work-orders/:id/edit",
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <EditWorkOrderPage />
                </AppLayout>
            </ProtectedRoute>
        )
    },











    {
        path: "*",
        element: <NotFoundPage />,
    }
]);


